/* eslint-disable react/no-unknown-property */
import React, { useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { ComponentProps } from '../../../types/types';

// ── Layout ───────────────────────────────────────────────────────────────────
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BINS       = 12;
const REDUCE     = 0.8;       // multiplier to tone down bar heights (for better visibility)
const LINE_WIDTH = 2;         // screen-space pixel width for fat lines
const X_SEC      = 3.0;       // world-units per second of audio
const Z_GAP      = 0.5;       // spacing between note lanes
const PEAK_Y     = 3;  				// max height
const MIN_Y      = 0;         // minimum line height
const AHEAD      = 0;         // orbit target leads the playhead by this many world-units
const CAM_DY     = 3.8;       // camera height above target
const CAM_DZ     = 7;         // camera z-offset (side viewing angle)
const CAM_DX     = 0;         // camera slightly behind target


function makeBackdropTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  if (!ctx) {
    return null;
  }

  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(1, '#06021c');
  grad.addColorStop(.15, '#220646');
  grad.addColorStop(0, 'rgb(20, 2, 35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  const glow = ctx.createRadialGradient(c.width * 0.56, c.height * 0.38, 40, c.width * 0.56, c.height * 0.38, 560);
  glow.addColorStop(0, 'rgba(94, 58, 180, 0.34)');
  glow.addColorStop(0.45, 'rgba(70, 42, 145, 0.16)');
  glow.addColorStop(1, 'rgba(10, 8, 24, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
  ctx.lineWidth = 1;
  for (let y = 0; y < c.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(c.width, y + 0.5);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  return tex;
}

// ── Magma colormap ───────────────────────────────────────────────────────────
const MAGMA = [
  [0, 0, 4], [42, 8, 96], [125, 22, 131],
  [212, 73, 90], [249, 163, 63], [252, 253, 191],
] as const;
function magma(v: number): THREE.Color {
  const t   = Math.max(0, Math.min(1, v / 255));
  const idx = t * (MAGMA.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.min(lo + 1, MAGMA.length - 1);
  const f   = idx - lo;
  return new THREE.Color(
    (MAGMA[lo][0] * (1 - f) + MAGMA[hi][0] * f) / 255,
    (MAGMA[lo][1] * (1 - f) + MAGMA[hi][1] * f) / 255,
    (MAGMA[lo][2] * (1 - f) + MAGMA[hi][2] * f) / 255,
  ).addScalar(-.15); // TODO: Change this? 
}

// ═════════════════════════════════════════════════════════════════════════════
//  Scene sub-components (live inside <Canvas>)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * 12 continuous line-strips — one per chromatic note (C through B).
 * Each vertex's Y position = amplitude, colour = amplitude from warm palette.
 * Geometry is built once and never updated — only the camera moves.
 */
function FrequencyLines({ specData, fps }: { specData: number[][]; fps: number }) {
  const N  = specData.length;
  const dx = X_SEC / fps;

  const lineObjects = useMemo(() => {
    const objs: Line2[] = [];

    for (let bin = 0; bin < BINS; bin++) {
      const positions: number[] = [];
      const colors:    number[] = [];

      for (let t = 0; t < N; t++) {
        const v   = specData[t]?.[bin] ?? 0;
        const col = magma(v);
        positions.push(t * dx, (v / 255) * PEAK_Y, bin * Z_GAP);
        colors.push(col.r, col.g, col.b);
      }

      const geo = new LineGeometry();
      geo.setPositions(positions);
      geo.setColors(colors);

      const mat = new LineMaterial({
        linewidth:    LINE_WIDTH,
        vertexColors: true,
        toneMapped:   false,
        transparent:  true,
        opacity:      1,
        worldUnits:   false,           // width is in screen pixels
        resolution:   new THREE.Vector2(1280, 720), // initial; updated below
      });

      objs.push(new Line2(geo, mat));
    }

    return objs;
  }, [specData, N, dx]);

  // Keep LineMaterial.resolution in sync with the canvas size
  useFrame(({ size }) => {
    lineObjects.forEach(l => {
      (l.material as LineMaterial).resolution.set(size.width, size.height);
    });
  });

  // Dispose geometry/material on unmount
  useEffect(() => () => {
    lineObjects.forEach(l => {
      l.geometry.dispose();
      (l.material as THREE.Material).dispose();
    });
  }, [lineObjects]);

  return (
    <group>
      {lineObjects.map((obj, i) => (
        <primitive key={i} object={obj} />
      ))}
    </group>
  );
}

/**
 * Note names (C–B) pinned to the left side of the visible window.
 * They follow the playhead so they remain on-screen at all times.
 */
function NoteLabels({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement> }) {
  const group = useRef<THREE.Group>(null);
  const X = 1.2;
  const Y = PEAK_Y + 0.42;

  useFrame(() => {
    if (!audioRef.current || !group.current) { return; }
    group.current.position.x = audioRef.current.currentTime * X_SEC - 1.2;
  });

  return (
    <group ref={group}>
      {NOTE_NAMES.map((n, i) => {
        const hBarLen = ((1 - (i + 1)/NOTE_NAMES.length) + 0.1);
        const hBarX = hBarLen/2 + X;

        return (
          <group key={n} position={[0, 0, i * Z_GAP]}>

            {/* Vertical Bar */}
            <mesh position={[X, Y * 0.5, 0]}>
              <boxGeometry args={[0.014, Y, 0.014]} />
              <meshBasicMaterial
                color="#7d82ff"
                transparent
                opacity={0.55}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>

            {/* Horizontal Bar */}
            <mesh position={[hBarX, Y - .01, 0]}>
              <boxGeometry args={[hBarLen, 0.016, 0.016]} />
              <meshBasicMaterial
                color="#7d82ff"
                transparent
                opacity={0.55}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>

            <Text
              position={[hBarLen + X, Y, 0]}
              fontSize={0.2}
              color="#ffffff"
              anchorX="left"
              anchorY="middle"
              outlineColor={'black'}
              outlineWidth={.005}
            >
              {n}
            </Text>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Smoothly slides camera + orbit target along the time axis (X)
 * to follow playback. Combined with fog and locked orbit angles
 * this ensures a fixed-size viewport regardless of song duration —
 * a 30-second clip and a 10-minute track look identical at any
 * given moment.
 */
function CameraRig({
  audioRef,
  ctrlRef,
}: {
  audioRef: React.RefObject<HTMLAudioElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctrlRef: React.MutableRefObject<any>;
}) {
  useFrame(() => {
    const a = audioRef.current;
    const c = ctrlRef.current;
    if (!a || !c) { return; }

    const goalX = a.currentTime * X_SEC + AHEAD;
    const dx    = (goalX - c.target.x) * 0.055;

    c.target.x          += dx;
    c.object.position.x += dx;
    c.update();
  });

  return null;
}

function SceneBackdrop() {
  const { scene } = useThree();
  const texture = useMemo(() => makeBackdropTexture(), []);

  useEffect(() => {
    const prevBackground = scene.background;
    const prevFog = scene.fog;

    if (texture) {
      scene.background = texture;
    }
    scene.fog = new THREE.Fog('#090815', 12, 42);

    return () => {
      scene.background = prevBackground;
      scene.fog = prevFog;
      if (texture?.isTexture) {
        texture.dispose();
      }
    };
  }, [scene, texture]);

  return null;
}

/**
 * Every (timeFrame × chromaBin) pair → one thin instanced box.
 * Height and color both represent amplitude (magma colormap).
 * Built once and never updated — only camera/playhead move per frame.
 */
function Bars({ specData, fps }: { specData: number[][]; fps: number }) {
  const meshRef   = useRef<THREE.InstancedMesh>(null);
  const N         = specData.length;
  const count     = N * BINS;
  const xPerFrame = X_SEC / fps;

  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) { return; }

    const obj  = new THREE.Object3D();
    const barW = xPerFrame * 1;  // thin in x (time direction)
    const barD = 0.08;              // thin in z (note direction)

    for (let t = 0; t < N; t++) {
      for (let n = 0; n < BINS; n++) {
        const i   = t * BINS + n;
        const val = specData[t][n] ?? 0;
        const h   = Math.max(MIN_Y, (val / 255) * PEAK_Y * REDUCE);

        obj.position.set(t * xPerFrame, h / 2, n * Z_GAP);
        obj.scale.set(barW, h, barD);
        obj.updateMatrix();
        mesh.setMatrixAt(i, obj.matrix);
        mesh.setColorAt(i, magma(val));
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) { mesh.instanceColor.needsUpdate = true; }
  }, [specData, fps, N, xPerFrame, geo, mat]);

  return <instancedMesh ref={meshRef} args={[geo, mat, count]} frustumCulled={false} />;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Exported component
// ═════════════════════════════════════════════════════════════════════════════
export const Spectrogram: React.FC<ComponentProps> = ({ data, audioRef }) => {
  const spec = data.spectrogram_data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctrlRef = useRef<any>(null);

  if (!spec || spec.length === 0) {
    return (
      <div style={S.empty}>
        <p style={{ fontSize: 15, margin: 0, color: '#666' }}>
          Spectrogram data unavailable.
        </p>
        <p style={{ fontSize: 12, margin: 0, color: '#444' }}>
          The backend did not return <code>spectrogram_data</code>.
        </p>
      </div>
    );
  }

  const fps  = data.fps || 27;
  const midZ = ((BINS - 1) * Z_GAP) / 2;

  return (
    <div style={S.root}>
      <div style={S.canvasWrap}>
        <Canvas
          style={{ position: 'absolute', inset: 0 }}
          dpr={[1, 2]}
          camera={{
            position: [AHEAD + CAM_DX, CAM_DY, midZ + CAM_DZ],
            fov: 52,
            near: 0.1,
            far: 250,
          }}
        >
          <SceneBackdrop />
          <FrequencyLines specData={spec} fps={fps} />
          <NoteLabels audioRef={audioRef} />
          <Bars specData={data.spectrogram_data} fps={fps} />

          <OrbitControls
            ref={ctrlRef}
            target={[AHEAD, PEAK_Y * 0.3, midZ]}
            enablePan={false}
            enableZoom
            enableDamping
            dampingFactor={0.08}
            zoomSpeed={0.6}
            rotateSpeed={0.4}
            minDistance={3}
            maxDistance={8}
            // controls the camera angles
            minAzimuthAngle={-Math.PI / 8}
            maxAzimuthAngle={Math.PI / 8}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />

          <CameraRig audioRef={audioRef} ctrlRef={ctrlRef} />
        </Canvas>
      </div>

      <div style={S.legend}>
        <span style={S.legendLabel}>Silent</span>
        <div style={S.grad} />
        <span style={S.legendLabel}>Peak</span>
      </div>
    </div>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column',
    width: '100%', height: '100%', gap: 5,
  },
  title: {
    color: '#aaa', fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.06em',
  },
  canvasWrap: {
    flex: 1, minHeight: 280, position: 'relative',
  },
  legend: {
    display: 'flex', alignItems: 'center', gap: 8,
    justifyContent: 'flex-end', paddingRight: 6, paddingBottom: 2,
  },
  legendLabel: {
    color: '#666', fontSize: 10, fontFamily: 'monospace',
  },
  grad: {
    width: 80, height: 8, borderRadius: 2,
    background: 'linear-gradient(to right, rgb(6,2,28), rgb(32,8,100), rgb(88,18,148), rgb(168,44,96), rgb(232,112,36), rgb(252,208,56), rgb(255,252,188))',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '100%', gap: 8,
  },
};
