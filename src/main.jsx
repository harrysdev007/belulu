import React, { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CosmicScene } from './scene.js';
import '@fontsource/jersey-20/latin-400.css';
import '@fontsource/pixelify-sans/latin-600.css';
import '@fontsource/pixelify-sans/latin-700.css';
import './style.css';

function App() {
  const mount = useRef(null);
  const scene = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [hugs, setHugs] = useState(0);
  const [burst, setBurst] = useState(false);
  React.useEffect(() => {
    try { scene.current = new CosmicScene(mount.current, () => setReady(true), () => setError(true)); }
    catch (e) { console.error(e); setError(true); }
    return () => scene.current?.dispose();
  }, []);
  React.useEffect(() => { if(scene.current) scene.current.paused = paused; }, [paused]);
  function hug() {
    scene.current?.hug(); setHugs(n => n+1); setBurst(true);
    window.clearTimeout(scene.current?.messageTimer);
    if(scene.current) scene.current.messageTimer = window.setTimeout(() => setBurst(false), 2400);
  }
  return <main className="universe">
    <div className="scene" ref={mount} role="img" aria-label="An orange cosmic Shiba surrounded by floating three-dimensional hearts, rainbows, stars and smiley faces" />
    <div className="grain" />
    <header className="header">
      <a className="wordmark" href="./" aria-label="BELULU home"><img className="brand-image" src={`${import.meta.env.BASE_URL}brand/belulu.webp`} alt="Cosmic BELULU Shiba"/>BELULU</a>
      <div className="header-note"><span className="status-dot"/> Born on Solana. Launched on bonk.fun.</div>
      <a className="social-link" href="https://x.com/belulu_sol" target="_blank" rel="noopener noreferrer">Follow on 𝕏 <span>↗</span></a>
    </header>
    <section className="intro"><span className="eyebrow"><span/> A COSMIC MEMECOIN ON SOLANA</span><h1>$BELULU<span>DELULU + BONK.<br/>STILL BELIEVING.</span></h1><p>A symbol of hope and a little delusion.<br/>Still dreaming of bonk.fun's comeback.</p><a className="community-link" href="https://x.com/belulu_sol" target="_blank" rel="noopener noreferrer">Join the believers <span>↗</span></a></section>
    {!ready && !error && <div className="loading" role="status"><span className="loader"/>Gathering good vibes…</div>}
    {error && <div className="loading error" role="alert">The 3D universe couldn't load.<button onClick={() => window.location.reload()}>Try again ↗</button></div>}
    <footer className="footer">
      <div className="coordinates"><span className="tiny-star">✦</span><div>$BELULU <small>Solana × bonk.fun</small></div></div>
      <div className="hug-area"><span className={`hug-message ${burst ? 'visible' : ''}`} role="status">A little hope, sent into the universe. ♡</span><button className="hug-button" onClick={hug} disabled={!ready}><span className="button-heart">♡</span> Send a cosmic hug <span className="arrow">↗</span></button><span className="interaction-hint">Keep the comeback dream alive.</span></div>
      <div className="scene-controls"><span className="hug-count">{String(hugs).padStart(2,'0')} HUGS SENT</span><button className="pause" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Play animation' : 'Pause animation'} title={paused ? 'Play animation' : 'Pause animation'}>{paused ? '▶' : 'Ⅱ'}</button></div>
    </footer>
  </main>;
}
createRoot(document.getElementById('root')).render(<App />);
