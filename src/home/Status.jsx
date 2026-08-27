// "$ cat status.txt" panel: types the command, then its output (current
// occupation) once the section scrolls into view, then three columns —
// education / experience (wider, the focal one) / extracurriculars — each a
// "storage tower" of stacked cards. At rest each card shows only its title,
// tilted and overlapping like index cards in a drawer; hovering pulls one
// forward (un-rotates, lifts, expands) and moving away lets it slide back
// into the stack. The current role stays popped out by default.
import { useEffect, useRef, useState } from 'react';
import { useTypewriter } from './useTypewriter';
import { useInView } from './useInView';
import logoBocconi from './assets/logos/bocconi.png';
import logoInstitut from './assets/logos/institut.png';
import logoVivaticket from './assets/logos/vivaticket.png';
import logoGeneve from './assets/logos/geneve.png';
import logoCern from './assets/logos/cern.png';
import logoMsc from './assets/logos/msc.png';
import logoPg from './assets/logos/pg.png';
import logoAstra from './assets/logos/astra.png';
import logoLovable from './assets/logos/lovable.png';
import logoHacklab from './assets/logos/hacklab.png';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GREEN = { dim: '#1f7a45', mid: '#3fd07a', bright: '#5cf49a', pale: '#d6ffe6' };

const CMD = '$ cat status.txt';
const OCCUPATION = "Econ & Computer Science @ Bocconi · SWE Intern @ VivaTicket";

// Verbatim from michelematozza.com — do not paraphrase/reword entries here;
// add badges as exact substrings alongside the full bullet, never in place of it.
const EDUCATION = [
  {
    key: 'bocconi', org: 'Bocconi University', logo: logoBocconi, period: 'Aug 2024 - Jun 2027', location: 'Milan, Italy',
    roles: [{
      title: 'Bachelor in Economics, Management and Computer Science',
      bullets: ['Course Representative, Statistics: 31/30, Computer Science: 29/30, IT Law: 30/30'],
      badges: ['31/30', '29/30', '30/30'],
    }],
  },
  {
    key: 'lancy-ib', org: 'Institut International de Lancy', logo: logoInstitut, period: '2022 - 2024', location: 'Geneva, Switzerland',
    roles: [{
      title: 'International Baccalaureat',
      bullets: ['Physics, Mathematics, Business Management, Chemistry, Italian Literature, English Literature'],
    }],
  },
];

const EXPERIENCE = [
  {
    key: 'vivaticket', org: 'VivaTicket', logo: logoVivaticket, defaultOpen: true,
    period: '2026 - Present', location: 'Milan, Italy',
    roles: [{
      title: 'Software Engineer Intern',
      bullets: [
        'Building features in TypeScript within the engineering team',
        'Working on software infrastructure and internal systems of the ticketing platform',
        'Collaborating within an international product team',
      ],
    }],
  },
  {
    key: 'geneve', org: 'Ville de Genève', logo: logoGeneve, period: 'July 2025 - August 2025', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Intern at Service des Relations Extérieures',
      bullets: [
        'Assisted with daily tasks and contributed to organizing the Swiss National Day (1st August)',
        'Collaborated in a diverse team environment',
        'Utilized Microsoft Excel and PowerPoint to support projects and presentations',
      ],
    }],
  },
  {
    key: 'cern', org: 'CERN', logo: logoCern, period: 'July 2023 - July 2023', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Shadow Program',
      bullets: [
        'Exploration of how scientific discoveries are made, via the application of the scientific method and collaborative research',
        'Application of scientific method in simple Physics experiments and data analysis with Discrete Fourier Transforms',
        'Data Analysis in Excel',
      ],
    }],
  },
  {
    key: 'msc', org: 'Mediterranean Shipping Company (MSC)', logo: logoMsc, period: 'June 2023 - June 2023', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Intern',
      bullets: [
        'Working in the IT department of a global corporation using SCRUM methodology',
        'Introduction to Git and C#',
        'Application of programming principles in developing backend solutions for internal systems',
      ],
    }],
  },
  {
    key: 'pg', org: 'Procter & Gamble', logo: logoPg, period: 'June 2022 - June 2022', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Shadow Program',
      bullets: [
        'Working alongside a senior brand manager',
        'Assigned a research project to develop branding solution to win amongst point of market entry consumers',
        'Understood the importance of marketing and branding in developing a solution',
      ],
    }],
  },
  {
    key: 'lancy-basketball', org: 'Institut International de Lancy', logo: logoInstitut, period: 'September 2022 - April 2024', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Basketball Coach',
      bullets: ['Worked with children aged 8-16', 'Developed adaptive communication skills'],
    }],
  },
];

const EXTRACURRICULARS = [
  {
    key: 'astra', org: 'Astra Bocconi', logo: logoAstra, period: 'Oct 2024 - Present',
    roles: [
      {
        title: 'Head of Technology', period: 'Aug 2025 - Present',
        bullets: ['Leading the technology division, overseeing technical projects and driving innovation within the organization.'],
        links: ['Free at B', 'Website'],
      },
      {
        title: 'Board Member', period: 'Oct 2024 - Aug 2025',
        bullets: ['Contributed to strategic decisions and organizational growth as an active board member.'],
      },
    ],
  },
  {
    key: 'lovable', org: 'Lovable', logo: logoLovable, period: 'Jan 2025 - Jul 2026',
    roles: [{
      title: 'Lovable Campus Leader (former)', period: 'Jan 2025 - Jul 2026',
      bullets: ['Chosen as one of the Lovable Ambassadors to represent Lovable through events and partnerships.'],
    }],
  },
  {
    key: 'hacklab', org: 'Hacklab', logo: logoHacklab, period: 'Oct 2024 - Present',
    roles: [
      {
        title: 'President', period: 'Jan 2025 - Present',
        bullets: ['Leading the organization and driving hackathon culture within the university community.'],
      },
      {
        title: 'Hackathon Participant', period: 'Oct 2024 - Dec 2025',
        bullets: ['3x Hackathon participant, 1x first place, 1x third place.'],
        badges: ['3x', '1x first place', '1x third place'],
      },
    ],
  },
];

function Bullet({ text, color = GREEN.mid, size = 12.5 }) {
  return (
    <div style={{ display: 'flex', gap: 7, marginTop: 5, fontFamily: MONO }}>
      <span style={{ color: GREEN.dim, fontSize: size }}>▸</span>
      <span style={{ color, fontSize: size, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function Meta({ children }) {
  return <div style={{ fontFamily: MONO, color: GREEN.dim, fontSize: 11.5, marginTop: 2 }}>{children}</div>;
}

function Links({ links }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
      {links.map((l) => (
        <span key={l} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 11.5, color: GREEN.dim }}>
          <span style={{ fontSize: 10 }}>↗</span>{l}
        </span>
      ))}
    </div>
  );
}

function Badges({ badges, badgesIn }) {
  return (
    <div style={{ display: 'flex', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
      {badges.map((b, i) => (
        <span key={b} style={{
          fontFamily: MONO, fontSize: 10.5, color: GREEN.bright,
          background: 'rgba(92,244,154,.10)', border: '1px solid rgba(92,244,154,.35)',
          borderRadius: 999, padding: '3px 9px',
          opacity: badgesIn ? 1 : 0, transform: badgesIn ? 'scale(1)' : 'scale(.6)',
          transition: `opacity 220ms ease-out ${i * 70}ms, transform 220ms ease-out ${i * 70}ms`,
        }}>
          {b}
        </span>
      ))}
    </div>
  );
}

function StackCard({ file, index, accent, isOpen, onEnter, onLeave }) {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        marginTop: index === 0 ? 0 : -13,
        zIndex: isOpen ? 60 : index,
        transform: isOpen ? 'translateY(-6px) scale(1.02)' : 'translateY(0px) scale(1)',
        transition: 'transform 420ms cubic-bezier(.22,.85,.25,1), box-shadow 420ms ease, border-color 300ms ease',
        background: isOpen ? 'rgba(11,16,14,.95)' : 'rgba(11,16,14,.68)',
        border: `1px solid rgba(92,244,154,${isOpen ? (accent ? 0.55 : 0.4) : 0.16})`,
        borderRadius: 8,
        boxShadow: isOpen
          ? `0 22px 44px rgba(0,0,0,.6), 0 0 26px rgba(92,244,154,${accent ? 0.3 : 0.16})`
          : '0 2px 5px rgba(0,0,0,.45)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {file.logo && (
            <div style={{
              width: accent ? 34 : 28, height: accent ? 34 : 28, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(0,0,0,.4)', border: `1px solid rgba(92,244,154,${isOpen ? 0.5 : 0.22})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              transition: 'border-color 300ms',
            }}>
              <img src={file.logo} alt="" style={{ width: '62%', height: '62%', objectFit: 'contain' }} />
            </div>
          )}
          <span style={{
            fontFamily: MONO, fontSize: accent ? 15 : 13.5, fontWeight: isOpen ? 600 : 500, lineHeight: 1.25,
            color: isOpen ? (accent ? GREEN.bright : GREEN.pale) : GREEN.mid,
            transition: 'color 300ms',
          }}>
            {file.org}
          </span>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: GREEN.dim, whiteSpace: 'nowrap', flexShrink: 0 }}>{file.period}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 420ms cubic-bezier(.22,.85,.25,1)' }}>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ padding: '0 16px 16px' }}>
            {file.location && <Meta>{file.location}</Meta>}
            {file.roles.map((r, i) => (
              <div key={r.title} style={{ marginTop: i === 0 ? 8 : 14 }}>
                <div style={{ fontFamily: MONO, color: accent ? GREEN.pale : GREEN.mid, fontSize: accent ? 14 : 12.5 }}>
                  {r.title}
                </div>
                {r.period && <Meta>{r.period}</Meta>}
                {r.bullets.map((b, bi) => <Bullet key={bi} text={b} size={accent ? 13 : 12} />)}
                {r.badges && <Badges badges={r.badges} badgesIn={isOpen} />}
                {r.links && <Links links={r.links} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stack({ files, accent }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ perspective: 900 }}>
      {files.map((f, i) => {
        const isOpen = hovered ? hovered === f.key : !!f.defaultOpen;
        return (
          <StackCard
            key={f.key}
            file={f}
            index={i}
            accent={accent}
            isOpen={isOpen}
            onEnter={() => setHovered(f.key)}
            onLeave={() => setHovered(null)}
          />
        );
      })}
    </div>
  );
}

// Continuously-updating visibility (unlike useInView, which fires once) —
// needed to gate the keyboard listener only while the carousel is on screen.
function useVisible(threshold = 0.2) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// Normalize an angle in degrees to (-180, 180].
function normalizeAngle(deg) {
  let a = deg % 360;
  if (a <= -180) a += 360;
  if (a > 180) a -= 360;
  return a;
}

// Nearest angle to `current` that is congruent to `desiredMod360` (mod 360) —
// so rotating to a target always takes the shortest path, never the long way
// round, no matter how many turns `current` has already accumulated.
function nearestEquivalent(current, desiredMod360) {
  const base = ((desiredMod360 % 360) + 360) % 360;
  const curMod = ((current % 360) + 360) % 360;
  let diff = base - curMod;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return current + diff;
}

const easeOutCubic = (t) => 1 - (1 - t) ** 3;

function CardBody({ file, isFront }) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {file.logo && (
          <div style={{
            width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(0,0,0,.4)', border: `1px solid rgba(92,244,154,${isFront ? 0.5 : 0.18})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          }}>
            <img src={file.logo} alt="" style={{ width: '62%', height: '62%', objectFit: 'contain' }} />
          </div>
        )}
        <span style={{
          fontFamily: MONO, fontSize: 13.5, fontWeight: isFront ? 600 : 500, lineHeight: 1.3,
          color: isFront ? GREEN.bright : GREEN.mid, flex: '1 1 auto', minWidth: 0,
        }}>
          {file.org}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 10, color: GREEN.dim, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {file.period}
        </span>
      </div>

      {file.location && <Meta>{file.location}</Meta>}
      {file.roles.map((r, i) => (
        <div key={r.title} style={{ marginTop: i === 0 ? 8 : 12 }}>
          <div style={{ fontFamily: MONO, color: isFront ? GREEN.pale : GREEN.mid, fontSize: 12.5 }}>
            {r.title}
          </div>
          {r.period && <Meta>{r.period}</Meta>}
          {r.bullets.map((b, bi) => <Bullet key={bi} text={b} size={11} />)}
          {r.badges && <Badges badges={r.badges} badgesIn={isFront} />}
          {r.links && <Links links={r.links} />}
        </div>
      ))}
    </>
  );
}

// Six experiences, six faces of an actual cube — not a metaphor for one, a
// real static box: each face sits at a fixed 90deg orientation (front/back/
// left/right/top/bottom) and only the whole box rotates. A flat face can
// never overlap its neighbor the way a curved/sliced surface could, so this
// is naturally overlap-proof at any rotation, dragged or not.
const FACES = [
  { key: 'front', normal: [0, 0, 1], staticTransform: '', targetRx: 0, targetRy: 0 },
  { key: 'right', normal: [1, 0, 0], staticTransform: 'rotateY(90deg)', targetRx: 0, targetRy: -90 },
  { key: 'back', normal: [0, 0, -1], staticTransform: 'rotateY(180deg)', targetRx: 0, targetRy: 180 },
  { key: 'left', normal: [-1, 0, 0], staticTransform: 'rotateY(-90deg)', targetRx: 0, targetRy: 90 },
  { key: 'top', normal: [0, 1, 0], staticTransform: 'rotateX(-90deg)', targetRx: 90, targetRy: 0 },
  { key: 'bottom', normal: [0, -1, 0], staticTransform: 'rotateX(90deg)', targetRx: -90, targetRy: 0 },
];

// How much a face's normal points at the camera (+1 dead-on, 0 edge-on,
// negative facing away) once the box is rotated by rx (pitch) then ry
// (yaw) — matches the order CSS applies `rotateX(rx) rotateY(ry)`, i.e.
// yaw first in local space, then pitch. Same value drives both which face
// is "front" (the max) and how brightly lit each face looks.
function faceDepth(rx, ry, normal) {
  const [nx, ny, nz] = normal;
  const b = (ry * Math.PI) / 180;
  const a = (rx * Math.PI) / 180;
  const x1 = nx * Math.cos(b) + nz * Math.sin(b);
  const y1 = ny;
  const z1 = -nx * Math.sin(b) + nz * Math.cos(b);
  return y1 * Math.sin(a) + z1 * Math.cos(a);
}

function CubeFace({ file, face, size, rx, ry, isFront, onClick }) {
  const half = size / 2;
  const transform = `${face.staticTransform ? `${face.staticTransform} ` : ''}translateZ(${half}px)`;
  const light = Math.max(0, faceDepth(rx, ry, face.normal));

  if (isFront) {
    return (
      <div
        onClick={onClick}
        style={{
          position: 'absolute', top: '50%', left: '50%', width: size, height: size,
          marginLeft: -half, marginTop: -half, transform,
          // Without this, a face rotated past 90deg (facing away from the
          // camera, i.e. the far side of the box) still renders —
          // mirror-flipped — instead of disappearing.
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          cursor: 'default',
        }}
      >
        <div style={{
          width: '100%', height: '100%', overflow: 'hidden', clipPath: 'inset(0 round 10px)',
          padding: '14px 18px', borderRadius: 10,
          background: 'radial-gradient(130% 110% at 50% 35%, rgba(92,244,154,.13), rgba(9,13,12,.96) 68%)',
        }}>
          <CardBody file={file} isFront />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute', top: '50%', left: '50%', width: size, height: size,
        marginLeft: -half, marginTop: -half, transform,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        // overflow:hidden alone is unreliable here — Chromium doesn't
        // always clip content inside an element that's itself transformed
        // in a preserve-3d context, so a face with more bullets than fit
        // its height could bleed into whatever's rendered behind it.
        // clip-path is a hard, dependable clip regardless of that.
        overflow: 'hidden', clipPath: 'inset(0 round 10px)',
        cursor: 'pointer', borderRadius: 10,
        background: `rgba(${Math.round(9 + 83 * light * 0.25)},${Math.round(13 + 231 * light * 0.25)},${Math.round(12 + 142 * light * 0.25)},.96)`,
      }}
    >
      <div style={{ padding: '14px 18px', opacity: Math.max(0.3, light) }}>
        <CardBody file={file} isFront={false} />
      </div>
    </div>
  );
}

// Cube side length, responsive to viewport width so it stays sensible from
// phone to wide desktop, re-measured on resize.
function useCubeSize() {
  const compute = () => (typeof window === 'undefined' ? 280 : Math.max(210, Math.min(320, window.innerWidth * 0.22)));
  const [size, setSize] = useState(compute);
  useEffect(() => {
    const onResize = () => setSize(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

// A quick-nav strip under the "$ ./work-experience" header: one marker per
// role, in the same order as the roll. Clicking a marker spins the drum to
// bring that role to front — deliberately slower than the roll's own
// click-a-neighbor nudge, so the spin itself is visible, not a snap.
function Timeline({ files, frontIndex, onSelect }) {
  return (
    <div style={{ position: 'relative', margin: '20px 4px 6px' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 5, height: 1, background: 'rgba(92,244,154,.18)' }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between' }}>
        {files.map((f, i) => {
          const active = i === frontIndex;
          return (
            <button
              key={f.key}
              onClick={() => onSelect(i)}
              style={{
                all: 'unset', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                cursor: 'pointer', flex: '0 0 auto',
              }}
            >
              <span style={{
                width: active ? 11 : 7, height: active ? 11 : 7, borderRadius: '50%',
                background: active ? GREEN.bright : 'rgba(92,244,154,.4)',
                boxShadow: active ? `0 0 10px ${GREEN.bright}` : 'none',
                transition: 'width 200ms ease, height 200ms ease, background 200ms ease, box-shadow 200ms ease',
              }} />
              <span style={{
                fontFamily: MONO, fontSize: 10.5, whiteSpace: 'nowrap',
                color: active ? GREEN.pale : GREEN.dim,
                transition: 'color 200ms ease',
              }}>
                {f.period.split(' - ')[0].trim()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Free two-axis rotation: vertical drag pitches (rx), horizontal drag yaws
// (ry), both continuously — a real trackball, not a single-axis roll.
// Releasing above a flick threshold keeps spinning under simulated inertia
// on both axes at once, decelerating to friction, then always settles onto
// whichever of the 6 faces ends up most nearly facing the camera. Clicking
// a timeline marker instead spins straight to that face's own fixed resting
// orientation (rx/ry each a multiple of 90deg), by the shortest path on
// each axis independently, so it never spins the long way round.
function Cube({ files }) {
  const size = useCubeSize();
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [dragging, setDragging] = useState(false);
  // True for the whole duration of any spin (drag, momentum, or the eased
  // settle) — while true, no face renders as the single flat "front" panel,
  // so nothing pops between representations as the box passes each face.
  const [animating, setAnimating] = useState(false);
  const rxRef = useRef(0);
  const ryRef = useRef(0);
  const dragRef = useRef({ startX: 0, startY: 0, startRx: 0, startRy: 0, lastT: 0, vRx: 0, vRy: 0 });
  const rafRef = useRef(null);
  const [containerRef, visible] = useVisible();

  useEffect(() => { rxRef.current = rx; }, [rx]);
  useEffect(() => { ryRef.current = ry; }, [ry]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const settleTo = (targetRx, targetRy, duration = 480, fromOverride) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // fromOverride: pass the just-computed position when chaining straight out
    // of the momentum loop, since the refs won't have caught up to it yet
    // (they sync from an effect that hasn't run for this frame).
    const startRx = fromOverride ? fromOverride.rx : rxRef.current;
    const startRy = fromOverride ? fromOverride.ry : ryRef.current;
    const deltaRx = targetRx - startRx;
    const deltaRy = targetRy - startRy;
    const t0 = performance.now();
    setAnimating(true);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = easeOutCubic(t);
      setRx(startRx + deltaRx * eased);
      setRy(startRy + deltaRy * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        setAnimating(false);
      }
    };
    rafRef.current = requestAnimationFrame(step);
  };

  // Whichever face's normal currently points most toward the camera —
  // recomputed every render straight from the live rx/ry, so it's correct
  // mid-drag and mid-spin too, not just once settled.
  const frontFaceAt = (testRx, testRy) => {
    let bi = 0, bd = -Infinity;
    FACES.forEach((f, i) => {
      const d = faceDepth(testRx, testRy, f.normal);
      if (d > bd) { bd = d; bi = i; }
    });
    return bi;
  };
  const frontIndex = frontFaceAt(rx, ry);

  const settleToNearestFace = (fromOverride) => {
    const testRx = fromOverride ? fromOverride.rx : rxRef.current;
    const testRy = fromOverride ? fromOverride.ry : ryRef.current;
    const target = FACES[frontFaceAt(testRx, testRy)];
    settleTo(nearestEquivalent(testRx, target.targetRx), nearestEquivalent(testRy, target.targetRy), 420, fromOverride);
  };

  const goToFace = (i, duration = 1400) => {
    const target = FACES[i];
    settleTo(nearestEquivalent(rxRef.current, target.targetRx), nearestEquivalent(ryRef.current, target.targetRy), duration);
  };

  useEffect(() => {
    if (!visible) return undefined;
    const round90 = (a) => Math.round(a / 90) * 90;
    const onKey = (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); settleTo(nearestEquivalent(rxRef.current, round90(rxRef.current) - 90), ryRef.current, 420); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); settleTo(nearestEquivalent(rxRef.current, round90(rxRef.current) + 90), ryRef.current, 420); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); settleTo(rxRef.current, nearestEquivalent(ryRef.current, round90(ryRef.current) - 90), 420); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); settleTo(rxRef.current, nearestEquivalent(ryRef.current, round90(ryRef.current) + 90), 420); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Real spin on both axes: released above a flick threshold, the box keeps
  // turning under its own (simulated) inertia, losing speed to exponential
  // friction each frame, and only snaps to the nearest face once it's
  // slowed down enough — a proper decelerating spin, not a short ease.
  const spinWithMomentum = (initialVRx, initialVRy) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setAnimating(true);
    const FRICTION_PER_MS = 0.0018; // ~385ms half-life
    const MIN_SPEED = 0.008; // deg/ms combined — below this, hand off to the settle ease
    let vRx = initialVRx, vRy = initialVRy;
    let px = rxRef.current, py = ryRef.current;
    let lastT = performance.now();
    const frame = (now) => {
      const dt = now - lastT;
      lastT = now;
      const decay = Math.exp(-FRICTION_PER_MS * dt);
      vRx *= decay; vRy *= decay;
      px += vRx * dt; py += vRy * dt;
      setRx(px); setRy(py);
      if (Math.hypot(vRx, vRy) > MIN_SPEED) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
        settleToNearestFace({ rx: px, ry: py });
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  const onPointerDown = (e) => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setDragging(true);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startRx: rxRef.current, startRy: ryRef.current, lastT: performance.now(), vRx: 0, vRy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const now = performance.now();
    const SENS = 0.4;
    const newRx = dragRef.current.startRx - (e.clientY - dragRef.current.startY) * SENS;
    const newRy = dragRef.current.startRy + (e.clientX - dragRef.current.startX) * SENS;
    const dt = now - dragRef.current.lastT;
    if (dt > 0) {
      const instVRx = (newRx - rxRef.current) / dt;
      const instVRy = (newRy - ryRef.current) / dt;
      // Low-pass the velocity sample so one noisy last-pixel move before
      // release doesn't dictate the whole spin.
      dragRef.current.vRx = dragRef.current.vRx * 0.7 + instVRx * 0.3;
      dragRef.current.vRy = dragRef.current.vRy * 0.7 + instVRy * 0.3;
    }
    dragRef.current.lastT = now;
    setRx(newRx);
    setRy(newRy);
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const { vRx, vRy } = dragRef.current;
    if (Math.hypot(vRx, vRy) > 0.04) {
      spinWithMomentum(vRx, vRy);
    } else {
      settleToNearestFace();
    }
  };

  // The flat, fully-legible "front" treatment only kicks in once the box
  // has actually stopped — mid-spin every face renders at its natural
  // brightness, so nothing snaps between representations as it passes.
  const settled = !dragging && !animating;

  return (
    <div ref={containerRef}>
      <Timeline files={files} frontIndex={frontIndex} onSelect={(i) => goToFace(i, 1400)} />

      <div style={{ position: 'relative', height: size * 1.9, marginTop: 36, perspective: 760, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: 'relative', width: size, height: size, transformStyle: 'preserve-3d',
            transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
            touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none',
          }}
        >
          {FACES.map((face, i) => (
            <CubeFace
              key={face.key}
              file={files[i]}
              face={face}
              size={size}
              rx={rx}
              ry={ry}
              isFront={settled && i === frontIndex}
              onClick={i === frontIndex ? undefined : () => goToFace(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Column({ title, accent, children }) {
  return (
    <div style={{ borderLeft: `1px solid rgba(92,244,154,${accent ? 0.3 : 0.14})`, paddingLeft: 20 }}>
      <div style={{
        fontFamily: MONO, fontSize: accent ? 15 : 13, color: accent ? GREEN.bright : GREEN.mid,
        letterSpacing: '0.04em', marginBottom: accent ? 22 : 18,
        textShadow: accent ? '0 0 16px rgba(92,244,154,.4)' : 'none',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function useNarrow(breakpoint = 900) {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return narrow;
}

export default function Status() {
  const [sectionRef, inView] = useInView();
  const cmdTyped = useTypewriter(CMD, { start: inView, startDelay: 150, speed: 45 });
  const cmdDone = cmdTyped >= CMD.length;
  const outTyped = useTypewriter(OCCUPATION, { start: cmdDone, startDelay: 200, speed: 22 });
  const outDone = outTyped >= OCCUPATION.length;
  // education/extracurriculars are unrendered for now (see note below) —
  // useNarrow stays defined for when they move into their own section.

  return (
    <section ref={sectionRef} style={{
      position: 'relative', background: '#0b0d10', overflow: 'hidden',
      padding: '10vh max(64px, 16vw) 14vh', borderTop: '1px solid rgba(92,244,154,.08)',
    }}>
      <div style={{ fontFamily: MONO, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: GREEN.mid }}>
        {CMD.slice(0, cmdTyped)}
        {!cmdDone && <Caret />}
      </div>

      <div style={{
        fontFamily: MONO, fontSize: 'clamp(1.2rem, 2.6vw, 1.9rem)', fontWeight: 500, color: GREEN.pale,
        marginTop: 14, minHeight: '1.4em',
        textShadow: '0 0 20px rgba(92,244,154,.35)',
      }}>
        {OCCUPATION.slice(0, outTyped)}
        {cmdDone && !outDone && <Caret />}
      </div>

      {/* Education / extracurriculars temporarily unrendered (not deleted —
          EDUCATION/EXTRACURRICULARS data and <Stack>/<Column> below are
          still here to move into their own section later). Work-experience
          gets the full section width for now, room for the bigger roll. */}
      <div style={{
        marginTop: '8vh',
        opacity: outDone ? 1 : 0,
        transform: `translateY(${outDone ? 0 : 16}px)`,
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}>
        <Column title="$ ./work-experience" accent>
          <Cube files={EXPERIENCE} />
        </Column>
      </div>
    </section>
  );
}

function Caret() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setOn((c) => !c), 500);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{
      display: 'inline-block', width: '0.5em', height: '0.9em', marginLeft: 4, verticalAlign: '-0.12em',
      background: GREEN.bright, opacity: on ? 0.95 : 0.12, boxShadow: `0 0 12px ${GREEN.bright}`,
    }} />
  );
}
