// "$ cat status.txt" panel: types the command, then its output (current
// occupation) once the section scrolls into view, and below it three
// permanent columns — education / experience (wider, the focal one) /
// extracurriculars — styled like terminal file listings.
import { useEffect, useRef, useState } from 'react';
import { useTypewriter } from './useTypewriter';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GREEN = { dim: '#1f7a45', mid: '#3fd07a', bright: '#5cf49a', pale: '#d6ffe6' };

const CMD = '$ cat status.txt';
const OCCUPATION = "Economics & Computer Science @ Bocconi · SWE Intern @ VivaTicket";

const EDUCATION = [
  {
    org: 'Bocconi University', period: 'Aug 2024 - Jun 2027', location: 'Milan, Italy',
    role: 'Bachelor in Economics, Management and Computer Science',
    bullets: ['Course Representative, Statistics: 31/30, Computer Science: 29/30, IT Law: 30/30'],
  },
  {
    org: 'Institut International de Lancy', period: '2022 - 2024', location: 'Geneva, Switzerland',
    role: 'International Baccalaureat',
    bullets: ['Physics, Mathematics, Business Management, Chemistry, Italian Literature, English Literature'],
  },
];

const EXPERIENCE = [
  {
    org: 'VivaTicket', period: '2026 - Present', location: 'Milan, Italy',
    role: 'Software Engineer Intern',
    bullets: [
      'Building features in TypeScript within the engineering team',
      'Working on software infrastructure and internal systems of the ticketing platform',
      'Collaborating within an international product team',
    ],
  },
  {
    org: 'Ville de Genève', period: 'July 2025 - August 2025', location: 'Geneva, Switzerland',
    role: 'Intern at Service des Relations Extérieures',
    bullets: [
      'Assisted with daily tasks and contributed to organizing the Swiss National Day (1st August)',
      'Collaborated in a diverse team environment',
      'Utilized Microsoft Excel and PowerPoint to support projects and presentations',
    ],
  },
  {
    org: 'CERN', period: 'July 2023 - July 2023', location: 'Geneva, Switzerland',
    role: 'Shadow Program',
    bullets: [
      'Exploration of how scientific discoveries are made, via the application of the scientific method and collaborative research',
      'Application of scientific method in simple Physics experiments and data analysis with Discrete Fourier Transforms',
      'Data Analysis in Excel',
    ],
  },
  {
    org: 'Mediterranean Shipping Company (MSC)', period: 'June 2023 - June 2023', location: 'Geneva, Switzerland',
    role: 'Intern',
    bullets: [
      'Working in the IT department of a global corporation using SCRUM methodology',
      'Introduction to Git and C#',
      'Application of programming principles in developing backend solutions for internal systems',
    ],
  },
  {
    org: 'Procter & Gamble', period: 'June 2022 - June 2022', location: 'Geneva, Switzerland',
    role: 'Shadow Program',
    bullets: [
      'Working alongside a senior brand manager',
      'Assigned a research project to develop branding solution to win amongst point of market entry consumers',
      'Understood the importance of marketing and branding in developing a solution',
    ],
  },
  {
    org: 'Institut International de Lancy', period: 'September 2022 - April 2024', location: 'Geneva, Switzerland',
    role: 'Basketball Coach',
    bullets: ['Worked with children aged 8-16', 'Developed adaptive communication skills'],
  },
];

const EXTRACURRICULARS = [
  {
    org: 'Astra Bocconi', period: 'Oct 2024 - Present',
    roles: [
      { title: 'Head of Technology', period: 'Aug 2025 - Present', desc: 'Leading the technology division, overseeing technical projects and driving innovation within the organization.' },
    ],
  },
  {
    org: 'Free at B',
    roles: [
      { title: 'Board Member', period: 'Oct 2024 - Aug 2025', desc: 'Contributed to strategic decisions and organizational growth as an active board member.' },
    ],
  },
  {
    org: 'Lovable', period: 'Jan 2025 - Jul 2026',
    roles: [
      { title: 'Lovable Campus Leader (former)', period: 'Jan 2025 - Jul 2026', desc: 'Chosen as one of the Lovable Ambassadors to represent Lovable through events and partnerships.' },
    ],
  },
  {
    org: 'Hacklab', period: 'Oct 2024 - Present',
    roles: [
      { title: 'President', period: 'Jan 2025 - Present', desc: 'Leading the organization and driving hackathon culture within the university community.' },
      { title: 'Hackathon Participant', period: 'Oct 2024 - Dec 2025', desc: '3x Hackathon participant, 1x first place, 1x third place.' },
    ],
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

function useNarrow(breakpoint = 900) {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < breakpoint);
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return narrow;
}

function Bullet({ text, color = GREEN.mid, size = 12.5 }) {
  return (
    <div style={{ display: 'flex', gap: 7, marginTop: 5, fontFamily: MONO }}>
      <span style={{ color: GREEN.dim, fontSize: size }}>▸</span>
      <span style={{ color, fontSize: size, lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

function Meta({ children }) {
  return <div style={{ fontFamily: MONO, color: GREEN.dim, fontSize: 12, marginTop: 2 }}>{children}</div>;
}

function Column({ title, accent, children, style }) {
  return (
    <div style={{
      borderLeft: `1px solid rgba(92,244,154,${accent ? 0.3 : 0.14})`,
      paddingLeft: 20,
      ...style,
    }}>
      <div style={{
        fontFamily: MONO, fontSize: accent ? 15 : 13, color: accent ? GREEN.bright : GREEN.mid,
        letterSpacing: '0.04em', marginBottom: accent ? 26 : 20,
        textShadow: accent ? `0 0 16px rgba(92,244,154,.4)` : 'none',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function Status() {
  const [sectionRef, inView] = useInView();
  const cmdTyped = useTypewriter(CMD, { start: inView, startDelay: 150, speed: 45 });
  const cmdDone = cmdTyped >= CMD.length;
  const outTyped = useTypewriter(OCCUPATION, { start: cmdDone, startDelay: 200, speed: 22 });
  const outDone = outTyped >= OCCUPATION.length;
  const narrow = useNarrow();

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
        textShadow: `0 0 20px rgba(92,244,154,.35)`,
      }}>
        {OCCUPATION.slice(0, outTyped)}
        {cmdDone && !outDone && <Caret />}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: narrow ? '1fr' : '1fr 1.5fr 1fr',
        gap: narrow ? '8vh' : '4vw',
        marginTop: '8vh',
        opacity: outDone ? 1 : 0,
        transform: `translateY(${outDone ? 0 : 16}px)`,
        transition: 'opacity 500ms ease-out, transform 500ms ease-out',
      }}>
        <Column title="$ ./education">
          {EDUCATION.map((e) => (
            <div key={e.org + e.period} style={{ marginBottom: 26 }}>
              <div style={{ fontFamily: MONO, color: GREEN.pale, fontSize: 14.5 }}>{e.org}</div>
              <Meta>{e.period} · {e.location}</Meta>
              <div style={{ fontFamily: MONO, color: GREEN.mid, fontSize: 12.5, marginTop: 8 }}>{e.role}</div>
              {e.bullets.map((b, i) => <Bullet key={i} text={b} />)}
            </div>
          ))}
        </Column>

        <Column title="$ ./experience" accent>
          {EXPERIENCE.map((e) => (
            <div key={e.org + e.period} style={{ marginBottom: 34 }}>
              <div style={{ fontFamily: MONO, color: GREEN.pale, fontSize: 17, fontWeight: 600 }}>{e.org}</div>
              <Meta>{e.period} · {e.location}</Meta>
              <div style={{ fontFamily: MONO, color: GREEN.bright, fontSize: 14, marginTop: 8 }}>{e.role}</div>
              {e.bullets.map((b, i) => <Bullet key={i} text={b} color={GREEN.mid} size={13.5} />)}
            </div>
          ))}
        </Column>

        <Column title="$ ./extracurriculars">
          {EXTRACURRICULARS.map((x) => (
            <div key={x.org} style={{ marginBottom: 26 }}>
              <div style={{ fontFamily: MONO, color: GREEN.pale, fontSize: 14.5 }}>{x.org}</div>
              {x.period && <Meta>{x.period}</Meta>}
              {x.roles.map((r) => (
                <div key={r.title} style={{ marginTop: 10 }}>
                  <div style={{ fontFamily: MONO, color: GREEN.mid, fontSize: 12.5 }}>{r.title}</div>
                  <Meta>{r.period}</Meta>
                  <Bullet text={r.desc} />
                </div>
              ))}
            </div>
          ))}
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
