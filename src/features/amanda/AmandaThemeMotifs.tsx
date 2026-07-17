import React from 'react';

/**
 * Maine Eastern White Pine — the state tree of Maine.
 * A layered silhouette in muted coastal sage/forest tones.
 */
export const MainePineTree: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg
    viewBox='0 0 60 80'
    width={size}
    height={size}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-label='Maine pine tree'
  >
    {/* Deepest shadow layer */}
    <polygon points='30,4 54,34 6,34' fill='#1c3b28' opacity='0.55' />
    <polygon points='30,16 56,50 4,50' fill='#1c3b28' opacity='0.45' />
    <polygon points='30,30 58,66 2,66' fill='#1c3b28' opacity='0.4' />

    {/* Main tiers — retro forest greens */}
    <polygon points='30,2 52,32 8,32' fill='#2e5c3a' />
    <polygon points='30,14 54,48 6,48' fill='#30623f' />
    <polygon points='30,28 56,64 4,64' fill='#356645' />

    {/* Trunk */}
    <rect x='27' y='64' width='6' height='12' rx='1' fill='#6b3f25' />
    <rect x='28' y='64' width='2' height='12' rx='1' fill='#7d4e30' opacity='0.5' />

    {/* Snow caps on each tier */}
    <polygon points='30,2 38,15 22,15' fill='#f0ece0' opacity='0.7' />
    <polygon points='30,14 40,27 20,27' fill='#f0ece0' opacity='0.5' />
    <polygon points='30,28 42,41 18,41' fill='#f0ece0' opacity='0.35' />

    {/* Highlight on each tier edge */}
    <polyline points='30,2 52,32' stroke='#52855e' strokeWidth='0.7' strokeLinecap='round' opacity='0.6' />
    <polyline points='30,14 54,48' stroke='#52855e' strokeWidth='0.7' strokeLinecap='round' opacity='0.5' />
    <polyline points='30,28 56,64' stroke='#52855e' strokeWidth='0.7' strokeLinecap='round' opacity='0.4' />
  </svg>
);

/**
 * Maine Lobster — classic Atlantic lobster silhouette in warm red/terracotta.
 */
export const MaineLobster: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg
    viewBox='0 0 80 80'
    width={size}
    height={size}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-label='Maine lobster'
  >
    {/* Antennae */}
    <line x1='32' y1='14' x2='14' y2='2' stroke='#c44a2c' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='48' y1='14' x2='66' y2='2' stroke='#c44a2c' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='30' y1='15' x2='20' y2='4' stroke='#a53d24' strokeWidth='1' strokeLinecap='round' />
    <line x1='50' y1='15' x2='60' y2='4' stroke='#a53d24' strokeWidth='1' strokeLinecap='round' />

    {/* Head / cephalothorax */}
    <ellipse cx='40' cy='22' rx='13' ry='11' fill='#c44a2c' />
    <ellipse cx='40' cy='22' rx='10' ry='8' fill='#d45b3a' />

    {/* Eyes */}
    <circle cx='34' cy='18' r='2.5' fill='#1c1208' />
    <circle cx='46' cy='18' r='2.5' fill='#1c1208' />
    <circle cx='34.6' cy='17.4' r='0.8' fill='#fff8f0' opacity='0.7' />
    <circle cx='46.6' cy='17.4' r='0.8' fill='#fff8f0' opacity='0.7' />

    {/* Body segments */}
    <ellipse cx='40' cy='35' rx='11' ry='9' fill='#c44a2c' />
    <ellipse cx='40' cy='45' rx='9.5' ry='8' fill='#be4429' />
    <ellipse cx='40' cy='54' rx='8' ry='6.5' fill='#b63d24' />
    <ellipse cx='40' cy='62' rx='6' ry='5' fill='#ae3820' />

    {/* Segment lines */}
    <ellipse cx='40' cy='35' rx='9' ry='1.5' fill='none' stroke='#a53d24' strokeWidth='0.8' opacity='0.5' />
    <ellipse cx='40' cy='45' rx='7.5' ry='1.5' fill='none' stroke='#a53d24' strokeWidth='0.8' opacity='0.5' />
    <ellipse cx='40' cy='54' rx='6' ry='1.2' fill='none' stroke='#a53d24' strokeWidth='0.8' opacity='0.5' />

    {/* Tail fan */}
    <ellipse cx='28' cy='74' rx='6' ry='4' fill='#c44a2c' transform='rotate(-20 28 74)' />
    <ellipse cx='35' cy='76' rx='6' ry='3.5' fill='#be4429' transform='rotate(-7 35 76)' />
    <ellipse cx='40' cy='77' rx='5.5' ry='3.5' fill='#b63d24' />
    <ellipse cx='45' cy='76' rx='6' ry='3.5' fill='#be4429' transform='rotate(7 45 76)' />
    <ellipse cx='52' cy='74' rx='6' ry='4' fill='#c44a2c' transform='rotate(20 52 74)' />

    {/* Left large claw arm */}
    <path d='M29 26 C18 28 10 26 8 20 C6 14 12 10 18 13 C14 10 14 5 18 6 C22 7 22 13 19 15 C25 15 28 20 29 26Z'
      fill='#c44a2c' />
    <path d='M18 13 C14 10 14 5 18 6 C22 7 22 13 19 15Z' fill='#d45b3a' />

    {/* Right large claw arm */}
    <path d='M51 26 C62 28 70 26 72 20 C74 14 68 10 62 13 C66 10 66 5 62 6 C58 7 58 13 61 15 C55 15 52 20 51 26Z'
      fill='#c44a2c' />
    <path d='M62 13 C66 10 66 5 62 6 C58 7 58 13 61 15Z' fill='#d45b3a' />

    {/* Small walking legs left */}
    <line x1='30' y1='32' x2='20' y2='38' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='30' y1='38' x2='19' y2='46' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='30' y1='44' x2='20' y2='54' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />

    {/* Small walking legs right */}
    <line x1='50' y1='32' x2='60' y2='38' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='50' y1='38' x2='61' y2='46' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />
    <line x1='50' y1='44' x2='60' y2='54' stroke='#b63d24' strokeWidth='1.5' strokeLinecap='round' />

    {/* Shell highlight */}
    <ellipse cx='38' cy='20' rx='5' ry='3' fill='#e8705a' opacity='0.35' transform='rotate(-10 38 20)' />
  </svg>
);

/**
 * Monarch Butterfly — retro orange-and-black wing pattern.
 */
export const MaineButterfly: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg
    viewBox='0 0 90 70'
    width={size}
    height={size}
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-label='Maine monarch butterfly'
  >
    {/* Left upper wing */}
    <path
      d='M43 28 C38 14 22 8 10 14 C2 18 2 28 8 34 C14 40 28 38 43 34Z'
      fill='#e87430'
    />
    <path
      d='M43 28 C38 14 22 8 10 14 C2 18 2 28 8 34 C14 40 28 38 43 34Z'
      fill='none'
      stroke='#1c1208'
      strokeWidth='1.4'
    />

    {/* Right upper wing */}
    <path
      d='M47 28 C52 14 68 8 80 14 C88 18 88 28 82 34 C76 40 62 38 47 34Z'
      fill='#e87430'
    />
    <path
      d='M47 28 C52 14 68 8 80 14 C88 18 88 28 82 34 C76 40 62 38 47 34Z'
      fill='none'
      stroke='#1c1208'
      strokeWidth='1.4'
    />

    {/* Left lower wing */}
    <path
      d='M43 34 C32 36 18 44 16 54 C14 62 22 66 30 62 C38 58 42 46 43 38Z'
      fill='#e87430'
    />
    <path
      d='M43 34 C32 36 18 44 16 54 C14 62 22 66 30 62 C38 58 42 46 43 38Z'
      fill='none'
      stroke='#1c1208'
      strokeWidth='1.4'
    />

    {/* Right lower wing */}
    <path
      d='M47 34 C58 36 72 44 74 54 C76 62 68 66 60 62 C52 58 48 46 47 38Z'
      fill='#e87430'
    />
    <path
      d='M47 34 C58 36 72 44 74 54 C76 62 68 66 60 62 C52 58 48 46 47 38Z'
      fill='none'
      stroke='#1c1208'
      strokeWidth='1.4'
    />

    {/* Wing veins — black lines */}
    <line x1='43' y1='30' x2='12' y2='18' stroke='#1c1208' strokeWidth='1' opacity='0.7' />
    <line x1='43' y1='30' x2='16' y2='30' stroke='#1c1208' strokeWidth='0.8' opacity='0.6' />
    <line x1='43' y1='32' x2='20' y2='44' stroke='#1c1208' strokeWidth='0.8' opacity='0.6' />

    <line x1='47' y1='30' x2='78' y2='18' stroke='#1c1208' strokeWidth='1' opacity='0.7' />
    <line x1='47' y1='30' x2='74' y2='30' stroke='#1c1208' strokeWidth='0.8' opacity='0.6' />
    <line x1='47' y1='32' x2='70' y2='44' stroke='#1c1208' strokeWidth='0.8' opacity='0.6' />

    {/* White spots on upper wings */}
    <circle cx='14' cy='20' r='2.5' fill='#f8f1d4' opacity='0.85' />
    <circle cx='12' cy='28' r='2' fill='#f8f1d4' opacity='0.75' />
    <circle cx='18' cy='14' r='2' fill='#f8f1d4' opacity='0.7' />
    <circle cx='76' cy='20' r='2.5' fill='#f8f1d4' opacity='0.85' />
    <circle cx='78' cy='28' r='2' fill='#f8f1d4' opacity='0.75' />
    <circle cx='72' cy='14' r='2' fill='#f8f1d4' opacity='0.7' />

    {/* White border dots on lower wings */}
    <circle cx='18' cy='58' r='1.8' fill='#f8f1d4' opacity='0.8' />
    <circle cx='22' cy='64' r='1.5' fill='#f8f1d4' opacity='0.7' />
    <circle cx='72' cy='58' r='1.8' fill='#f8f1d4' opacity='0.8' />
    <circle cx='68' cy='64' r='1.5' fill='#f8f1d4' opacity='0.7' />

    {/* Black border bands */}
    <path d='M43 28 C38 14 22 8 10 14' fill='none' stroke='#1c1208' strokeWidth='4' opacity='0.55' strokeLinecap='round' />
    <path d='M47 28 C52 14 68 8 80 14' fill='none' stroke='#1c1208' strokeWidth='4' opacity='0.55' strokeLinecap='round' />

    {/* Body */}
    <ellipse cx='45' cy='35' rx='2.2' ry='16' fill='#1c1208' />
    <ellipse cx='45' cy='35' rx='1.2' ry='14' fill='#3a2810' />

    {/* Head */}
    <circle cx='45' cy='19' r='3.5' fill='#1c1208' />

    {/* Antennae */}
    <path d='M44 17 C40 12 36 8 32 6' stroke='#1c1208' strokeWidth='1.2' strokeLinecap='round' fill='none' />
    <circle cx='32' cy='6' r='2' fill='#1c1208' />
    <path d='M46 17 C50 12 54 8 58 6' stroke='#1c1208' strokeWidth='1.2' strokeLinecap='round' fill='none' />
    <circle cx='58' cy='6' r='2' fill='#1c1208' />
  </svg>
);
