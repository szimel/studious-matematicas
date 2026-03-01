import { useFrame } from '@react-three/fiber';
import { ALLOWED, DataKey, DataSegment } from '../../../../types/sound_data_types';
import { useRef } from 'react';

function findSegmentIndex(segments: DataSegment[], t: number): number {
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

function parseChordKey(label: string | string[]): DataKey | null {
  if (typeof label !== 'string') {return null;} // HACKY!
  const [root, qual] = label.split(':'); // "A#:min"
  const candidate = qual === 'min' ? `${root}m` : root;
  return ALLOWED.has(candidate as DataKey) ? (candidate as DataKey) : null;
}

export function ChordSync({
  segments,
  audioRef,
  activeChordRef,
}: {
  segments: DataSegment[];
  audioRef: React.RefObject<HTMLAudioElement>;
  activeChordRef: React.MutableRefObject<DataKey | null>;
}) {
  const segIndexRef = useRef(-1);
  const lastTimeRef = useRef(0);
  const lastChordRef = useRef<DataKey | null>(null);

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
