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

// Cylinder carousel geometry (work-experience column only) — uniform card
// size; the roll's radius is derived from card height and the item count so
// N equal-size cards wrap the full 360deg with no gaps, like paper on a roll.
const ROLL_CARD_W = 320;
const ROLL_CARD_H = 236;
const ROLL_WRAP_H = 460;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
          fontFamily: MONO, fontSize: 13.5, fontWeight: isFront ? 600 : 500,
          color: isFront ? GREEN.bright : GREEN.mid, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
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

// Cards are cheap flat rectangles, so one per 60deg step reads as a hexagon,
// not a cylinder — the front card stays a single crisp flat panel (it needs
// to be perfectly legible), but every OTHER card is built from SUB_SLICES
// thin horizontal strips, each independently rotated across the card's own
// angular span and windowed (via a shared, vertically-shifted content
// block) onto the right band of that card's text. More, thinner facets
// approximate the true curve closely enough that the roll's sides visibly
// warp around instead of looking like flat panels stacked on a hinge.
const SUB_SLICES = 5;

function RollCard({ file, baseAngle, step, radius, drumAngle, isFront, onClick }) {
  if (isFront) {
    return (
      <div
        onClick={onClick}
        style={{
          position: 'absolute', top: '50%', left: '50%', width: ROLL_CARD_W, height: ROLL_CARD_H,
          marginLeft: -ROLL_CARD_W / 2, marginTop: -ROLL_CARD_H / 2,
          transform: `rotateX(${baseAngle}deg) translateZ(${radius}px)`,
          // Without this, a card rotated past 90deg (facing away from the
          // camera, i.e. on the far side of the drum) still renders —
          // mirror-flipped — instead of disappearing. That was the real
          // cause of the overlap: every card on the far side was piling
          // into view at once, not just the near neighbors.
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          cursor: 'default',
        }}
      >
        <div style={{
          width: '100%', height: '100%', overflow: 'hidden', padding: '12px 16px', borderRadius: 8,
          // No hard border/box-shadow rectangle here on purpose — a bright
          // bordered box reads as a flat square against the curved slices
          // around it and breaks the illusion of one continuous drum. A
          // soft radial glow (no edge) marks it as "in focus" instead.
          background: 'radial-gradient(130% 110% at 50% 35%, rgba(92,244,154,.13), rgba(9,13,12,.96) 68%)',
        }}>
          <CardBody file={file} isFront />
        </div>
      </div>
    );
  }

  const sliceH = ROLL_CARD_H / SUB_SLICES;

  return (
    <>
      {Array.from({ length: SUB_SLICES }).map((_, j) => {
        const subAngle = baseAngle - step / 2 + (step * (j + 0.5)) / SUB_SLICES;
        const isTop = j === 0;
        const isBottom = j === SUB_SLICES - 1;
        // Pure lighting, no text — a slice's true angle to the camera (its
        // own rotation plus however far the whole drum has turned) sets how
        // "lit" it looks, like a glossy cylinder catching a light straight
        // ahead. That's what actually reads as curvature and motion once
        // slices can't carry legible content: brightest dead-on, darker as
        // a slice turns away, with nothing to ever misread as overlap.
        const totalAngle = normalizeAngle(drumAngle + subAngle);
        const light = Math.max(0, Math.cos((totalAngle * Math.PI) / 180));
        const mix = light * 0.22;
        const r = Math.round(9 + (92 - 9) * mix);
        const g = Math.round(13 + (244 - 13) * mix);
        const b = Math.round(12 + (154 - 12) * mix);
        return (
          <div
            key={j}
            onClick={onClick}
            style={{
              position: 'absolute', top: '50%', left: '50%', width: ROLL_CARD_W, height: sliceH,
              marginLeft: -ROLL_CARD_W / 2, marginTop: -sliceH / 2,
              transform: `rotateX(${subAngle}deg) translateZ(${radius}px)`,
              backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
              overflow: 'hidden', cursor: 'pointer',
              background: `rgba(${r},${g},${b},.94)`,
              borderTopLeftRadius: isTop ? 8 : 0, borderTopRightRadius: isTop ? 8 : 0,
              borderBottomLeftRadius: isBottom ? 8 : 0, borderBottomRightRadius: isBottom ? 8 : 0,
            }}
          />
        );
      })}
    </>
  );
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

// A roll of paper: N equal-size cards wrap the full 360deg of a small
// cylinder (radius derived from card height + count, so they sit edge to
// edge with no gaps, so a big card height also buys a big, clearly circular
// radius for free). Dragging rotates it continuously, 1:1 with the mouse —
// no discrete steps — and releasing carries real (friction-decayed) spin
// momentum before settling onto the nearest card. Whichever card ends up
// facing front gets the border/glow boost; every card always shows its
// full content, so nothing has to expand/collapse out of sync with the spin.
function Cylinder({ files }) {
  const n = files.length;
  const step = 360 / n;
  const radius = ROLL_CARD_H / (2 * Math.tan(Math.PI / n));

  const [drumAngle, setDrumAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  // True for the whole duration of any spin (drag, momentum, or the eased
  // settle) — while true, no card renders as the single flat "front" panel,
  // so nothing pops between representations as the drum passes each card.
  // That upgrade only happens once it's actually at rest.
  const [animating, setAnimating] = useState(false);
  const angleRef = useRef(0);
  const dragRef = useRef({ startY: 0, startAngle: 0, lastY: 0, lastT: 0, velocity: 0 });
  const rafRef = useRef(null);
  const [containerRef, visible] = useVisible();

  useEffect(() => { angleRef.current = drumAngle; }, [drumAngle]);
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const settleTo = (target, duration = 480, fromOverride) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // fromOverride: pass the just-computed position when chaining straight out
    // of the momentum loop, since angleRef won't have caught up to it yet
    // (it syncs from an effect that hasn't run for this frame).
    const start = fromOverride != null ? fromOverride : angleRef.current;
    const delta = target - start;
    const t0 = performance.now();
    setAnimating(true);
    const step2 = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      setDrumAngle(start + delta * easeOutCubic(t));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(step2);
      } else {
        rafRef.current = null;
        setAnimating(false);
      }
    };
    rafRef.current = requestAnimationFrame(step2);
  };

  // Read angleRef (not the closed-over `drumAngle` state) so these stay
  // correct without needing to be redefined on every animation frame.
  const go = (delta) => settleTo(Math.round(angleRef.current / step) * step + delta * step);
  const goToIndex = (i, duration) => settleTo(nearestEquivalent(angleRef.current, -i * step), duration);

  useEffect(() => {
    if (!visible) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); go(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, n, step]);

  // Real spin: released above a flick threshold, the drum keeps turning
  // under its own (simulated) inertia, losing speed to exponential
  // friction each frame, and only snaps to the nearest card once it's
  // slowed down enough — a proper decelerating spin, not a short ease.
  const spinWithMomentum = (initialVelocity) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setAnimating(true);
    const FRICTION_PER_MS = 0.0018; // ~385ms half-life
    const MIN_VELOCITY = 0.006; // deg/ms — below this, hand off to the settle ease
    let v = initialVelocity;
    let pos = angleRef.current;
    let lastT = performance.now();
    const frame = (now) => {
      const dt = now - lastT;
      lastT = now;
      v *= Math.exp(-FRICTION_PER_MS * dt);
      pos += v * dt;
      setDrumAngle(pos);
      if (Math.abs(v) > MIN_VELOCITY) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = null;
        settleTo(Math.round(pos / step) * step, 380, pos);
      }
    };
    rafRef.current = requestAnimationFrame(frame);
  };

  const onPointerDown = (e) => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    setDragging(true);
    dragRef.current = { startY: e.clientY, startAngle: angleRef.current, lastY: e.clientY, lastT: performance.now(), velocity: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const now = performance.now();
    const newAngle = dragRef.current.startAngle + (e.clientY - dragRef.current.startY) * 0.6;
    const dt = now - dragRef.current.lastT;
    if (dt > 0) {
      const instV = (newAngle - angleRef.current) / dt;
      // Low-pass the velocity sample so one noisy last-pixel move before
      // release doesn't dictate the whole spin.
      dragRef.current.velocity = dragRef.current.velocity * 0.7 + instV * 0.3;
    }
    dragRef.current.lastT = now;
    setDrumAngle(newAngle);
  };
  const endDrag = () => {
    if (!dragging) return;
    setDragging(false);
    const v = dragRef.current.velocity;
    if (Math.abs(v) > 0.05) {
      spinWithMomentum(v);
    } else {
      settleTo(Math.round(angleRef.current / step) * step, 400);
    }
  };

  let frontIndex = 0, frontDist = Infinity;
  files.forEach((f, i) => {
    const d = Math.abs(normalizeAngle(drumAngle + i * step));
    if (d < frontDist) { frontDist = d; frontIndex = i; }
  });

  // The flat, fully-legible "front" treatment only kicks in once the drum
  // has actually stopped — mid-spin every card renders as the uniform
  // curved slices, so nothing snaps between representations as it passes.
  const settled = !dragging && !animating;

  return (
    <div ref={containerRef}>
      <Timeline files={files} frontIndex={frontIndex} onSelect={(i) => goToIndex(i, 1400)} />

      <div style={{ position: 'relative', height: ROLL_WRAP_H, marginTop: 36, perspective: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          style={{
            position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d',
            transform: `rotateX(${drumAngle}deg)`,
            touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none',
          }}
        >
          {files.map((f, i) => (
            <RollCard
              key={f.key}
              file={f}
              baseAngle={i * step}
              step={step}
              radius={radius}
              drumAngle={drumAngle}
              isFront={settled && i === frontIndex}
              onClick={i === frontIndex ? undefined : () => goToIndex(i)}
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
          <Cylinder files={EXPERIENCE} />
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
