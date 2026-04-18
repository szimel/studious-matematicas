/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SherlockReport } from '../../../pages/seeing-sounds/Analysis';
import { ComponentProps } from '../../../types/types';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const CHORD_INTERVALS: Record<string, number[]> = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
};

const NOTE_TO_INDEX = new Map<string, number>(NOTES.map((n, i) => [n, i]));
const NOTE_SET = new Set<string>(NOTES);

// chordIntensityGain: 1.36,
// noteIntensityGain: 1.42,
// pairIntensityGain: 1.4,
// ambientIntensityGain: 1.16,
// deformationGain: 1.34,
// extrudeProbabilityGain: 1.34,
// extrudeDistanceGain: 2.3,
// colorBlendGain: 1,
// colorSaturationGain: 1,
// colorLightnessGain: 1.3,
// ridgeGain: 1.32,
// twistGain: 1.28,
// maxAmpAbs: 1,

// Set tuning of model params here
const FINGERPRINT_TUNING = {
  global: {
    chordIntensityGain: 1.66,
    noteIntensityGain: 1.62,
    pairIntensityGain: 1.6,
    ambientIntensityGain: 1.36,
    deformationGain: 1.64,
    extrudeProbabilityGain: 1.64,
    extrudeDistanceGain: 3,
    colorBlendGain: 3.5,
    colorSaturationGain: 2.5,
    colorLightnessGain: 1,
    ridgeGain: 1.32,
    twistGain: 1.28,
    maxAmpAbs: 1,
  },
  geometry: {
    radialQuantStepBase: 0.0021,
    radialQuantStepFacetScale: 0.0116,
    ridgeStrengthScale: .68,
  },
} as const;

type FeatureKind = 'CHORD' | 'NOTE' | 'AMBIENT';

type Feature = {
  start: number;
  kind: FeatureKind;

  axes: THREE.Vector3[];
  amp: number;
  width: number;
  sharp: number;
  facet: number;
  ridge: number;
  twist: number;
  noise: number;
  ridgeN: THREE.Vector3;
  seed: number;

  intensity: number;

  extrude: boolean;
  extrudeDist: number;
  extrudeInset: number;
  extrudeSign: 1 | -1;

  color: THREE.Color;
};

type ParsedEntry = {
  count: number;
  seconds: number;
  pct: number;
};

type FingerprintStats = {
  fingerprintCount: number;
  relatedRatio: number;
  notePairCount: number[];
  noteRelatedRatio: number[];
  chordPairCount: Record<string, number>;
  chordRelatedRatio: Record<string, number>;
  firstStartByChord: Record<string, number>;
  firstStartByNote: Array<number | null>;
  maxPairDuration: number;
};

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function clamp01(x: number) {
  return clamp(x, 0, 1);
}

function easeOutCubic(x: number) {
  x = clamp01(x);
  return 1 - Math.pow(1 - x, 3);
}

// deterministic hash -> 0..1
function hash01(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

// pseudo noise [-1,1]
function noise3(x: number, y: number, z: number, seed: number) {
  const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed * 19.19) * 43758.5453;
  const f = s - Math.floor(s);
  return f * 2 - 1;
}

function normalizeQuality(quality: string | null): string {
  if (!quality) {
    return 'maj';
  }

  const q = quality.trim().toLowerCase();
  if (q === 'm' || q === 'minor') {
    return 'min';
  }
  if (q === 'major') {
    return 'maj';
  }
  return q;
}

function qualityFamily(quality: string | null): 'maj' | 'min' {
  const q = normalizeQuality(quality);
  if (q === 'min' || q.startsWith('min') || q === 'dim') {
    return 'min';
  }
  return 'maj';
}

function parseChordLabel(label: string): { root: string | null; quality: string | null; noChord: boolean } {
  const t = (label || '').trim();
  if (!t || t === 'N' || (t.toLowerCase().includes('no') && t.toLowerCase().includes('chord'))) {
    return { root: null, quality: null, noChord: true };
  }

  if (!t.includes(':')) {
    return { root: null, quality: null, noChord: true };
  }

  const [rawRoot, rawQuality] = t.split(':', 2).map((part) => part.trim());
  if (!NOTE_SET.has(rawRoot)) {
    return { root: null, quality: null, noChord: true };
  }

  return { root: rawRoot, quality: normalizeQuality(rawQuality), noChord: false };
}

function parseChordKey(key: string): { root: string | null; quality: 'maj' | 'min' | null } {
  const t = (key || '').trim();
  if (!t) {
    return { root: null, quality: null };
  }

  if (t.endsWith('m')) {
    const root = t.slice(0, -1);
    if (NOTE_SET.has(root)) {
      return { root, quality: 'min' };
    }
  }

  if (NOTE_SET.has(t)) {
    return { root: t, quality: 'maj' };
  }

  return { root: null, quality: null };
}

function buildIcosaNoteDirs(): THREE.Vector3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const pts = [
    new THREE.Vector3(0, 1, phi),
    new THREE.Vector3(0, 1, -phi),
    new THREE.Vector3(0, -1, phi),
    new THREE.Vector3(0, -1, -phi),

    new THREE.Vector3(1, phi, 0),
    new THREE.Vector3(1, -phi, 0),
    new THREE.Vector3(-1, phi, 0),
    new THREE.Vector3(-1, -phi, 0),

    new THREE.Vector3(phi, 0, 1),
    new THREE.Vector3(phi, 0, -1),
    new THREE.Vector3(-phi, 0, 1),
    new THREE.Vector3(-phi, 0, -1),
  ];
  return pts.map((v) => v.normalize());
}

const NOTE_DIRS = buildIcosaNoteDirs();

function jitterDir(dir: THREE.Vector3, seed: number, maxAngleRad: number) {
  const axis = new THREE.Vector3(hash01(seed) - 0.5, hash01(seed + 1) - 0.5, hash01(seed + 2) - 0.5).normalize();
  const angle = (hash01(seed + 3) - 0.5) * 2 * maxAngleRad;
  return dir.clone().applyAxisAngle(axis, angle).normalize();
}

// color helper: note -> hue, with energy/intensity influence
function noteHue(noteIdx: number) {
  return (noteIdx % 12) / 12;
}

function colorFromNote(noteIdx: number, quality: 'maj' | 'min' | null, intensity: number) {
  const h = noteHue(noteIdx);
  const s = quality === 'min' ? 0.75 : 0.62;
  const l = quality === 'min' ? 0.42 : 0.52;
  const c = new THREE.Color();
  c.setHSL(
    h,
    clamp01(s + 0.15 * intensity * FINGERPRINT_TUNING.global.colorSaturationGain),
    clamp01(l + 0.18 * intensity * FINGERPRINT_TUNING.global.colorLightnessGain),
  );
  return c;
}

function readParsedEntry(raw: unknown): ParsedEntry {
  if (!raw || typeof raw !== 'object') {
    return { count: 0, seconds: 0, pct: 0 };
  }

  const rec = raw as Record<string, unknown>;
  const count = typeof rec.count === 'number' && Number.isFinite(rec.count) ? rec.count : 0;
  const seconds = typeof rec.seconds === 'number' && Number.isFinite(rec.seconds) ? rec.seconds : 0;
  const pct = typeof rec.pct === 'number' && Number.isFinite(rec.pct) ? clamp01(rec.pct) : 0;

  return { count, seconds, pct };
}

function chordToneIndices(rootIdx: number, quality: string | null) {
  const q = normalizeQuality(quality);
  const ints = CHORD_INTERVALS[q]
    || (q.startsWith('min') ? CHORD_INTERVALS.min : CHORD_INTERVALS.maj);

  return ints.map((x) => (rootIdx + x) % 12);
}

function chordKeyFromFingerprintLabel(label: string): string | null {
  const parsed = parseChordLabel(label);
  if (parsed.noChord || !parsed.root) {
    return null;
  }

  return qualityFamily(parsed.quality) === 'min' ? `${parsed.root}m` : parsed.root;
}

function readFingerprintStats(raw: SherlockReport['fingerprint']['summary'] | null | undefined): FingerprintStats {
  const fallback: FingerprintStats = {
    fingerprintCount: 1,
    relatedRatio: 0,
    notePairCount: new Array(12).fill(0),
    noteRelatedRatio: new Array(12).fill(0),
    chordPairCount: {},
    chordRelatedRatio: {},
    firstStartByChord: {},
    firstStartByNote: new Array(12).fill(null),
    maxPairDuration: 0.05,
  };

  if (!raw || typeof raw !== 'object') {
    return fallback;
  }

  const fingerprintCount = typeof raw.fingerprintCount === 'number' && Number.isFinite(raw.fingerprintCount)
    ? Math.max(1, raw.fingerprintCount)
    : 1;

  const relatedRatio = typeof raw.relatedRatio === 'number' && Number.isFinite(raw.relatedRatio)
    ? clamp01(raw.relatedRatio)
    : 0;

  const notePairCount = Array.isArray(raw.notePairCount)
    ? new Array(12).fill(0).map((_, idx) => {
      const v = raw.notePairCount[idx];
      return typeof v === 'number' && Number.isFinite(v) ? Math.max(0, v) : 0;
    })
    : fallback.notePairCount;

  const noteRelatedRatio = Array.isArray(raw.noteRelatedRatio)
    ? new Array(12).fill(0).map((_, idx) => {
      const v = raw.noteRelatedRatio[idx];
      return typeof v === 'number' && Number.isFinite(v) ? clamp01(v) : relatedRatio;
    })
    : new Array(12).fill(relatedRatio);

  const firstStartByNote = Array.isArray(raw.firstStartByNote)
    ? new Array(12).fill(null).map((_, idx) => {
      const v = raw.firstStartByNote[idx];
      return typeof v === 'number' && Number.isFinite(v) ? v : null;
    })
    : fallback.firstStartByNote;

  const chordPairCount = raw.chordPairCount && typeof raw.chordPairCount === 'object'
    ? raw.chordPairCount
    : {};

  const chordRelatedRatio = raw.chordRelatedRatio && typeof raw.chordRelatedRatio === 'object'
    ? raw.chordRelatedRatio
    : {};

  const firstStartByChord = raw.firstStartByChord && typeof raw.firstStartByChord === 'object'
    ? raw.firstStartByChord
    : {};

  const maxPairDuration = typeof raw.maxPairDuration === 'number' && Number.isFinite(raw.maxPairDuration)
    ? Math.max(0.05, raw.maxPairDuration)
    : 0.05;

  return {
    fingerprintCount,
    relatedRatio,
    notePairCount,
    noteRelatedRatio,
    chordPairCount,
    chordRelatedRatio,
    firstStartByChord,
    firstStartByNote,
    maxPairDuration,
  };
}

function tonalAxisFromParsedNotes(noteMap: Record<string, unknown>): THREE.Vector3 {
  let vx = 0;
  let vy = 0;
  let vz = 0;
  let sum = 0;

  for (let i = 0; i < NOTES.length; i++) {
    const note = NOTES[i];
    const stats = readParsedEntry(noteMap[note]);
    const weight = stats.pct > 0 ? stats.pct : stats.count;
    sum += weight;
    vx += NOTE_DIRS[i].x * weight;
    vy += NOTE_DIRS[i].y * weight;
    vz += NOTE_DIRS[i].z * weight;
  }

  const axis = new THREE.Vector3(vx, vy, vz);
  if (axis.lengthSq() < 1e-8 || sum < 1e-8) {
    return new THREE.Vector3(0.2, 0.7, 0.1).normalize();
  }

  return axis.normalize();
}

function buildFeatures(data: SherlockReport): Feature[] {
  const feats: Feature[] = [];

  const duration = Math.max(0.0001, data.duration || 1);
  const chordMap = (data.parsed_chords ?? {}) as Record<string, unknown>;
  const noteMap = (data.parsed_notes ?? {}) as Record<string, unknown>;
  const stats = readFingerprintStats(data.fingerprint?.summary);
  const sampledRows = Array.isArray(data.fingerprint?.sampled) ? data.fingerprint.sampled : [];

  const chordEntries = Object.entries(chordMap)
    .map(([key, raw]) => [key, readParsedEntry(raw)] as const)
    .filter(([, parsed]) => parsed.count > 0 || parsed.seconds > 0 || parsed.pct > 0)
    .sort((a, b) => b[1].pct - a[1].pct);

  const noteEntries = NOTES
    .map((note) => [note, readParsedEntry(noteMap[note])] as const)
    .filter(([, parsed]) => parsed.count > 0 || parsed.seconds > 0 || parsed.pct > 0)
    .sort((a, b) => b[1].pct - a[1].pct);

  const maxChordCount = Math.max(1, ...chordEntries.map(([, parsed]) => parsed.count));
  const maxNoteCount = Math.max(1, ...noteEntries.map(([, parsed]) => parsed.count));

  // Macro harmonic scaffold from parsed_chords.
  for (let i = 0; i < chordEntries.length; i++) {
    const [chordKey, parsedStats] = chordEntries[i];
    const chord = parseChordKey(chordKey);
    if (!chord.root || !chord.quality) {
      continue;
    }

    const rootIdx = NOTE_TO_INDEX.get(chord.root);
    if (rootIdx === undefined) {
      continue;
    }

    const seed = 41.3 + i * 13.91 + rootIdx * 2.71;
    const countN = clamp01(parsedStats.count / maxChordCount);
    const secondsN = clamp01(parsedStats.seconds / duration);
    const pctN = clamp01(parsedStats.pct);
    const pairDensity = clamp01((stats.chordPairCount[chordKey] ?? 0) / stats.fingerprintCount);
    const relatedN = stats.chordRelatedRatio[chordKey] ?? stats.relatedRatio;

    const intensity = clamp01(
      (0.38 * pctN + 0.24 * secondsN + 0.18 * countN + 0.20 * relatedN)
      * FINGERPRINT_TUNING.global.chordIntensityGain,
    );
    const centroid = clamp01(0.22 + 0.52 * pctN + 0.22 * pairDensity);
    const contrast = clamp01(0.25 + 0.50 * Math.abs(relatedN - 0.5) + 0.30 * countN);

    const tones = chordToneIndices(rootIdx, chord.quality);
    const axes = tones.map((toneIdx, j) => jitterDir(NOTE_DIRS[toneIdx], seed + j * 7.1, 0.16));

    const ampSign: 1 | -1 = chord.quality === 'min' ? -1 : 1;
    const amp = clamp(
      ampSign * (0.08 + 0.26 * intensity) * (0.75 + 0.55 * secondsN) * FINGERPRINT_TUNING.global.deformationGain,
      -FINGERPRINT_TUNING.global.maxAmpAbs,
      FINGERPRINT_TUNING.global.maxAmpAbs,
    );
    const width = 0.09 + 0.22 * secondsN + 0.08 * (1 - centroid);
    const sharp = 1.7 + 2.3 * centroid + 1.2 * contrast;
    const facet = clamp01(0.24 + 0.72 * contrast);
    const ridge = clamp01((chord.quality === 'min'
      ? clamp01(0.35 + 0.45 * centroid)
      : clamp01(0.22 + 0.55 * (1 - centroid))) * FINGERPRINT_TUNING.global.ridgeGain);

    const twist = (chord.quality === 'min' ? 1 : 0.55)
      * (0.006 + 0.036 * intensity)
      * FINGERPRINT_TUNING.global.twistGain
      * (hash01(seed + 1.3) > 0.5 ? 1 : -1);

    const noise = clamp01(0.10 + 0.30 * (1 - intensity));
    const ridgeN = new THREE.Vector3(
      hash01(seed + 9) - 0.5,
      hash01(seed + 10) - 0.5,
      hash01(seed + 11) - 0.5,
    ).normalize();

    const extrudeProb = clamp01(
      (0.22 + 0.60 * intensity + 0.20 * pairDensity) * FINGERPRINT_TUNING.global.extrudeProbabilityGain,
    );
    const extrude = hash01(seed + 21.4) < extrudeProb;
    const extrudeSign: 1 | -1 = chord.quality === 'min'
      ? (hash01(seed + 33.1) < 0.74 ? -1 : 1)
      : 1;

    const extrudeDist = (0.08 + 0.32 * intensity)
      * (0.70 + 0.55 * secondsN)
      * FINGERPRINT_TUNING.global.extrudeDistanceGain;
    const extrudeInset = clamp(0.07 + 0.15 * contrast + 0.05 * (1 - intensity), 0.05, 0.24);
    const color = colorFromNote(rootIdx, chord.quality, intensity);

    const fallbackStart = duration * (i + 0.5) / Math.max(1, chordEntries.length);
    const start = stats.firstStartByChord[chordKey] ?? fallbackStart;

    feats.push({
      start,
      kind: 'CHORD',
      axes,
      amp,
      width,
      sharp,
      facet,
      ridge,
      twist,
      noise,
      ridgeN,
      seed,
      intensity,
      extrude,
      extrudeDist,
      extrudeInset,
      extrudeSign,
      color,
    });
  }

  // Note pillars from parsed_notes.
  for (let i = 0; i < noteEntries.length; i++) {
    const [note, parsedStats] = noteEntries[i];
    const noteIdx = NOTE_TO_INDEX.get(note);
    if (noteIdx === undefined) {
      continue;
    }

    const countN = clamp01(parsedStats.count / maxNoteCount);
    const secondsN = clamp01(parsedStats.seconds / duration);
    const pctN = clamp01(parsedStats.pct);

    const pairDensity = clamp01(stats.notePairCount[noteIdx] / stats.fingerprintCount);
    const relatedN = stats.noteRelatedRatio[noteIdx] ?? stats.relatedRatio;
    const intensity = clamp01(
      (0.34 * pctN + 0.22 * secondsN + 0.20 * countN + 0.24 * relatedN)
      * FINGERPRINT_TUNING.global.noteIntensityGain,
    );

    const repeats = Math.max(1, Math.min(5, 1 + Math.floor((0.35 * countN + 0.65 * pctN) * 4)));
    const noteStart = stats.firstStartByNote[noteIdx];
    const startBase = typeof noteStart === 'number' && Number.isFinite(noteStart)
      ? noteStart
      : duration * (i + 0.5) / Math.max(1, noteEntries.length);

    for (let r = 0; r < repeats; r++) {
      const seed = 111.7 + noteIdx * 17.3 + i * 9.1 + r * 2.7;
      const localIntensity = clamp01(intensity * (0.86 + 0.14 * hash01(seed + 2.1)));
      const centroid = clamp01(0.30 + 0.50 * pctN + 0.20 * hash01(seed + 2.3));
      const contrast = clamp01(0.18 + 0.56 * pairDensity + 0.26 * Math.abs(relatedN - 0.5));

      const axis = jitterDir(NOTE_DIRS[noteIdx], seed, 0.24 + r * 0.03);
      const ampSign: 1 | -1 = (hash01(seed + 7.2) > 0.58 || relatedN < 0.48) ? -1 : 1;
      const amp = clamp(
        ampSign * (0.015 + 0.065 * localIntensity) * (0.6 + 0.65 * countN) * FINGERPRINT_TUNING.global.deformationGain,
        -FINGERPRINT_TUNING.global.maxAmpAbs,
        FINGERPRINT_TUNING.global.maxAmpAbs,
      );
      const width = 0.045 + 0.09 * (1 - countN) + 0.03 * r;
      const sharp = 2.7 + 2.1 * centroid + 1.2 * contrast;
      const facet = clamp01(0.14 + 0.62 * contrast + 0.18 * centroid);
      const ridge = clamp01((0.10 + 0.30 * (1 - relatedN) + 0.24 * contrast) * FINGERPRINT_TUNING.global.ridgeGain);
      const twist = (0.003 + 0.02 * localIntensity)
        * FINGERPRINT_TUNING.global.twistGain
        * (hash01(seed + 3.8) > 0.5 ? 1 : -1);
      const noise = clamp01(0.10 + 0.18 * (1 - localIntensity));

      const ridgeN = new THREE.Vector3(
        hash01(seed + 9) - 0.5,
        hash01(seed + 10) - 0.5,
        hash01(seed + 11) - 0.5,
      ).normalize();

      const extrudeProb = clamp01(
        (0.02 + 0.16 * localIntensity + 0.10 * pairDensity) * FINGERPRINT_TUNING.global.extrudeProbabilityGain,
      );
      const extrude = hash01(seed + 29.9) < extrudeProb;

      feats.push({
        start: startBase + r * 0.001,
        kind: 'NOTE',
        axes: [axis],
        amp,
        width,
        sharp,
        facet,
        ridge,
        twist,
        noise,
        ridgeN,
        seed,
        intensity: localIntensity,
        extrude,
        extrudeDist: (0.03 + 0.1 * localIntensity)
          * (0.55 + 0.6 * countN)
          * FINGERPRINT_TUNING.global.extrudeDistanceGain,
        extrudeInset: clamp(0.09 + 0.08 * contrast, 0.06, 0.2),
        extrudeSign: 1,
        color: colorFromNote(noteIdx, null, localIntensity),
      });
    }
  }

  // Pair-level detail from backend fingerprint rows.
  
  for (let i = 0; i < sampledRows.length; i++) {
    const row = sampledRows[i];
    const note = typeof row.note === 'string' ? row.note : '';
    const noteIdx = NOTE_TO_INDEX.get(note);
    if (noteIdx === undefined) {
      continue;
    }

    const start = typeof row.start === 'number' && Number.isFinite(row.start) ? row.start : 0;
    const end = typeof row.end === 'number' && Number.isFinite(row.end) ? row.end : start;
    const dur = Math.max(0.01, end - start);
    const durN = clamp01(dur / Math.max(0.05, stats.maxPairDuration));

    const parsedChord = parseChordLabel(typeof row.chord === 'string' ? row.chord : 'N');
    const family = qualityFamily(parsedChord.quality);
    const chordKey = chordKeyFromFingerprintLabel(typeof row.chord === 'string' ? row.chord : 'N');

    const noteStats = readParsedEntry(noteMap[note]);
    const chordStats = chordKey ? readParsedEntry(chordMap[chordKey]) : { count: 0, seconds: 0, pct: 0 };
    const relatedN = row.related ? 1 : 0;

    const intensity = clamp01(
      (0.20
      + 0.34 * clamp01(noteStats.pct)
      + 0.26 * clamp01(chordStats.pct)
      + 0.14 * durN
      + 0.12 * relatedN)
      * FINGERPRINT_TUNING.global.pairIntensityGain,
    );

    const centroid = clamp01(0.24 + 0.56 * clamp01(noteStats.pct) + 0.20 * durN);
    const contrast = clamp01(
      0.18
      + 0.58 * Math.abs(relatedN - stats.relatedRatio)
      + 0.24 * clamp01(chordStats.pct),
    );

    const seed = start * 53.1 + i * 5.3 + noteIdx * 7.9;
    const noteAxis = jitterDir(NOTE_DIRS[noteIdx], seed, 0.24);
    const axes: THREE.Vector3[] = [noteAxis];

    if (!parsedChord.noChord && parsedChord.root) {
      const chordRootIdx = NOTE_TO_INDEX.get(parsedChord.root);
      if (chordRootIdx !== undefined) {
        const toneIndices = chordToneIndices(chordRootIdx, parsedChord.quality);
        const toneCount = row.related ? Math.min(3, toneIndices.length) : Math.min(2, toneIndices.length);

        for (let t = 0; t < toneCount; t++) {
          axes.push(jitterDir(NOTE_DIRS[toneIndices[t]], seed + 4.4 + t * 5.2, 0.28));
        }
      }
    }

    const ampSign: 1 | -1 = relatedN > 0.5
      ? (family === 'min' ? -1 : 1)
      : (hash01(seed + 3.3) > 0.52 ? 1 : -1);

    const amp = clamp(
      ampSign * (0.014 + 0.078 * intensity) * (0.6 + 0.7 * durN) * FINGERPRINT_TUNING.global.deformationGain,
      -FINGERPRINT_TUNING.global.maxAmpAbs,
      FINGERPRINT_TUNING.global.maxAmpAbs,
    );
    const width = 0.042 + 0.12 * durN + 0.05 * (1 - centroid);
    const sharp = 2.1 + 2.4 * centroid + 1.4 * contrast;
    const facet = clamp01(0.18 + 0.64 * contrast + 0.15 * durN);
    const ridge = clamp01((0.12 + 0.35 * (1 - relatedN) + 0.28 * contrast) * FINGERPRINT_TUNING.global.ridgeGain);
    const twist = (0.004 + 0.022 * intensity)
      * FINGERPRINT_TUNING.global.twistGain
      * (hash01(seed + 2.2) > 0.5 ? 1 : -1);
    const noise = clamp01(0.10 + 0.24 * (1 - intensity));

    const ridgeN = new THREE.Vector3(
      hash01(seed + 9) - 0.5,
      hash01(seed + 10) - 0.5,
      hash01(seed + 11) - 0.5,
    ).normalize();

    const extrudeProb = row.related
      ? clamp01((0.05 + 0.28 * intensity + 0.18 * durN) * FINGERPRINT_TUNING.global.extrudeProbabilityGain)
      : clamp01((0.01 + 0.10 * intensity) * FINGERPRINT_TUNING.global.extrudeProbabilityGain);

    const extrude = hash01(seed + 77.7) < extrudeProb;

    feats.push({
      start: start + i * 0.0001,
      kind: row.related ? 'CHORD' : 'NOTE',
      axes,
      amp,
      width,
      sharp,
      facet,
      ridge,
      twist,
      noise,
      ridgeN,
      seed,
      intensity,
      extrude,
      extrudeDist: (0.032 + 0.12 * intensity)
        * (0.58 + 0.58 * durN)
        * FINGERPRINT_TUNING.global.extrudeDistanceGain,
      extrudeInset: clamp(0.08 + 0.11 * contrast, 0.05, 0.22),
      extrudeSign: family === 'min' ? -1 : 1,
      color: colorFromNote(noteIdx, family, intensity),
    });
  }

  // Ambient balancing passes from overall parsed note gravity.
  const tonalAxis = tonalAxisFromParsedNotes(noteMap);
  const ambientCount = Math.floor(clamp(10 + Math.sqrt(sampledRows.length) * 2.1, 10, 64));

  for (let i = 0; i < ambientCount; i++) {
    const seed = duration * 9.3 + i * 11.7;

    let axis = jitterDir(tonalAxis, seed, 0.65);
    if (hash01(seed + 2.4) > 0.55) {
      const driftIdx = Math.floor(hash01(seed + 5.2) * 12) % 12;
      axis = axis.add(NOTE_DIRS[driftIdx].clone().multiplyScalar(0.35)).normalize();
    }

    const intensity = clamp01(
      (0.18 + 0.34 * stats.relatedRatio + 0.24 * hash01(seed + 7.3))
      * FINGERPRINT_TUNING.global.ambientIntensityGain,
    );
    const centroid = clamp01(0.35 + 0.45 * hash01(seed + 1.3));
    const contrast = clamp01(0.15 + 0.55 * hash01(seed + 8.9));

    const c = new THREE.Color();
    c.setHSL(hash01(seed + 19.9), 0.42, 0.45);

    feats.push({
      start: duration + i * 0.001,
      kind: 'AMBIENT',
      axes: [axis],
      amp: clamp(
        (hash01(seed + 8.8) > 0.5 ? 1 : -1)
          * (0.01 + 0.026 * intensity)
          * (0.6 + 0.5 * (1 - centroid))
          * FINGERPRINT_TUNING.global.deformationGain,
        -FINGERPRINT_TUNING.global.maxAmpAbs,
        FINGERPRINT_TUNING.global.maxAmpAbs,
      ),
      width: 0.14 + 0.11 * (1 - centroid),
      sharp: 1.3 + 1.4 * centroid,
      facet: clamp01(0.10 + 0.42 * contrast),
      ridge: clamp01((0.08 + 0.22 * (1 - intensity)) * FINGERPRINT_TUNING.global.ridgeGain),
      twist: (0.002 + 0.008 * intensity)
        * FINGERPRINT_TUNING.global.twistGain
        * (hash01(seed + 2.2) > 0.5 ? 1 : -1),
      noise: clamp01(0.18 + 0.35 * (1 - intensity)),
      ridgeN: new THREE.Vector3(
        hash01(seed + 9) - 0.5,
        hash01(seed + 10) - 0.5,
        hash01(seed + 11) - 0.5,
      ).normalize(),
      seed,
      intensity,
      extrude: false,
      extrudeDist: 0,
      extrudeInset: 0,
      extrudeSign: 1,
      color: c,
    });
  }

  feats.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return a.seed - b.seed;
  });

  return feats;
}

type GeoState = {
  pos: Float32Array;
  col: Float32Array;
  idx: Uint16Array | Uint32Array;
  faceDepth: number[];
  faceLast: number[];
};

function makeIndexArray(length: number, vertexCount: number) {
  return vertexCount > 65535 ? new Uint32Array(length) : new Uint16Array(length);
}

function FingerprintMesh({ data }: ComponentProps) {
  const geom = useMemo(() => new THREE.BufferGeometry(), []);
  const groupRef = useRef<THREE.Group>(null);

  const positionAttrRef = useRef<THREE.BufferAttribute | null>(null);
  const colorAttrRef = useRef<THREE.BufferAttribute | null>(null);

  const features = useMemo(() => buildFeatures(data), [data]);

  const extrudeCount = useRef(0);
  const stateRef = useRef<GeoState | null>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return;
    }

    groupRef.current.rotation.y += delta * 0.15;
    groupRef.current.rotation.x += delta * 0.03;
  });

  const initGeometry = () => {
    const base = new THREE.IcosahedronGeometry(1, 3);
    base.computeVertexNormals();

    const pAttr = base.getAttribute('position') as THREE.BufferAttribute;
    const basePos = new Float32Array(pAttr.array as ArrayLike<number>);
    const vertexCount = pAttr.count;

    const baseIdx = base.getIndex();
    const baseIndexArray = baseIdx ? (baseIdx.array as ArrayLike<number>) : null;

    let idx: Uint16Array | Uint32Array;
    if (baseIndexArray) {
      idx = makeIndexArray(baseIndexArray.length, vertexCount);
      for (let i = 0; i < baseIndexArray.length; i++) {
        idx[i] = Number(baseIndexArray[i]);
      }
    } else {
      const faces = Math.floor(vertexCount / 3);
      idx = makeIndexArray(faces * 3, vertexCount);
      for (let f = 0; f < faces; f++) {
        idx[f * 3 + 0] = f * 3 + 0;
        idx[f * 3 + 1] = f * 3 + 1;
        idx[f * 3 + 2] = f * 3 + 2;
      }
    }

    const baseDuration = data.duration || 100;
    const baseHue = (baseDuration * 0.15) % 1.0;
    const baseColorObj = new THREE.Color().setHSL(baseHue, 0.2, 0.2);

    const col = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      const x = basePos[i * 3 + 0];
      const y = basePos[i * 3 + 1];
      const z = basePos[i * 3 + 2];
      const u = new THREE.Vector3(x, y, z).normalize();
      const t = 0.35 + 0.65 * Math.abs(u.y);
      col[i * 3 + 0] = baseColorObj.r * t;
      col[i * 3 + 1] = baseColorObj.g * t;
      col[i * 3 + 2] = baseColorObj.b * t;
    }

    const faceCount = Math.floor(idx.length / 3);
    const faceDepth = new Array(faceCount).fill(0);
    const faceLast = new Array(faceCount).fill(-999);

    stateRef.current = { pos: basePos, col, idx, faceDepth, faceLast };

    geom.setAttribute('position', new THREE.BufferAttribute(basePos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(col, 3));
    geom.setIndex(new THREE.BufferAttribute(idx, 1));
    geom.computeVertexNormals();
    geom.computeBoundingSphere();

    positionAttrRef.current = geom.getAttribute('position') as THREE.BufferAttribute;
    colorAttrRef.current = geom.getAttribute('color') as THREE.BufferAttribute;

    extrudeCount.current = 0;
  };

  const findBestFace = (targetDir: THREE.Vector3, eventIndex: number) => {
    const st = stateRef.current;
    if (!st) {
      return -1;
    }

    const { pos, idx, faceDepth, faceLast } = st;
    const faceCount = Math.floor(idx.length / 3);

    let bestFace = -1;
    let bestScore = -1e9;

    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const n = new THREE.Vector3();
    const centroid = new THREE.Vector3();

    for (let f = 0; f < faceCount; f++) {
      const ia = Number(idx[f * 3 + 0]);
      const ib = Number(idx[f * 3 + 1]);
      const ic = Number(idx[f * 3 + 2]);

      a.set(pos[ia * 3 + 0], pos[ia * 3 + 1], pos[ia * 3 + 2]);
      b.set(pos[ib * 3 + 0], pos[ib * 3 + 1], pos[ib * 3 + 2]);
      c.set(pos[ic * 3 + 0], pos[ic * 3 + 1], pos[ic * 3 + 2]);

      n.copy(b).sub(a).cross(c.clone().sub(a));
      const area2 = n.length();
      if (area2 < 1e-6) {
        continue;
      }
      n.normalize();

      centroid.copy(a).add(b).add(c).multiplyScalar(1 / 3).normalize();

      const align = 0.65 * centroid.dot(targetDir) + 0.45 * n.dot(targetDir);
      const depthPenalty = 0.10 * faceDepth[f];
      const recentPenalty = (eventIndex - faceLast[f] < 6) ? 0.35 : 0;
      const score = align - depthPenalty - recentPenalty;

      if (score > bestScore) {
        bestScore = score;
        bestFace = f;
      }
    }

    return bestFace;
  };

  const syncGeometryResized = (
    newPos: Float32Array,
    newCol: Float32Array,
    newIdx: Uint16Array | Uint32Array,
    recompute = false,
  ) => {
    geom.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(newCol, 3));
    geom.setIndex(new THREE.BufferAttribute(newIdx, 1));

    positionAttrRef.current = geom.getAttribute('position') as THREE.BufferAttribute;
    colorAttrRef.current = geom.getAttribute('color') as THREE.BufferAttribute;

    if (recompute) {
      geom.computeVertexNormals();
      geom.computeBoundingSphere();
    }
  };

  const extrudeFace = (
    faceIdx: number,
    f: Feature,
    growthScale: number,
    eventIndex: number,
    recompute = false,
  ) => {
    const st = stateRef.current;
    if (!st || faceIdx < 0) {
      return;
    }

    if (extrudeCount.current >= 320) {
      return;
    }

    const { pos, col, idx, faceDepth, faceLast } = st;

    const i0 = faceIdx * 3;
    const ia = Number(idx[i0 + 0]);
    const ib = Number(idx[i0 + 1]);
    const ic = Number(idx[i0 + 2]);

    const a = new THREE.Vector3(pos[ia * 3 + 0], pos[ia * 3 + 1], pos[ia * 3 + 2]);
    const b = new THREE.Vector3(pos[ib * 3 + 0], pos[ib * 3 + 1], pos[ib * 3 + 2]);
    const c = new THREE.Vector3(pos[ic * 3 + 0], pos[ic * 3 + 1], pos[ic * 3 + 2]);

    const n = new THREE.Vector3().copy(b).sub(a).cross(new THREE.Vector3().copy(c).sub(a));
    if (n.length() < 1e-6) {
      return;
    }
    n.normalize();

    const depth = faceDepth[faceIdx] ?? 0;
    const depthScale = 1 / (1 + 0.55 * depth);
    const dist = f.extrudeSign * f.extrudeDist * growthScale * depthScale;
    const inset = clamp(f.extrudeInset, 0.04, 0.26);

    const centroid = new THREE.Vector3().copy(a).add(b).add(c).multiplyScalar(1 / 3);

    const vCount = Math.floor(pos.length / 3);
    const newVCount = vCount + 3;

    const newPos = new Float32Array(newVCount * 3);
    newPos.set(pos, 0);

    const newCol = new Float32Array(newVCount * 3);
    newCol.set(col, 0);

    const makeCapVert = (orig: THREE.Vector3, vi: number) => {
      const p = centroid
        .clone()
        .add(orig.clone().sub(centroid).multiplyScalar(1 - inset))
        .add(n.clone().multiplyScalar(dist));

      newPos[vi * 3 + 0] = p.x;
      newPos[vi * 3 + 1] = p.y;
      newPos[vi * 3 + 2] = p.z;

      newCol[vi * 3 + 0] = f.color.r;
      newCol[vi * 3 + 1] = f.color.g;
      newCol[vi * 3 + 2] = f.color.b;
    };

    const na = vCount + 0;
    const nb = vCount + 1;
    const nc = vCount + 2;

    makeCapVert(a, na);
    makeCapVert(b, nb);
    makeCapVert(c, nc);

    const stain = (0.18 + 0.22 * f.intensity) * FINGERPRINT_TUNING.global.colorBlendGain;
    const stainVertex = (vi: number) => {
      newCol[vi * 3 + 0] = clamp01(newCol[vi * 3 + 0] * (1 - stain) + f.color.r * stain);
      newCol[vi * 3 + 1] = clamp01(newCol[vi * 3 + 1] * (1 - stain) + f.color.g * stain);
      newCol[vi * 3 + 2] = clamp01(newCol[vi * 3 + 2] * (1 - stain) + f.color.b * stain);
    };
    stainVertex(ia);
    stainVertex(ib);
    stainVertex(ic);

    const oldILen = idx.length;
    const newILen = oldILen + 18;
    const newIdx = makeIndexArray(newILen, newVCount);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    newIdx.set(idx as any, 0);

    newIdx[i0 + 0] = na;
    newIdx[i0 + 1] = nb;
    newIdx[i0 + 2] = nc;

    let o = oldILen;
    const pushTri = (x: number, y: number, z: number) => {
      newIdx[o++] = x;
      newIdx[o++] = y;
      newIdx[o++] = z;
    };

    pushTri(ia, ib, nb);
    pushTri(ia, nb, na);

    pushTri(ib, ic, nc);
    pushTri(ib, nc, nb);

    pushTri(ic, ia, na);
    pushTri(ic, na, nc);

    faceDepth[faceIdx] = depth + 1;
    faceLast[faceIdx] = eventIndex;

    for (let k = 0; k < 6; k++) {
      faceDepth.push(depth + 1);
      faceLast.push(eventIndex);
    }

    stateRef.current = { pos: newPos, col: newCol, idx: newIdx, faceDepth, faceLast };
    syncGeometryResized(newPos, newCol, newIdx, recompute);

    extrudeCount.current += 1;
  };

  const deformAndColor = (f: Feature, growthScale: number) => {
    const st = stateRef.current;
    const pAttr = positionAttrRef.current;
    const cAttr = colorAttrRef.current;
    if (!st || !pAttr || !cAttr) {
      return;
    }

    const { pos, col } = st;
    const vertexCount = Math.floor(pos.length / 3);

    const w = Math.max(0.02, f.width);
    const invW2 = 1 / (w * w);
    const facet = clamp01(f.facet);

    const radialStep = FINGERPRINT_TUNING.geometry.radialQuantStepBase
      + FINGERPRINT_TUNING.geometry.radialQuantStepFacetScale * facet;
    const ridgeSigma = 0.08 + 0.18 * (1 - facet);
    const amp = f.amp * growthScale;

    const axisWeight = (dot: number) => {
      dot = clamp(dot, -1, 1);
      const d = 1 - dot;

      let g0 = Math.exp(-(d * d) * invW2);
      g0 = Math.pow(g0, f.sharp);

      const edge = 1 - w * 1.55;
      const sp = Math.max(0, (dot - edge) / Math.max(1e-6, (1 - edge)));
      const spire = Math.pow(sp, 1.25 * f.sharp + 1.2);

      return (1 - facet) * g0 + facet * spire;
    };

    const ax0 = f.axes[0];

    for (let i = 0; i < vertexCount; i++) {
      const px = pos[i * 3 + 0];
      const py = pos[i * 3 + 1];
      const pz = pos[i * 3 + 2];

      const len = Math.max(1e-8, Math.sqrt(px * px + py * py + pz * pz));
      const ux = px / len;
      const uy = py / len;
      const uz = pz / len;

      let wSum = 0;
      for (let a = 0; a < f.axes.length; a++) {
        const ax = f.axes[a];
        wSum += axisWeight(ux * ax.x + uy * ax.y + uz * ax.z);
      }
      wSum /= Math.max(1, f.axes.length);

      if (f.ridge > 0.0001) {
        const pd = Math.abs(ux * f.ridgeN.x + uy * f.ridgeN.y + uz * f.ridgeN.z);
        let rw = Math.exp(-(pd * pd) / Math.max(1e-6, ridgeSigma * ridgeSigma));
        rw = Math.pow(rw, 1.2 + 2.2 * facet);
        wSum = clamp01(wSum + f.ridge * FINGERPRINT_TUNING.geometry.ridgeStrengthScale * rw);
      }

      let warp = 1;
      if (f.noise > 0.0001) {
        const n = noise3(ux * 5.2, uy * 5.2, uz * 5.2, f.seed);
        warp = 1 + f.noise * 0.55 * n;
      }

      const dr = amp * wSum * warp * FINGERPRINT_TUNING.global.deformationGain;

      let nx = px + ux * dr;
      let ny = py + uy * dr;
      let nz = pz + uz * dr;

      if (Math.abs(f.twist) > 1e-6) {
        const tx = ax0.y * uz - ax0.z * uy;
        const ty = ax0.z * ux - ax0.x * uz;
        const tz = ax0.x * uy - ax0.y * ux;
        const tLen = Math.max(1e-8, Math.sqrt(tx * tx + ty * ty + tz * tz));
        const tnx = tx / tLen;
        const tny = ty / tLen;
        const tnz = tz / tLen;
        const dt = f.twist * wSum * (0.7 + 0.6 * facet);
        nx += tnx * dt;
        ny += tny * dt;
        nz += tnz * dt;
      }

      const nLen = Math.max(1e-8, Math.sqrt(nx * nx + ny * ny + nz * nz));
      const r0 = Math.round(nLen / radialStep) * radialStep;
      const k = r0 / nLen;
      nx *= k;
      ny *= k;
      nz *= k;

      pos[i * 3 + 0] = nx;
      pos[i * 3 + 1] = ny;
      pos[i * 3 + 2] = nz;

      const alpha = clamp01((0.08 + 0.22 * f.intensity) * wSum * FINGERPRINT_TUNING.global.colorBlendGain);
      if (alpha > 1e-4) {
        col[i * 3 + 0] = clamp01(col[i * 3 + 0] * (1 - alpha) + f.color.r * alpha);
        col[i * 3 + 1] = clamp01(col[i * 3 + 1] * (1 - alpha) + f.color.g * alpha);
        col[i * 3 + 2] = clamp01(col[i * 3 + 2] * (1 - alpha) + f.color.b * alpha);
      }
    }

    (pAttr.array as Float32Array).set(pos);
    (cAttr.array as Float32Array).set(col);
    pAttr.needsUpdate = true;
    cAttr.needsUpdate = true;
  };

  const buildStaticFingerprint = () => {
    const total = features.length;
    if (total === 0) {
      geom.computeVertexNormals();
      geom.computeBoundingSphere();
      return;
    }

    for (let i = 0; i < total; i++) {
      const f = features[i];
      const prog = (i + 1) / total;
      const growthScale = 0.72 + 0.98 * easeOutCubic(prog);

      if (f.extrude) {
        const face = findBestFace(f.axes[0], i);
        extrudeFace(face, f, growthScale, i, false);
      }

      deformAndColor(f, growthScale);
    }

    geom.computeVertexNormals();
    geom.computeBoundingSphere();
  };

  useEffect(() => {
    initGeometry();
    buildStaticFingerprint();
  }, [data, features]);

  return (
    <group ref={groupRef}>
      <mesh geometry={geom}>
        <meshBasicMaterial vertexColors />
      </mesh>

      <mesh geometry={geom} >
        <meshBasicMaterial wireframe color={'#ffffff'} />
      </mesh>

      <mesh geometry={geom} scale={1.3}>
        <meshBasicMaterial wireframe vertexColors />
      </mesh>
    </group>
  );
}

export default function SongFingerprint3D(props: ComponentProps) {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgb(33, 34, 37)' }}>
      <Canvas
        shadows
        camera={{ position: [0, 0, 3.6], fov: 45, near: 0.01, far: 80 }}
        gl={{ antialias: true }}
        style={{ backgroundColor: 'rgb(33, 34, 37)' }}
      >
        <directionalLight position={[3, 4, 5]} intensity={1.25} castShadow />
        <directionalLight position={[-4, -2, -3]} intensity={0.55} />

        <FingerprintMesh {...props} />

        <OrbitControls enableDamping dampingFactor={0.08} minDistance={1.6} maxDistance={12} />

      </Canvas>
    </div>
  );
}