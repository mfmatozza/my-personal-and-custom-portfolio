// Landing hero shown after the intro finishes: a big, zoomed-in terminal
// that types out a greeting, with a circular photo that rolls in from the
// right like a wheel (translateX and rotate are locked to the same eased
// progress, and the travel distance is snapped to a whole number of the
// circle's circumference, so it always lands rotated to an exact multiple
// of 360deg — upright — no matter the viewport size). On scroll it un-docks
// from the hero and rides, fixed, into the header as a small avatar.
import { useEffect, useRef, useState } from 'react';
import photo from './assets/michele.jpg';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GREEN = { dim: '#1f7a45', mid: '#3fd07a', bright: '#5cf49a', pale: '#d6ffe6' };
const BG = '#07080a';

const GREETING = "Hi, I'm Michele";
const HEADER_H = 64;
const DOCK = { size: 40, right: 20, top: (HEADER_H - 40) / 2 };

function heroRect() {
  const w = window.innerWidth, h = window.innerHeight;
  const size = Math.min(380, Math.max(180, w * 0.26));
  const right = Math.max(48, w * 0.08);
  return { size, right, top: h / 2 - size / 2 };
}

// Rolling-entrance math: pick the smallest travel distance that both clears
// the right edge of the screen and is a whole multiple of the circle's
// circumference, so translateX 0 and rotate 0 (mod 360) land together.
function rollEntry(rect) {
  const circumference = Math.PI * rect.size; // 2*pi*r, r = size/2
  const minTravel = window.innerWidth - rect.right + rect.size;
  const turns = Math.max(1, Math.ceil(minTravel / circumference));
  return { distance: turns * circumference, rotation: -360 * turns };
}

function useTypewriter(text, { startDelay = 300, speed = 55 } = {}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let i = 0;
    let intervalId;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) clearInterval(intervalId);
      }, speed);
    }, startDelay);
    return () => { clearTimeout(timeoutId); clearInterval(intervalId); };
  }, [text, startDelay, speed]);
  return count;
}

function lerp(a, b, t) { return a + (b - a) * t; }

export default function Hero() {
  const typed = useTypewriter(GREETING);
  const [caretOn, setCaretOn] = useState(true);
  const [rect, setRect] = useState(heroRect);
  const [entry] = useState(() => rollEntry(heroRect()));
  const [rolled, setRolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const tickingRef = useRef(false);

  useEffect(() => {
    const onResize = () => setRect(heroRect());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setCaretOn((c) => !c), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setRolled(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        const p = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
        setProgress(p);
        tickingRef.current = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dockSpin = progress * 360;
  const avatarTop = lerp(rect.top, DOCK.top, progress);
  const avatarRight = lerp(rect.right, DOCK.right, progress);
  const avatarSize = lerp(rect.size, DOCK.size, progress);
  const headerOpacity = Math.min(1, Math.max(0, (progress - 0.05) / 0.3));

  return (
    <>
      <section style={{
        position: 'relative', minHeight: '100vh', background: BG, overflow: 'hidden',
        display: 'flex', alignItems: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 60% at 30% 45%, rgba(92,244,154,.08), rgba(0,0,0,0) 70%)' }} />
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'multiply',
          background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,.28) 3px, rgba(0,0,0,.28) 4px)',
        }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(100% 100% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,.65) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '0 8vw', maxWidth: '68%' }}>
          <div style={{ fontFamily: MONO, fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)', color: GREEN.mid, opacity: 0.8, marginBottom: 18 }}>
            $ whoami
          </div>
          <div style={{
            fontFamily: MONO, fontWeight: 700, fontSize: 'clamp(2.6rem, 8vw, 7rem)', lineHeight: 1.05,
            letterSpacing: '-0.01em', color: GREEN.pale,
            textShadow: `0 0 30px ${GREEN.bright}, 0 0 90px rgba(92,244,154,.4)`,
          }}>
            {GREETING.slice(0, typed)}
            <span style={{
              display: 'inline-block', width: '0.5em', height: '0.85em', marginLeft: 6, verticalAlign: '-0.1em',
              background: GREEN.bright, opacity: caretOn ? 0.95 : 0.12, boxShadow: `0 0 16px ${GREEN.bright}`,
            }} />
          </div>
        </div>
      </section>

      <div style={{
        position: 'fixed', top: `${avatarTop}px`, right: `${avatarRight}px`,
        width: `${avatarSize}px`, height: `${avatarSize}px`, borderRadius: '50%',
        zIndex: 200, pointerEvents: 'none',
        transform: `rotate(${dockSpin}deg)`,
        boxShadow: rolled ? `0 0 0 2px rgba(92,244,154,${0.25 + 0.35 * progress}), 0 10px 40px rgba(0,0,0,.55)` : 'none',
        transition: 'box-shadow 500ms ease-out',
      }}>
        <div style={{
          width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
          transform: `translateX(${rolled ? 0 : entry.distance}px) rotate(${rolled ? entry.rotation : 0}deg)`,
          transition: 'transform 1300ms cubic-bezier(0.16,0.85,0.24,1)',
        }}>
          <img src={photo} alt="Michele Matozza" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>

      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: HEADER_H, zIndex: 190,
        display: 'flex', alignItems: 'center', padding: '0 20px',
        background: `rgba(5,7,9,${0.72 * headerOpacity})`,
        backdropFilter: headerOpacity > 0.02 ? 'blur(16px)' : 'none',
        borderBottom: `1px solid rgba(92,244,154,${0.16 * headerOpacity})`,
        opacity: headerOpacity, pointerEvents: headerOpacity > 0.5 ? 'auto' : 'none',
      }}>
        <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '0.22em', color: GREEN.mid }}>MICHELE MATOZZA</div>
      </header>
    </>
  );
}
