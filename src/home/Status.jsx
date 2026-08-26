// "$ cat status.txt" panel: types the command, then its output (current
// occupation) once the section scrolls into view, and below it three
// terminal-styled tabs whose content fades/slides on click.
import { useEffect, useRef, useState } from 'react';
import { useTypewriter } from './useTypewriter';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GREEN = { dim: '#1f7a45', mid: '#3fd07a', bright: '#5cf49a', pale: '#d6ffe6' };

const CMD = '$ cat status.txt';
const OCCUPATION = "Economics & Computer Science @ Bocconi · SWE Intern @ VivaTicket";

const TABS = [
  {
    key: 'education',
    label: 'education',
    items: [
      { title: 'Economics & Computer Science', org: 'Bocconi University', note: 'add dates / details' },
    ],
  },
  {
    key: 'experience',
    label: 'experience',
    items: [
      { title: 'Software Engineer Intern', org: 'VivaTicket', note: 'add dates / details' },
    ],
  },
  {
    key: 'extracurriculars',
    label: 'extracurriculars',
    items: [],
  },
];

function useInView(threshold = 0.35) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

export default function Status() {
  const [sectionRef, inView] = useInView();
  const cmdTyped = useTypewriter(CMD, { start: inView, startDelay: 150, speed: 45 });
  const cmdDone = cmdTyped >= CMD.length;
  const outTyped = useTypewriter(OCCUPATION, { start: cmdDone, startDelay: 200, speed: 22 });
  const outDone = outTyped >= OCCUPATION.length;

  const [tab, setTab] = useState('education');
  const [anim, setAnim] = useState('in');
  const [hover, setHover] = useState(null);

  function selectTab(key) {
    if (key === tab || anim === 'out') return;
    setAnim('out');
    setTimeout(() => {
      setTab(key);
      setAnim('in');
    }, 160);
  }

  const active = TABS.find((t) => t.key === tab);

  const trackRef = useRef(null);
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useEffect(() => {
    function measure() {
      const track = trackRef.current;
      const btn = tabRefs.current[tab];
      if (!track || !btn) return;
      const trackRect = track.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setIndicator({ left: btnRect.left - trackRect.left, width: btnRect.width, ready: true });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [tab, outDone]);

  return (
    <section ref={sectionRef} style={{
      position: 'relative', minHeight: '70vh', background: '#0b0d10', overflow: 'hidden',
      padding: '10vh 8vw', borderTop: '1px solid rgba(92,244,154,.08)',
    }}>
      <div style={{ fontFamily: MONO, fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', color: GREEN.mid }}>
        {CMD.slice(0, cmdTyped)}
        {!cmdDone && <Caret />}
      </div>

      <div style={{
        fontFamily: MONO, fontSize: 'clamp(1.2rem, 2.6vw, 1.9rem)', fontWeight: 500, color: GREEN.pale,
        marginTop: 14, minHeight: '1.4em',
        textShadow: `0 0 20px rgba(92,244,154,.35)`,
      }}>
        {OCCUPATION.slice(0, outTyped)}
        {cmdDone && !outDone && <Caret />}
      </div>

      <div ref={trackRef} style={{
        position: 'relative', display: 'inline-flex', gap: 2, marginTop: '6vh',
        background: 'rgba(92,244,154,.05)', border: '1px solid rgba(92,244,154,.14)',
        borderRadius: 8, padding: 4,
        opacity: outDone ? 1 : 0, transition: 'opacity 400ms ease-out',
      }}>
        {indicator.ready && (
          <div style={{
            position: 'absolute', top: 4, bottom: 4, left: indicator.left, width: indicator.width,
            background: 'rgba(92,244,154,.14)', border: '1px solid rgba(92,244,154,.55)', borderRadius: 6,
            boxShadow: '0 0 14px rgba(92,244,154,.25)',
            transition: 'left 280ms cubic-bezier(.4,0,.2,1), width 280ms cubic-bezier(.4,0,.2,1)',
          }} />
        )}
        {TABS.map((t, i) => {
          const isActive = t.key === tab;
          const isHover = hover === t.key;
          return (
            <button
              key={t.key}
              ref={(el) => { tabRefs.current[t.key] = el; }}
              onClick={() => selectTab(t.key)}
              onMouseEnter={() => setHover(t.key)}
              onMouseLeave={() => setHover(null)}
              style={{
                position: 'relative', zIndex: 1,
                fontFamily: MONO, fontSize: 'clamp(0.85rem, 1.3vw, 1rem)', cursor: 'pointer',
                background: 'transparent', border: 'none', borderRadius: 6, padding: '8px 14px',
                display: 'flex', alignItems: 'baseline', gap: 6,
                color: isActive ? GREEN.pale : isHover ? GREEN.mid : GREEN.dim,
                transition: 'color 200ms',
              }}
            >
              <span style={{ fontSize: '0.75em', opacity: 0.6 }}>{String(i + 1).padStart(2, '0')}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{
        marginTop: '4vh', maxWidth: 620,
        opacity: anim === 'in' ? 1 : 0,
        transform: `translateX(${anim === 'in' ? 0 : -14}px)`,
        transition: anim === 'in' ? 'opacity 220ms ease-out, transform 220ms ease-out' : 'opacity 160ms ease-in, transform 160ms ease-in',
      }}>
        {active.items.length === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 15, color: GREEN.dim, fontStyle: 'italic' }}>
            — nothing here yet —
          </div>
        ) : (
          active.items.map((item) => (
            <div key={item.title} style={{ fontFamily: MONO, marginBottom: 18 }}>
              <div style={{ color: GREEN.pale, fontSize: 17 }}>{item.title}</div>
              <div style={{ color: GREEN.mid, fontSize: 14, marginTop: 3 }}>{item.org}</div>
              <div style={{ color: GREEN.dim, fontSize: 12, marginTop: 3, fontStyle: 'italic' }}>{item.note}</div>
            </div>
          ))
        )}
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
