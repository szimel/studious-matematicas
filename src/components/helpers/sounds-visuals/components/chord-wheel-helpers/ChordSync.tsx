import { useFrame } from '@react-three/fiber';
import { ALLOWED, ChordKey, ChordSegment } from '../ChordWheel';
import { useRef } from 'react';

function findSegmentIndex(segments: ChordSegment[], t: number): number {
  // binary search for the last segment with start <= t
  let lo = 0, hi = segments.length - 1, ans = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (segments[mid].start <= t) { ans = mid; lo = mid + 1; }
    else {hi = mid - 1;}
  }
  if (ans >= 0 && t < segments[ans].end) {return ans;}
  return -1;
}

function parseChordKey(label: string): ChordKey | null {
  const [root, qual] = label.split(':'); // "A#:min"
  const cand = qual === 'min' ? `${root}m` : root;
  return ALLOWED.has(cand as ChordKey) ? (cand as ChordKey) : null;
}

export function ChordSync({
  segments,
  audioRef,
  activeChordRef,
}: {
  segments: ChordSegment[];
  audioRef: React.RefObject<HTMLAudioElement>;
  activeChordRef: React.MutableRefObject<ChordKey | null>;
}) {
  const segIndexRef = useRef(-1);
  const lastTimeRef = useRef(0);
  const lastChordRef = useRef<ChordKey | null>(null);

  useFrame(() => {
    const a = audioRef.current;
    if (!a) {return;}

    const t = a.currentTime;
    const last = lastTimeRef.current;
    lastTimeRef.current = t;

    const jumped = Math.abs(t - last) > 0.25;

    let idx = segIndexRef.current;

    if (jumped) {
      idx = findSegmentIndex(segments, t);
    } else {
      if (idx < 0) {idx = findSegmentIndex(segments, t);}
      while (idx >= 0 && idx < segments.length && t >= segments[idx].end) {idx++;}
      if (idx >= 0 && idx < segments.length && t < segments[idx].start) {
        idx = findSegmentIndex(segments, t);
      }
      idx =
        idx >= 0 && idx < segments.length && t >= segments[idx].start && t < segments[idx].end
          ? idx
          : -1;
    }

    segIndexRef.current = idx;

    const chord = idx >= 0 ? parseChordKey(segments[idx].label) : null;

    if (chord !== lastChordRef.current) {
      lastChordRef.current = chord;
      activeChordRef.current = chord;
    }
  });

  return null;
}
