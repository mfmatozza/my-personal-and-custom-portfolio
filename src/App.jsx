import { useState } from 'react';
import { CompositionStage } from './intro/engine';
import IntroAnimation, { INTRO_SCENES } from './intro/IntroAnimation';
import Hero from './home/Hero';
import Sections from './home/Sections';

function App() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <div style={{ position: 'relative', minHeight: '100svh', background: '#07080a' }}>
      {introDone && (
        <>
          <Hero />
          <Sections />
        </>
      )}
      {!introDone && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
          <CompositionStage
            width={1920}
            height={1080}
            bg="#07080a"
            scenes={INTRO_SCENES}
            onComplete={() => setIntroDone(true)}
          >
            <IntroAnimation />
          </CompositionStage>
        </div>
      )}
    </div>
  );
}

export default App;
