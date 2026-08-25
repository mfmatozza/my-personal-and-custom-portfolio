// Night-desk terminal intro — ported from a Claude Design prototype
// ("Terminal Intro.dc.html" / hack-intro.jsx) into a standalone React
// component. Differences from the prototype:
//   - no TweaksPanel / useTweaks (dev-only in the design tool) — the tuned
//     values are hardcoded below.
//   - the final "portfolio homepage" mockup is replaced with a plain white
//     reveal, per spec: intro plays once, then the site is a white page.
import { useComposition, Shot, Easing, animate, clamp } from './engine';
import handLeft from './assets/hand-left.png';
import handRight from './assets/hand-right.png';
import poster from './assets/poster.png';

const W = 1920, H = 1080;
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const G = { dim: '#1f7a45', mid: '#3fd07a', green: '#5cf49a', bright: '#d6ffe6' };

const TWEAKS = { punchStrength: 18, scanlines: true, glowLevel: 0.9 };

export const INTRO_SCENES = [
  { name: 'Boot', dur: 1, desc: 'Wide shot of the desk: the terminal is already spilling hack logs and the camera drifts in' },
  { name: 'Type', dur: 1, desc: 'Camera pushes toward the screen while the fingers tap out the ssh command character by character' },
  { name: 'Enter', dur: 1.2, desc: 'Macro push onto the Enter key: the hand reaches, the finger curls and slams it, the cap bottoms out, impact shake and glow' },
  { name: 'Access', dur: 1, desc: 'Back on screen: directory listing populates, decrypt bar fills, ACCESS GRANTED pops' },
  { name: 'Punch', dur: 0.9, desc: 'Fast punch zoom into the screen, bezel falls out of frame, content dissolves through a white flash' },
  { name: 'Land', dur: 0.8, desc: 'The white page settles into place' },
];

const MOTION = {
  glide: (o) => animate({ ...o, ease: Easing.easeOutCubic }),
  pop: (o) => animate({ ...o, ease: Easing.easeOutBack }),
  rush: (o) => animate({ ...o, ease: Easing.easeInOutExpo }),
};
const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
const rad = (d) => (d * Math.PI) / 180;

const SX = 560, SY = 130, SW = 800, SH = 500;

const KB = { left: 250, top: 796, width: 1420, pad: 34, u: 92, gap: 12, capH: 84, rowGap: 12, tilt: 32, persp: 1500 };
const PITCH = KB.u + KB.gap;
const KEYROWS = [
  [['esc', 1.5], ['q', 1], ['w', 1], ['e', 1], ['r', 1], ['t', 1], ['y', 1], ['u', 1], ['i', 1], ['o', 1], ['p', 1], ['⌫', 1.5]],
  [['tab', 1.75], ['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1], ['h', 1], ['j', 1], ['k', 1], ['l', 1], ['enter', 2.25]],
  [['shift', 2.25], ['z', 1], ['x', 1], ['c', 1], ['v', 1], ['b', 1], ['n', 1], ['m', 1], [',', 1], ['.', 1], ['↑', 1.75]],
  [['ctrl', 1.5], ['alt', 1.25], ['', 6.5], ['cmd', 1.25], ['←', 1.25], ['→', 1.25]],
];
function keyBoxes() {
  const out = [];
  KEYROWS.forEach((row, r) => {
    let x = KB.left + KB.pad;
    const y = KB.top + KB.pad + r * (KB.capH + KB.rowGap);
    row.forEach(([label, units]) => {
      const w = units * PITCH - KB.gap;
      out.push({ label, x, y, w, h: KB.capH, row: r });
      x += w + KB.gap;
    });
  });
  return out;
}
const KEYS = keyBoxes();
function tilted(x, y) {
  const dy = y - KB.top;
  const f = KB.persp / (KB.persp + dy * Math.sin(rad(KB.tilt)));
  return { x: 960 + (x - 960) * f, y: KB.top + dy * Math.cos(rad(KB.tilt)) * f, f };
}
const ENTER = KEYS.find((k) => k.label === 'enter');
const ENTER_PT = tilted(ENTER.x + ENTER.w / 2, ENTER.y + ENTER.h * 0.45);

const CODE = [
  'boot michelematozza.com :: node/eu-3',
  'git fetch origin main ......... ok',
  'HEAD 9f2acc1  "polish case studies"',
  'resolve dns michelematozza.com',
  '  A     185.199.110.153',
  '  TLS   valid  (auto-renew)',
  'build portfolio (vite) 1.24s',
  '  routes  /  /work  /about',
  '  bundle  212 kb  gzip 74 kb',
  'optimise images ... 38 files  ok',
  'lighthouse  perf 99  a11y 100',
  'deploy edge :: fra ams mil',
  'cache purge ................... ok',
  'load /content/projects.json',
  '  motion-systems      case study',
  '  interface-kit       case study',
  '  wayfinding-app      case study',
  'index 128 objects ............. ok',
  'session michele@local  granted',
  'awaiting operator input',
];
const DIRS = [
  ['drwx', 'work/', '12 projects'],
  ['-rw-', 'about.md', '6 kb'],
  ['drwx', 'ui-ux/', '08 case studies'],
  ['drwx', 'dev/', '14 repos'],
  ['-rw-', 'cv-michele-matozza.pdf', '184 kb'],
  ['-rw-', 'contact.vcf', '2 kb'],
];

function ScreenContent({ T, CUES, cmd }) {
  const rows = clamp(Math.round(MOTION.glide({ from: 0, to: CODE.length, start: 0.1, end: CUES.Enter - 0.05 })(T)), 0, CODE.length);
  const log = CODE.slice(Math.max(0, rows - 11), rows);
  const typed = Math.floor(animate({ from: 0, to: cmd.length, start: CUES.Type + 0.12, end: CUES.Enter - 0.12, ease: Easing.linear })(T));
  const caret = Math.floor(T * 3) % 2 === 0;
  const barP = clamp(MOTION.glide({ from: 0, to: 1, start: CUES.Access + 0.05, end: CUES.Access + 0.7 })(T), 0, 1);
  const dirN = clamp(Math.floor(animate({ from: 0, to: DIRS.length + 0.99, start: CUES.Access + 0.06, end: CUES.Access + 0.68, ease: Easing.linear })(T)), 0, DIRS.length);
  const grant = clamp(MOTION.pop({ from: 0, to: 1, start: CUES.Access + 0.76, end: CUES.Access + 1.02 })(T), 0, 1);
  const phaseA = clamp(1 - (T - CUES.Access) / 0.22, 0, 1);
  const phaseB = clamp((T - CUES.Access) / 0.22, 0, 1);
  const dissolve = clamp(1 - (T - (CUES.Punch + 0.05)) / 0.4, 0, 1);
  const line = { fontFamily: MONO, fontSize: 21, lineHeight: '31px', letterSpacing: '0.02em', whiteSpace: 'pre' };

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: dissolve }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: phaseA }}>
        <div style={{ width: 620, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 350 }}>
          {log.map((ln, i) => (
            <div key={ln + i} style={{ ...line, color: i === log.length - 1 ? G.bright : G.mid, opacity: 0.55 + 0.45 * (i / Math.max(1, log.length - 1)) }}>{ln}</div>
          ))}
        </div>
        <div style={{ width: 620, marginTop: 26, display: 'flex', alignItems: 'baseline', opacity: clamp((T - CUES.Type) / 0.22, 0, 1) }}>
          <span style={{ ...line, fontSize: 25, color: G.green, marginRight: 10 }}>$</span>
          <span style={{ ...line, fontSize: 25, color: G.bright, letterSpacing: '0.05em' }}>{cmd.slice(0, typed)}</span>
          <span style={{ width: 13, height: 25, marginLeft: 3, background: G.green, opacity: caret ? 0.95 : 0.15, boxShadow: `0 0 10px ${G.green}` }} />
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, opacity: phaseB }}>
        <div style={{ width: 470 }}>
          {DIRS.map((d, i) => (
            <div key={d[1]} style={{ ...line, display: 'flex', justifyContent: 'space-between', color: i === dirN - 1 ? G.bright : G.mid, opacity: i < dirN ? 1 : 0 }}>
              <span>{d[0]}  {d[1]}</span><span>{d[2]}</span>
            </div>
          ))}
        </div>
        <div style={{ width: 470 }}>
          <div style={{ ...line, fontSize: 17, letterSpacing: '0.18em', color: G.dim, marginBottom: 9 }}>UNPACKING PORTFOLIO {String(Math.round(barP * 100)).padStart(3, ' ')}%</div>
          <div style={{ height: 12, background: 'rgba(92,244,154,.14)', display: 'flex' }}>
            <div style={{ width: `${barP * 100}%`, background: G.green, boxShadow: `0 0 14px ${G.green}` }} />
          </div>
        </div>
        <div style={{
          fontFamily: MONO, fontSize: 44, fontWeight: 700, letterSpacing: '0.1em', color: G.bright,
          textShadow: `0 0 22px ${G.green}, 0 0 60px rgba(92,244,154,.55)`, opacity: grant, transform: `scale(${0.9 + grant * 0.1})`,
        }}>ACCESS GRANTED</div>
      </div>
    </div>
  );
}

function Window({ T }) {
  const dots = Array.from({ length: 54 });
  return (
    <div style={{ position: 'absolute', left: 96, top: 96, width: 372, height: 452 }}>
      <div style={{ position: 'absolute', inset: -22, borderRadius: 4, background: 'linear-gradient(180deg,#33312d,#1b1a18)', boxShadow: '0 34px 70px rgba(0,0,0,.6), inset 0 2px 0 rgba(255,255,255,.10)' }} />
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(180deg,#0b1725 0%,#132738 52%,#1b3046 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 40% at 72% 16%, rgba(160,196,236,.32), rgba(0,0,0,0) 72%)' }} />
        {dots.map((_, i) => {
          const x = hash(i, 1) * 372, y = 236 + hash(i, 2) * 200, w = 2 + hash(i, 3) * 4;
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(T * (0.7 + hash(i, 4)) + i));
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: w, height: w, background: hash(i, 5) > 0.4 ? '#ffd9a0' : '#cfe4ff', opacity: 0.22 + tw * 0.6, boxShadow: '0 0 7px rgba(255,214,150,.85)' }} />;
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 292, height: 160, background: 'linear-gradient(180deg,rgba(8,16,26,0),rgba(5,9,14,.92))' }} />
      </div>
      <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 14, marginLeft: -7, background: 'linear-gradient(90deg,#211f1d,#403d38 45%,#1b1a18)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: '46%', height: 14, background: 'linear-gradient(180deg,#413e39,#1b1a18)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(118deg, rgba(170,205,242,.12), rgba(0,0,0,0) 52%)', pointerEvents: 'none' }} />
    </div>
  );
}

function Poster() {
  return (
    <div style={{ position: 'absolute', left: 1508, top: 96, width: 300, height: 508, zIndex: 1 }}>
      <div style={{ position: 'absolute', left: 12, top: 16, right: -14, bottom: -18, background: 'rgba(0,0,0,.6)', filter: 'blur(20px)' }} />
      <div style={{ position: 'absolute', inset: 0, padding: 9, background: 'linear-gradient(160deg,#2a2a28,#141412)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.14)' }}>
        <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(.55) saturate(.9) contrast(1.05)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(200deg, rgba(190,220,240,.10), rgba(0,0,0,0) 46%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(92,244,154,.07), rgba(92,244,154,0) 60%)', mixBlendMode: 'screen', pointerEvents: 'none' }} />
    </div>
  );
}

function Monitor({ opacity, glow }) {
  return (
    <div style={{ position: 'absolute', inset: 0, opacity }}>
      <div style={{ position: 'absolute', left: 902, top: SY + SH + 62, width: 116, height: 104, background: 'linear-gradient(90deg,#101215 0%,#3c4247 34%,#5a6167 48%,#2a2e32 66%,#0e1013 100%)', borderRadius: '4px 4px 8px 8px' }} />
      <div style={{ position: 'absolute', left: 790, top: SY + SH + 158, width: 340, height: 30, borderRadius: 10, background: 'linear-gradient(180deg,#4a5055 0%,#2a2e31 40%,#101214 100%)', boxShadow: '0 20px 36px rgba(0,0,0,.7)' }} />
      <div style={{
        position: 'absolute', left: SX - 30, top: SY - 30, width: SW + 60, height: SH + 92, borderRadius: 12,
        background: 'linear-gradient(160deg,#6b7378 0%,#3a4045 16%,#22262a 48%,#191c1f 78%,#2c3135 100%)',
        boxShadow: `0 50px 100px rgba(0,0,0,.8), 0 0 ${80 * glow}px rgba(92,244,154,${0.16 * glow}), inset 0 1px 0 rgba(255,255,255,.28)`,
      }} />
      <div style={{ position: 'absolute', left: SX - 12, top: SY - 12, width: SW + 24, height: SH + 24, borderRadius: 4, background: '#0b0d0e', boxShadow: 'inset 0 0 22px rgba(0,0,0,.9)' }} />
      <div style={{ position: 'absolute', left: SX - 30, top: SY + SH + 20, width: SW + 60, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 340 }}>
        <span style={{ fontFamily: MONO, fontSize: 15, letterSpacing: '0.34em', color: 'rgba(220,232,238,.30)' }}>VECTRON</span>
        <span style={{ width: 9, height: 9, borderRadius: 5, background: G.green, boxShadow: `0 0 14px ${G.green}` }} />
      </div>
    </div>
  );
}

// Uploaded hand cutout, lit for the room.
function HandPhoto({ src, style, transform }) {
  return (
    <div style={{ position: 'absolute', ...style, transform, transformOrigin: 'bottom center' }}>
      <div style={{ position: 'absolute', left: '12%', top: '4%', width: '76%', height: '30%', borderRadius: '50%', background: 'rgba(0,0,0,.45)', filter: 'blur(14px)' }} />
      <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'brightness(.8) saturate(.95) contrast(1.04)' }} />
      <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.16, mixBlendMode: 'screen', filter: 'brightness(.45) sepia(1) hue-rotate(68deg) saturate(2.4)' }} />
    </div>
  );
}

function Mug({ T }) {
  return (
    <div style={{ position: 'absolute', left: 232, top: 604, width: 260, height: 280, zIndex: 4 }}>
      {[0, 1, 2].map((i) => {
        const p = (T * 0.4 + i / 3) % 1;
        return <div key={i} style={{
          position: 'absolute', left: 78 + i * 22, top: 62 - p * 76, width: 14 + i * 5, height: 52, borderRadius: '50%',
          background: 'rgba(232,242,238,.16)', filter: 'blur(8px)', opacity: (1 - p) * 0.85,
          transform: `translateX(${Math.sin(p * 7 + i) * 14}px)`,
        }} />;
      })}
      <svg viewBox="0 0 260 280" width="260" height="280">
        <defs>
          <linearGradient id="mugBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#8f8a80" /><stop offset="0.16" stopColor="#d8d3c9" /><stop offset="0.42" stopColor="#f6f3ec" /><stop offset="0.76" stopColor="#bfb9ad" /><stop offset="1" stopColor="#7d786f" />
          </linearGradient>
          <radialGradient id="brew" cx="0.4" cy="0.3" r="0.8">
            <stop offset="0" stopColor="#5a3620" /><stop offset="0.7" stopColor="#301a0e" /><stop offset="1" stopColor="#1b0e06" />
          </radialGradient>
        </defs>
        <ellipse cx="126" cy="262" rx="104" ry="18" fill="rgba(0,0,0,.55)" />
        <path d="M188 128 C226 126 240 148 236 168 C232 190 212 202 186 200 L186 182 C204 182 216 174 216 164 C216 152 204 146 188 148 Z" fill="#cfc9be" />
        <path d="M40 122 L212 122 C210 190 198 244 180 254 C150 268 96 268 68 254 C50 244 42 190 40 122 Z" fill="url(#mugBody)" />
        <ellipse cx="126" cy="122" rx="86" ry="24" fill="#e9e4da" />
        <ellipse cx="126" cy="126" rx="76" ry="19" fill="url(#brew)" />
        <ellipse cx="106" cy="122" rx="26" ry="6" fill="rgba(255,236,210,.16)" />
        <path d="M62 140 C58 190 66 232 78 246" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="7" strokeLinecap="round" />
        <path d="M186 142 C190 190 182 230 172 244" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="10" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function Keycap({ k, pressed, glow, big }) {
  const legend = k.label.length > 1 ? 20 : 30;
  const depth = pressed ? 2 : 14;
  return (
    <div style={{
      position: 'absolute', left: k.x, top: k.y + (pressed ? 17 : 0), width: k.w, height: k.h,
      borderRadius: 12, background: 'linear-gradient(180deg,#ffffff 0%,#f7f6f2 46%,#e6e4dc 100%)',
      boxShadow: `0 ${depth}px 0 #b9b6ad, 0 ${depth + 4}px 0 #9d9a92, 0 ${depth + 10}px ${pressed ? 10 : 22}px rgba(0,0,0,${pressed ? 0.7 : 0.55})`
        + (glow ? `, 0 0 ${40 * glow}px rgba(92,244,154,${0.75 * glow})` : ''),
      boxSizing: 'border-box', border: '1px solid #d7d4cb',
    }}>
      <div style={{
        position: 'absolute', inset: '7px 8px 12px 8px', borderRadius: 9,
        background: pressed
          ? 'radial-gradient(75% 90% at 50% 30%, #dcd9d1, #c9c6be)'
          : 'radial-gradient(75% 90% at 50% 26%, #ffffff, #eeece5 70%, #dedbd3)',
        boxShadow: 'inset 0 2px 3px rgba(255,255,255,.9), inset 0 -3px 6px rgba(0,0,0,.10)',
        display: 'flex', alignItems: 'flex-start', justifyContent: big ? 'flex-end' : 'flex-start',
        padding: big ? '10px 14px' : '9px 0 0 12px',
      }}>
        <span style={{ fontFamily: MONO, fontSize: big ? 24 : legend, color: '#8b877e', letterSpacing: '0.02em' }}>{k.label}</span>
      </div>
    </div>
  );
}

function Keyboard({ press, glow }) {
  return (
    <div style={{
      position: 'absolute', left: KB.left, top: KB.top, width: KB.width, height: 4 * (KB.capH + KB.rowGap) + KB.pad * 2, zIndex: 5,
      transform: `perspective(${KB.persp}px) rotateX(${KB.tilt}deg)`, transformOrigin: 'top center',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', borderRadius: 16,
        background: 'linear-gradient(180deg,#fdfcf9 0%,#eceae3 46%,#cdcac1 100%)',
        boxShadow: 'inset 0 2px 0 rgba(255,255,255,.9), inset 0 -10px 24px rgba(0,0,0,.16), 0 46px 80px rgba(0,0,0,.65)',
        border: '1px solid #bdbab1',
      }} />
      <div style={{ position: 'absolute', inset: 0 }}>
        {KEYS.map((k, i) => {
          const isEnter = k.label === 'enter';
          return <Keycap key={i} k={{ ...k, x: k.x - KB.left, y: k.y - KB.top }} big={isEnter}
            pressed={isEnter && press > 0.45} glow={isEnter ? glow : 0} />;
        })}
      </div>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'linear-gradient(180deg, rgba(92,244,154,.10), rgba(92,244,154,0) 42%)', pointerEvents: 'none' }} />
    </div>
  );
}

function Piece() {
  const { T, CUES, skip } = useComposition();
  const cmd = 'ssh visitor@michelematozza.com';
  const HIT = CUES.Enter + 0.42;

  let s, ox, oy;
  if (T < CUES.Type) {
    s = MOTION.glide({ from: 1.0, to: 1.08, start: 0, end: CUES.Type })(T); ox = 960; oy = 500;
  } else if (T < CUES.Enter) {
    s = MOTION.glide({ from: 1.08, to: 1.15, start: CUES.Type, end: CUES.Enter })(T);
    ox = 960; oy = MOTION.glide({ from: 500, to: 650, start: CUES.Type, end: CUES.Enter })(T);
  } else if (T < CUES.Access - 0.25) {
    s = MOTION.glide({ from: 1.15, to: 2.05, start: CUES.Enter, end: CUES.Enter + 0.34 })(T);
    ox = MOTION.glide({ from: 960, to: ENTER_PT.x, start: CUES.Enter, end: CUES.Enter + 0.34 })(T);
    oy = MOTION.glide({ from: 650, to: ENTER_PT.y + 40, start: CUES.Enter, end: CUES.Enter + 0.34 })(T);
  } else if (T < CUES.Punch) {
    s = MOTION.glide({ from: 2.05, to: 1.3, start: CUES.Access - 0.25, end: CUES.Access + 0.4 })(T);
    ox = MOTION.glide({ from: ENTER_PT.x, to: 960, start: CUES.Access - 0.25, end: CUES.Access + 0.4 })(T);
    oy = MOTION.glide({ from: ENTER_PT.y + 40, to: 380, start: CUES.Access - 0.25, end: CUES.Access + 0.4 })(T);
  } else {
    s = MOTION.rush({ from: 1.3, to: TWEAKS.punchStrength, start: CUES.Punch, end: CUES.Punch + 0.85 })(T);
    ox = 960; oy = 380;
  }
  const shakeE = clamp(1 - (T - HIT) / 0.26, 0, 1) * (T > HIT ? 1 : 0);
  const shX = Math.sin((T - HIT) * 120) * 9 * shakeE, shY = Math.cos((T - HIT) * 96) * 7 * shakeE;
  const dx = -(ox - 960) * s + shX, dy = -(oy - 540) * s + shY;

  const tap = (i) => (T > CUES.Enter ? 0 : Math.max(0, Math.sin(T * (9 + i * 1.7) + i * 2.1)));
  const taps = [tap(0), tap(1), tap(2), tap(3)];
  const press = clamp(MOTION.glide({ from: 0, to: 1, start: CUES.Enter + 0.3, end: HIT })(T), 0, 1)
    * clamp(1 + (CUES.Access - 0.1 - T) / 0.2, 0, 1);
  const reach = MOTION.glide({ from: 0, to: 1, start: CUES.Enter + 0.06, end: CUES.Enter + 0.34 })(T);
  const glow = clamp(1 - Math.abs(T - (HIT + 0.06)) / 0.34, 0, 1);
  const ring = clamp((T - HIT) / 0.34, 0, 1) * (T > HIT ? 1 : 0);

  const glitch = Math.max(clamp(1 - Math.abs(T - (HIT + 0.05)) / 0.14, 0, 1), clamp(1 - Math.abs(T - (CUES.Punch - 0.1)) / 0.18, 0, 1));
  const gShift = glitch ? (hash(Math.floor(T * 34), 3) - 0.5) * 46 * glitch : 0;
  const flicker = 0.965 + 0.035 * Math.sin(T * 39) + (glitch ? (hash(Math.floor(T * 28), 9) - 0.5) * 0.26 : 0);

  const bezelOut = clamp(1 - (T - (CUES.Punch + 0.12)) / 0.4, 0, 1);
  const flash = clamp(1 - Math.abs(T - (CUES.Punch + 0.72)) / 0.18, 0, 1);
  const whiteOp = clamp((T - (CUES.Punch + 0.6)) / 0.34, 0, 1);
  const gl = TWEAKS.glowLevel;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#07080a', overflow: 'hidden', cursor: 'pointer' }} onClick={skip}>
      <div style={{ position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${s})`, transformOrigin: '960px 540px' }}>
        <div style={{ position: 'absolute', left: -500, top: -300, width: 2920, height: 1900, background: 'linear-gradient(180deg,#191b1f 0%,#101215 44%,#0a0b0d 74%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(46% 40% at 16% 26%, rgba(140,180,220,.16), rgba(0,0,0,0) 68%)' }} />
        <Window T={T} />
        <Poster />
        <div style={{ position: 'absolute', left: -500, top: 700, width: 2920, height: 900, background: 'linear-gradient(180deg,#43301f 0%,#2e2116 24%,#1b120b 58%,#120c07 100%)' }}>
          {Array.from({ length: 34 }).map((_, i) => (
            <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 10 + i * 22, height: 1, background: `rgba(255,214,166,${0.02 + hash(i, 7) * 0.035})` }} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 4, background: 'rgba(255,232,198,.13)' }} />
        </div>
        <div style={{ position: 'absolute', left: SX - 300, top: 640, width: SW + 600, height: 340, background: `radial-gradient(50% 60% at 50% 0%, rgba(92,244,154,${0.2 * gl}), rgba(92,244,154,0) 72%)` }} />

        <Monitor opacity={bezelOut} glow={gl} />

        <div style={{
          position: 'absolute', left: SX, top: SY, width: SW, height: SH, overflow: 'hidden',
          background: 'radial-gradient(80% 75% at 50% 42%, #061a0e 0%, #03100a 100%)',
          boxShadow: `inset 0 0 100px rgba(92,244,154,${0.16 * gl})`, opacity: flicker, transform: `translateX(${gShift * 0.25}px)`,
        }}>
          <div style={{ position: 'absolute', inset: 0, transform: `translateX(${gShift}px)` }}>
            <ScreenContent T={T} CUES={CUES} cmd={cmd} />
          </div>
          {TWEAKS.scanlines && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply', background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,.30) 3px, rgba(0,0,0,.30) 4px)' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(118deg, rgba(190,215,235,.07) 0%, rgba(0,0,0,0) 42%)' }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(100% 100% at 50% 50%, rgba(0,0,0,0) 52%, rgba(0,0,0,.6) 100%)' }} />
        </div>

        <Mug T={T} />
        <Keyboard press={press} glow={glow} />
        {ring > 0 && (
          <div style={{
            position: 'absolute', left: ENTER_PT.x - 200, top: ENTER_PT.y - 90, width: 400, height: 180, zIndex: 6,
            borderRadius: '50%', background: `radial-gradient(50% 50% at 50% 50%, rgba(92,244,154,${(1 - ring) * 0.35}), rgba(92,244,154,0) 70%)`,
            transform: `scale(${0.35 + ring * 1.25})`, pointerEvents: 'none',
          }} />
        )}
        <HandPhoto src={handLeft}
          style={{ left: 404, top: 884, width: 446, height: 346, zIndex: 9 }}
          transform={`translateY(${taps[1] * 13}px) rotate(-6deg)`} />
        <HandPhoto src={handRight}
          style={{ left: 1046, top: 884, width: 446, height: 346, zIndex: 9 }}
          transform={`translate(${reach * 300}px, ${taps[0] * 13 + press * 30}px) rotate(4deg)`} />
      </div>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(40% 40% at 50% 42%, rgba(92,244,154,.85), rgba(92,244,154,0) 70%)', opacity: clamp((T - (CUES.Punch + 0.18)) / 0.5, 0, 1) * 0.5 }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(70% 65% at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,.62) 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: '#eafff2', opacity: flash * 0.85, pointerEvents: 'none' }} />
      <Shot from={CUES.Punch + 0.5} to={Infinity}>
        <div style={{ position: 'absolute', inset: 0, background: '#ffffff', opacity: whiteOp }} />
      </Shot>
      <div style={{
        position: 'absolute', right: 46, bottom: 38, fontFamily: MONO, fontSize: 19, letterSpacing: '0.18em',
        color: 'rgba(230,240,235,.42)', opacity: clamp(1 - (T - (CUES.Punch - 0.3)) / 0.3, 0, 1),
      }}>CLICK TO SKIP</div>
    </div>
  );
}

export default Piece;
