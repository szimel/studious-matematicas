import { Color } from 'three';

export const OUTER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'] as const;
export const INNER = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m', 'Fm', 'Cm', 'Gm', 'Dm'] as const;
export type DataKey = typeof OUTER[number] | typeof INNER[number];
export const ALLOWED = new Set<DataKey>([...OUTER, ...INNER]);

/**
 * Object with all 24 chords as keys, each key with `ChordProps`: 
 * {name: ChordKey, count: number, seconds: number, time: string, pct: number, pctDisplay: string}
 */
export type DataMap = Record<DataKey, DataProps>;

export type DataSegment = {
	start: number;
	end: number;
	// for chord segments, this is a string like "C:maj" or "A:min". For note segments, this is an array of the notes present in that time segment, e.g. ["C", "E", "G"]
	label: string | string[];
};

export type DataProps = {
	name: DataKey
	count: number
	seconds: number
	pct: number
};

export type OverlayState = {
	display: DataKey
	count: number
	pct: string
	seconds: string
	color: Color
};

export type NoteSegment = {
	start: number
	end: number
	notes: DataKey[]
}

export type FingerprintPair = {
	note: typeof OUTER[number]
	chord: string
	start: number
	end: number
	related: boolean
}

export type FingerprintSummary = {
	fingerprintCount: number
	relatedRatio: number
	notePairCount: number[]
	noteRelatedRatio: number[]
	chordPairCount: Record<string, number>
	chordRelatedRatio: Record<string, number>
	firstStartByChord: Record<string, number>
	firstStartByNote: Array<number | null>
	maxPairDuration: number
}

export type Fingerprint = {
	summary: FingerprintSummary
	sampled: FingerprintPair[]
}