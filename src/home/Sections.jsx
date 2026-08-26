// Placeholder scroll targets below the hero — enough height to demonstrate
// the hero-photo -> header-avatar dock on scroll. Real content is a later step.
const MONO = '"JetBrains Mono", ui-monospace, monospace';

const STUBS = [
  { id: 'work', label: 'Selected work', bg: '#0b0d10' },
  { id: 'about', label: 'About', bg: '#07080a' },
  { id: 'contact', label: 'Contact', bg: '#0b0d10' },
];

export default function Sections() {
  return (
    <>
      {STUBS.map((s) => (
        <section
          key={s.id}
          id={s.id}
          style={{
            minHeight: '70vh', background: s.bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            borderTop: '1px solid rgba(92,244,154,.08)',
          }}
        >
          <h2 style={{ fontFamily: MONO, fontWeight: 500, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#3fd07a', opacity: 0.6 }}>
            {s.label}
          </h2>
        </section>
      ))}
    </>
  );
}
