// "$ cat status.txt" panel: types the command, then its output (current
// occupation) once the section scrolls into view, then three columns —
// education / experience (wider, the focal one) / extracurriculars — each a
// "storage tower" of stacked cards. At rest each card shows only its title,
// tilted and overlapping like index cards in a drawer; hovering pulls one
// forward (un-rotates, lifts, expands) and moving away lets it slide back
// into the stack. The current role stays popped out by default.
import { useEffect, useState } from 'react';
import { useTypewriter } from './useTypewriter';
import { useInView } from './useInView';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const GREEN = { dim: '#1f7a45', mid: '#3fd07a', bright: '#5cf49a', pale: '#d6ffe6' };

const CMD = '$ cat status.txt';
const OCCUPATION = "Econ & Computer Science @ Bocconi · SWE Intern @ VivaTicket";

// Verbatim from michelematozza.com — do not paraphrase/reword entries here;
// add badges as exact substrings alongside the full bullet, never in place of it.
const EDUCATION = [
  {
    key: 'bocconi', org: 'Bocconi University', period: 'Aug 2024 - Jun 2027', location: 'Milan, Italy',
    roles: [{
      title: 'Bachelor in Economics, Management and Computer Science',
      bullets: ['Course Representative, Statistics: 31/30, Computer Science: 29/30, IT Law: 30/30'],
      badges: ['31/30', '29/30', '30/30'],
    }],
  },
  {
    key: 'lancy-ib', org: 'Institut International de Lancy', period: '2022 - 2024', location: 'Geneva, Switzerland',
    roles: [{
      title: 'International Baccalaureat',
      bullets: ['Physics, Mathematics, Business Management, Chemistry, Italian Literature, English Literature'],
    }],
  },
];

const EXPERIENCE = [
  {
    key: 'vivaticket', org: 'VivaTicket', defaultOpen: true,
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
    key: 'geneve', org: 'Ville de Genève', period: 'July 2025 - August 2025', location: 'Geneva, Switzerland',
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
    key: 'cern', org: 'CERN', period: 'July 2023 - July 2023', location: 'Geneva, Switzerland',
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
    key: 'msc', org: 'Mediterranean Shipping Company (MSC)', period: 'June 2023 - June 2023', location: 'Geneva, Switzerland',
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
    key: 'pg', org: 'Procter & Gamble', period: 'June 2022 - June 2022', location: 'Geneva, Switzerland',
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
    key: 'lancy-basketball', org: 'Institut International de Lancy', period: 'September 2022 - April 2024', location: 'Geneva, Switzerland',
    roles: [{
      title: 'Basketball Coach',
      bullets: ['Worked with children aged 8-16', 'Developed adaptive communication skills'],
    }],
  },
];

const EXTRACURRICULARS = [
  {
    key: 'astra', org: 'Astra Bocconi', period: 'Oct 2024 - Present',
    roles: [{
      title: 'Head of Technology', period: 'Aug 2025 - Present',
      bullets: ['Leading the technology division, overseeing technical projects and driving innovation within the organization.'],
    }],
  },
  {
    key: 'freeatb', org: 'Free at B',
    roles: [{
      title: 'Board Member', period: 'Oct 2024 - Aug 2025',
      bullets: ['Contributed to strategic decisions and organizational growth as an active board member.'],
    }],
  },
  {
    key: 'lovable', org: 'Lovable', period: 'Jan 2025 - Jul 2026',
    roles: [{
      title: 'Lovable Campus Leader (former)', period: 'Jan 2025 - Jul 2026',
      bullets: ['Chosen as one of the Lovable Ambassadors to represent Lovable through events and partnerships.'],
    }],
  },
  {
    key: 'hacklab', org: 'Hacklab', period: 'Oct 2024 - Present',
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
  const tilt = (index % 2 === 0 ? -1 : 1) * (1.2 + (index % 3) * 0.4);
  const shiftX = (index % 2 === 0 ? -1 : 1) * 2;

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        marginTop: index === 0 ? 0 : -13,
        zIndex: isOpen ? 60 : index,
        transformOrigin: '20% 0%',
        transform: isOpen
          ? 'rotate(0deg) translate(0px, -6px) scale(1.02)'
          : `rotate(${tilt}deg) translate(${shiftX}px, 0px)`,
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
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
        <span style={{
          fontFamily: MONO, fontSize: accent ? 15 : 13.5, fontWeight: isOpen ? 600 : 500,
          color: isOpen ? (accent ? GREEN.bright : GREEN.pale) : GREEN.mid,
          transition: 'color 300ms',
        }}>
          {file.org}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: GREEN.dim, whiteSpace: 'nowrap' }}>{file.period}</span>
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
        textShadow: '0 0 20px rgba(92,244,154,.35)',
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
          <Stack files={EDUCATION} accent={false} />
        </Column>

        <Column title="$ ./experience" accent>
          <Stack files={EXPERIENCE} accent />
        </Column>

        <Column title="$ ./extracurriculars">
          <Stack files={EXTRACURRICULARS} accent={false} />
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
