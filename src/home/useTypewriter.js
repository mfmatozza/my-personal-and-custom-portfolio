import { useEffect, useState } from 'react';

// Reveals `text` one character at a time. Pass `start: false` to hold it at
// 0 until some other condition (mount, scroll-into-view, a prior line
// finishing) flips it true.
export function useTypewriter(text, { start = true, startDelay = 300, speed = 110 } = {}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return undefined;
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
  }, [text, start, startDelay, speed]);
  return count;
}
