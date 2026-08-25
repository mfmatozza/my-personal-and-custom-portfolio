// Continuous-composition animation engine — trimmed port of the Claude Design
// "animations-v3" runtime, keeping only what a fixed one-shot intro needs:
// authored-time cue math (CompositionStage/useComposition/Shot) and the
// easing/interpolation helpers. The host-sync, video-export, and playback-bar
// machinery from the original design-tool runtime is intentionally dropped.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

export const Easing = {
  linear: (t) => t,

  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (--t) * t * t + 1,
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  easeInOutExpo: (t) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
    return 1 - 0.5 * Math.pow(2, -20 * t + 10);
  },

  easeOutBack: (t) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// animate({from, to, start, end, ease})(t) — single-segment tween.
export function animate({ from = 0, to = 1, start = 0, end = 1, ease = Easing.easeInOutCubic }) {
  return (t) => {
    if (t <= start) return from;
    if (t >= end) return to;
    const local = (t - start) / (end - start);
    return from + (to - from) * ease(local);
  };
}

// Derive per-section playhead offsets + a CUES lookup table (section name ->
// authored start time) from an ordered scene list, mirroring the original
// engine's authored/playback split (nat === dur here: no host-side retiming).
function deriveScenes(scenes) {
  let playStart = 0;
  const sections = [];
  const table = {};
  for (const s of scenes) {
    sections.push({ name: s.name, playStart, dur: s.dur });
    if (!(s.name in table)) table[s.name] = Math.round(playStart * 1000) / 1000;
    playStart += s.dur;
  }
  return { sections, table, total: Math.round(playStart * 1000) / 1000 };
}

const CompositionContext = createContext(null);

export function useComposition() {
  const ctx = useContext(CompositionContext);
  if (!ctx) throw new Error('useComposition() must be called inside <CompositionStage>');
  return ctx;
}

// Visible only while the authored clock T is inside [from, to) — children
// stay mounted (so media keeps its readiness) and are hidden outside the window.
export function Shot({ from, to, children }) {
  const { T } = useComposition();
  const start = +from;
  const end = to == null ? Infinity : +to;
  const on = Number.isFinite(start) && T >= start && T < end;
  return (
    <div style={{ position: 'absolute', inset: 0, visibility: on ? 'visible' : 'hidden' }}>
      {children}
    </div>
  );
}

// Fixed-design-resolution stage, scaled (contain-fit) to whatever box it's
// mounted in so the 1920x1080 composition stays correct on any viewport.
export function CompositionStage({ width = 1920, height = 1080, scenes, bg = '#000', onComplete, children }) {
  const derived = useMemo(() => deriveScenes(scenes), [scenes]);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [scale, setScale] = useState(1);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const doneRef = useRef(false);
  const wrapRef = useRef(null);

  const finish = useCallback(() => {
    setPlaying(false);
    if (!doneRef.current) {
      doneRef.current = true;
      onComplete && onComplete();
    }
  }, [onComplete]);

  const skip = useCallback(() => {
    setTime(derived.total);
    finish();
  }, [derived.total, finish]);

  useEffect(() => {
    if (!playing) return undefined;
    const step = (ts) => {
      if (lastRef.current == null) lastRef.current = ts;
      const dt = (ts - lastRef.current) / 1000;
      lastRef.current = ts;
      setTime((t) => {
        const next = t + dt;
        if (next >= derived.total) {
          queueMicrotask(finish);
          return derived.total;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing, derived.total, finish]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const s = Math.min(el.clientWidth / width, el.clientHeight / height);
      setScale(s > 0 ? s : 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  const value = useMemo(
    () => ({ T: time, CUES: derived.table, time, duration: derived.total, playing, skip }),
    [time, derived, playing, skip]
  );

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: bg }}>
      <div
        style={{
          position: 'absolute', left: '50%', top: '50%', width, height,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <CompositionContext.Provider value={value}>{children}</CompositionContext.Provider>
      </div>
    </div>
  );
}
