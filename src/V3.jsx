/* ============================================
   VARIANT 3 — GLITCH EDITORIAL
   Brutalist tech, oversized typography,
   asymmetric grid, glitch effects
   ============================================ */

import React from 'react';
import data from './data.js';

function V3ParticleField() {
  const canvasRef = React.useRef(null);
  const mouseRef = React.useRef({ x: -1000, y: -1000, active: false });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const count = Math.min(140, Math.floor((W() * H()) / 9000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.4 + 0.4,
      hue: Math.random() < 0.85 ? 'green' : 'violet',
    }));

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - r.left;
      mouseRef.current.y = e.clientY - r.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => { mouseRef.current.active = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      const m = mouseRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22000) {
            const f = (22000 - d2) / 22000;
            p.vx += (dx / Math.sqrt(d2 || 1)) * f * 0.04;
            p.vy += (dy / Math.sqrt(d2 || 1)) * f * 0.04;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.vx += (Math.random() - 0.5) * 0.01;
        p.vy += (Math.random() - 0.5) * 0.01;

        if (p.x < -10) p.x = W() + 10;
        if (p.x > W() + 10) p.x = -10;
        if (p.y < -10) p.y = H() + 10;
        if (p.y > H() + 10) p.y = -10;
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 12000) {
            const o = (1 - d2 / 12000) * 0.35;
            ctx.strokeStyle = `rgba(0, 255, 136, ${o * 0.55})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const color = p.hue === 'violet' ? '177, 77, 255' : '0, 255, 136';
        ctx.fillStyle = `rgba(${color}, 0.9)`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${color}, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="v3-bg-canvas" />;
}

function V3Terminal({ lang, onClose }) {
  const D = data;
  const [history, setHistory] = React.useState([
    { type: 'system', text: `giovanni@portfolio:~$ welcome` },
    { type: 'system', text: lang === 'it' ? 'Digita "help" per vedere i comandi disponibili.' : 'Type "help" to see available commands.' },
  ]);
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef(null);
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);
  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' });
  }, [history]);

  const commands = {
    help: () => [
      'Available commands:',
      '  about      — chi sono / who am I',
      '  projects   — lista progetti',
      '  stack      — stack tecnologico',
      '  skills     — skills principali',
      '  contact    — come contattarmi',
      '  clear      — pulisci terminale',
      '  exit       — chiudi terminale',
    ],
    about: () => [D.bio[lang]],
    projects: () => D.projects.flatMap((p) => [
      `→ ${p.name.padEnd(22)} ${p.category[lang]} · ${p.year}`,
      `  ${p.tagline[lang]}`,
    ]),
    stack: () => [
      `Frontend:  ${D.stack.frontend.join(', ')}`,
      `Backend:   ${D.stack.backend.join(', ')}`,
      `AI:        ${D.stack.ai.join(', ')}`,
      `Tools:     ${D.stack.tools.join(', ')}`,
    ],
    skills: () => D.skills.map((s) => `${s.name[lang].padEnd(22)} ${'█'.repeat(Math.round(s.level / 5))} ${s.level}%`),
    contact: () => [
      `email    → ${D.email}`,
      `github   → github.com/${D.github}`,
    ],
    clear: () => null,
    exit: () => { onClose(); return null; },
  };

  const submit = (e) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    if (!cmd) return;
    const next = [...history, { type: 'user', text: `$ ${cmd}` }];
    if (commands[cmd]) {
      const out = commands[cmd]();
      if (cmd === 'clear') {
        setHistory([]);
      } else if (out) {
        setHistory([...next, ...out.map((t) => ({ type: 'out', text: t }))]);
      } else {
        setHistory(next);
      }
    } else {
      setHistory([...next, { type: 'err', text: `command not found: ${cmd}. type "help"` }]);
    }
    setInput('');
  };

  return (
    <div className="v3-terminal" onClick={() => inputRef.current?.focus()}>
      <div className="v3-term-bar">
        <div className="v3-term-dots">
          <span style={{ background: '#ff5f56' }} onClick={onClose} />
          <span style={{ background: '#ffbd2e' }} />
          <span style={{ background: '#27c93f' }} />
        </div>
        <div className="v3-term-title">giovanni@portfolio — zsh</div>
        <div style={{ width: 52 }} />
      </div>
      <div className="v3-term-body" ref={scrollRef}>
        {history.map((h, i) => (
          <div key={i} className={`v3-term-line v3-term-${h.type}`}>{h.text}</div>
        ))}
        <form onSubmit={submit} className="v3-term-prompt">
          <span className="v3-term-caret-sym">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}

function V3ContactForm({ lang }) {
  const D = data;
  const T = D.copy[lang];
  const [form, setForm] = React.useState({ name: '', email: '', company: '', budget: '', message: '' });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState('idle'); // idle | sending | success | mailto | error

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: null }));
  };

  const validate = () => {
    const er = {};
    if (!form.name.trim()) er.name = T.formRequired;
    if (!form.email.trim()) er.email = T.formRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = T.formInvalidEmail;
    if (!form.message.trim()) er.message = T.formRequired;
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    const er = validate();
    if (Object.keys(er).length) { setErrors(er); return; }
    setStatus('sending');

    const key = D.web3formsKey;
    if (key) {
      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: key,
            from_name: form.name,
            email: form.email,
            subject: `[Portfolio] ${form.name} — ${form.company || 'no company'}`,
            name: form.name,
            company: form.company,
            budget: form.budget,
            message: form.message,
            to_email: D.email,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setStatus('success');
          setForm({ name: '', email: '', company: '', budget: '', message: '' });
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    } else {
      // Fallback: mailto with prefilled body — opens the user's email client
      const body = `${form.message}\n\n---\n${T.formName}: ${form.name}\n${T.formEmail}: ${form.email}\n${T.formCompany}: ${form.company || '—'}\n${T.formBudget}: ${form.budget || '—'}`;
      window.location.href = `mailto:${D.email}?subject=${encodeURIComponent('[Portfolio] ' + form.name)}&body=${encodeURIComponent(body)}`;
      setStatus('mailto');
    }
  };

  if (status === 'success' || status === 'mailto') {
    const msg = status === 'mailto'
      ? (lang === 'it'
          ? 'Ho aperto il tuo client email con il messaggio precompilato. Premi "Invia" per completare.'
          : 'Your email client should have opened with a prefilled message. Hit "Send" to complete.')
      : T.formSuccess;
    return (
      <div className="v3-form-success v3-reveal" role="status" aria-live="polite">
        <div className="v3-form-success-mark">✓</div>
        <div className="v3-form-success-text">{msg}</div>
        <button type="button" className="v3-btn v3-btn-ghost v3-btn-sm" onClick={() => {
          setForm({ name: '', email: '', company: '', budget: '', message: '' });
          setStatus('idle');
        }}>
          <span>↻</span> <span>{lang === 'it' ? 'Nuovo messaggio' : 'New message'}</span>
        </button>
      </div>
    );
  }

  return (
    <form className="v3-form v3-reveal" onSubmit={submit} noValidate>
      <div className="v3-form-grid">
        <div className={`v3-field ${errors.name ? 'has-err' : ''}`}>
          <label htmlFor="f-name">◆ {T.formName.toUpperCase()} *</label>
          <input id="f-name" type="text" value={form.name} onChange={update('name')} autoComplete="name" />
          {errors.name && <span className="v3-field-err">{errors.name}</span>}
        </div>
        <div className={`v3-field ${errors.email ? 'has-err' : ''}`}>
          <label htmlFor="f-email">◆ {T.formEmail.toUpperCase()} *</label>
          <input id="f-email" type="email" value={form.email} onChange={update('email')} autoComplete="email" />
          {errors.email && <span className="v3-field-err">{errors.email}</span>}
        </div>
        <div className="v3-field">
          <label htmlFor="f-company">◆ {T.formCompany.toUpperCase()}</label>
          <input id="f-company" type="text" value={form.company} onChange={update('company')} autoComplete="organization" />
        </div>
        <div className="v3-field">
          <label htmlFor="f-budget">◆ {T.formBudget.toUpperCase()}</label>
          <select id="f-budget" value={form.budget} onChange={update('budget')}>
            <option value="">—</option>
            {T.formBudgetOpts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className={`v3-field v3-field-full ${errors.message ? 'has-err' : ''}`}>
          <label htmlFor="f-message">◆ {T.formMessage.toUpperCase()} *</label>
          <textarea id="f-message" rows="5" value={form.message} onChange={update('message')} />
          {errors.message && <span className="v3-field-err">{errors.message}</span>}
        </div>
      </div>

      {status === 'error' && <div className="v3-form-error">{T.formError}</div>}

      <button type="submit" className="v3-btn v3-btn-primary v3-form-submit" disabled={status === 'sending'}>
        <span className="v3-btn-num">→</span>
        <span>{status === 'sending' ? T.formSending.toUpperCase() : T.formSend.toUpperCase()}</span>
        <span className="v3-btn-arr">↗</span>
      </button>
    </form>
  );
}

function V3CaseStudy({ id, lang, onBack }) {
  const D = data;
  const T = D.copy[lang];
  const project = D.projects.find((p) => p.id === id);

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [id]);

  if (!project) {
    return (
      <div className="v3-root">
        <div className="v3-case-404">
          <h1>404</h1>
          <p>Progetto non trovato.</p>
          <button className="v3-btn v3-btn-primary" onClick={onBack}>
            <span className="v3-btn-arr">←</span> <span>{T.caseBackTo.toUpperCase()}</span>
          </button>
        </div>
      </div>
    );
  }

  const cs = project.caseStudy;

  return (
    <div className="v3-root v3-case-root">
      <V3ParticleField />
      <div className="v3-grid-bg" />
      <div className="v3-scanlines" />
      <div className="v3-grain" />

      <nav className="v3-nav">
        <button className="v3-nav-back" onClick={onBack}>
          <span className="v3-nav-back-arr">←</span>
          <span>{T.caseBackTo.toUpperCase()}</span>
        </button>
        <div className="v3-nav-c v3-nav-c-case">
          <span className="v3-nav-brand">{project.name.toUpperCase()}</span>
        </div>
        <div className="v3-nav-r">
          <span className="v3-case-idx">CASE · {project.id.toUpperCase()}</span>
        </div>
      </nav>

      {/* HERO */}
      <section className="v3-case-hero">
        <div className="v3-case-hero-meta">
          <span className="v3-accent-text">◆ {project.category[lang].toUpperCase()}</span>
          <span className="v3-proj-dot">◆</span>
          <span>{project.year}</span>
          <span className="v3-proj-dot">◆</span>
          <span className="v3-accent-text">{project.liveUrl ? 'LIVE' : T.caseComingSoon.toUpperCase()}</span>
        </div>
        <h1 className="v3-case-title">
          <V3GlitchText text={project.name.toUpperCase()} />
        </h1>
        <p className="v3-case-tag">"{project.tagline[lang]}"</p>

        {project.liveUrl ? (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-primary v3-case-live">
            <span className="v3-btn-num">→</span>
            <span>{T.viewLive.toUpperCase()}</span>
            <span className="v3-btn-arr">↗</span>
          </a>
        ) : (
          <span className="v3-btn v3-btn-ghost v3-case-live is-disabled">
            <span className="v3-btn-num">◆</span>
            <span>{T.caseComingSoon.toUpperCase()}</span>
          </span>
        )}
      </section>

      {/* COVER IMAGE */}
      <section className="v3-case-cover">
        <div className="v3-case-cover-frame">
          <div className="v3-proj-frame-tag">◆ {project.id}.com / {lang.toUpperCase()}</div>
          <img src={project.image} alt={project.name} />
          <div className="v3-proj-frame-overlay" />
        </div>
      </section>

      {/* OVERVIEW GRID */}
      <section className="v3-case-section">
        <div className="v3-case-overview">
          <div className="v3-case-ov-item">
            <div className="v3-case-ov-lbl">◆ {T.caseRole.toUpperCase()}</div>
            <div className="v3-case-ov-val">{cs.role[lang]}</div>
          </div>
          <div className="v3-case-ov-item">
            <div className="v3-case-ov-lbl">◆ {T.caseTeam.toUpperCase()}</div>
            <div className="v3-case-ov-val">{cs.team[lang]}</div>
          </div>
          <div className="v3-case-ov-item">
            <div className="v3-case-ov-lbl">◆ {T.caseYear.toUpperCase()}</div>
            <div className="v3-case-ov-val">{project.year}</div>
          </div>
        </div>
      </section>

      {/* CHALLENGE */}
      <section className="v3-case-section v3-case-block">
        <div className="v3-case-block-num">01</div>
        <div className="v3-case-block-body">
          <div className="v3-sec-kicker">
            <span>◆ {T.caseChallenge.toUpperCase()}</span>
          </div>
          <p className="v3-case-prose">{cs.challenge[lang]}</p>
        </div>
      </section>

      {/* APPROACH */}
      <section className="v3-case-section v3-case-block">
        <div className="v3-case-block-num">02</div>
        <div className="v3-case-block-body">
          <div className="v3-sec-kicker">
            <span>◆ {T.caseApproach.toUpperCase()}</span>
          </div>
          <p className="v3-case-prose">{cs.approach[lang]}</p>

          <div className="v3-case-split">
            <div>
              <div className="v3-proj-lbl">→ {T.caseStackTitle.toUpperCase()}</div>
              <div className="v3-proj-chips">
                {project.stack.map((s) => <span key={s}>{s}</span>)}
              </div>
            </div>
            <div>
              <div className="v3-proj-lbl">→ {T.caseFeaturesTitle.toUpperCase()}</div>
              <ul className="v3-proj-feats">
                {project.features[lang].map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOME */}
      <section className="v3-case-section v3-case-block">
        <div className="v3-case-block-num">03</div>
        <div className="v3-case-block-body">
          <div className="v3-sec-kicker">
            <span>◆ {T.caseOutcome.toUpperCase()}</span>
          </div>
          <p className="v3-case-prose">{cs.outcome[lang]}</p>
        </div>
      </section>

      {/* CTA */}
      <section className="v3-case-cta">
        <h2 className="v3-case-cta-title">{T.caseCtaText}</h2>
        <button className="v3-btn v3-btn-primary" onClick={() => {
          try { sessionStorage.setItem('gp-scroll-to', 'contact'); } catch {}
          onBack();
        }}>
          <span className="v3-btn-num">◆</span>
          <span>{T.caseCtaBtn.toUpperCase()}</span>
          <span className="v3-btn-arr">→</span>
        </button>
      </section>

      <footer className="v3-footer">
        <div>© 2026 / {D.name.toUpperCase()}</div>
        <div className="v3-footer-center">CASE · {project.id.toUpperCase()}</div>
        <div>V1.0</div>
      </footer>
    </div>
  );
}

function V3GlitchText({ text, className = '' }) {
  return (
    <span className={`v3-glitch ${className}`} data-text={text}>
      {text}
    </span>
  );
}

function V3Ticker({ items }) {
  return (
    <div className="v3-ticker">
      <div className="v3-ticker-track">
        {[...items, ...items, ...items].map((it, i) => (
          <span key={i} className="v3-ticker-item">
            <span className="v3-ticker-sq" />
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function parseRoute() {
  const h = window.location.hash || '';
  const m = h.match(/^#case\/([a-z0-9-]+)$/i);
  return m ? { name: 'case', id: m[1] } : { name: 'home' };
}

function V3({ lang, setLang }) {
  const D = data;
  const T = D.copy[lang];
  const [mouse, setMouse] = React.useState({ x: 0, y: 0 });
  const [termOpen, setTermOpen] = React.useState(false);
  const [route, setRoute] = React.useState(parseRoute());
  const heroRef = React.useRef(null);

  React.useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const goHome = () => { window.location.hash = ''; };

  React.useEffect(() => {
    if (route.name !== 'home') return;
    const els = document.querySelectorAll('.v3-reveal');
    const vh = window.innerHeight;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top >= vh) el.setAttribute('data-below', '1');
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('is-in'); });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    const fallback = setTimeout(() => els.forEach((el) => el.classList.add('is-in')), 600);
    return () => { io.disconnect(); clearTimeout(fallback); };
  }, [lang, route.name]);

  React.useEffect(() => {
    if (route.name !== 'home') return;
    let target = null;
    try { target = sessionStorage.getItem('gp-scroll-to'); } catch {}
    if (!target) return;
    try { sessionStorage.removeItem('gp-scroll-to'); } catch {}
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [route.name]);

  React.useEffect(() => {
    const h = (e) => {
      if (!heroRef.current) return;
      const r = heroRef.current.getBoundingClientRect();
      setMouse({
        x: (e.clientX - r.left - r.width / 2) / r.width,
        y: (e.clientY - r.top - r.height / 2) / r.height,
      });
    };
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  if (route.name === 'case') {
    return <V3CaseStudy id={route.id} lang={lang} onBack={goHome} />;
  }

  const tickerItems = [
    'AVAILABLE FOR NEW PROJECTS',
    'FULL STACK / AI',
    '◆ 2026',
    'VIBE CODING',
    'IT · REMOTE',
    'hello@giovanni',
    '◆',
    'CLAUDE · CURSOR · WINDSURF',
    'NEXT.JS · REACT · ASTRO',
  ];

  return (
    <div className="v3-root">
      <V3ParticleField />
      <div className="v3-grid-bg" />
      <div className="v3-scanlines" />
      <div className="v3-grain" />

      {/* NAV */}
      <nav className="v3-nav">
        <div className="v3-nav-l">
          <span className="v3-nav-id">NO.01/01</span>
          <span className="v3-nav-sep">※</span>
          <span className="v3-nav-brand">PERNIOLA∴STUDIO</span>
        </div>
        <div className="v3-nav-c">
          <a href="#work">{T.navWork.toUpperCase()}</a>
          <a href="#about">{T.navAbout.toUpperCase()}</a>
          <a href="#stack">{T.navStack.toUpperCase()}</a>
          <a href="#contact">{T.navContact.toUpperCase()}</a>
        </div>
        <div className="v3-nav-r">
          <button className="v3-lang" onClick={() => setLang(lang === 'it' ? 'en' : 'it')}>
            <span className={lang === 'it' ? 'v3-active' : ''}>IT</span>
            <span className="v3-sep">/</span>
            <span className={lang === 'en' ? 'v3-active' : ''}>EN</span>
          </button>
          <button className="v3-term-toggle" onClick={() => setTermOpen(true)}>
            <span className="v3-term-icon">▸_</span>
            <span>TERMINAL</span>
          </button>
        </div>
      </nav>

      <V3Ticker items={tickerItems} />

      {/* HERO */}
      <section className="v3-hero" ref={heroRef}>
        <div className="v3-hero-marks">
          <div className="v3-mark v3-mark-tl">+</div>
          <div className="v3-mark v3-mark-tr">+</div>
          <div className="v3-mark v3-mark-bl">+</div>
          <div className="v3-mark v3-mark-br">+</div>
        </div>

        <div className="v3-hero-grid">
          <div className="v3-hero-side">
            <div className="v3-side-group">
              <div className="v3-side-label">◆ IDX</div>
              <div className="v3-side-val">001—GP</div>
            </div>
            <div className="v3-side-group">
              <div className="v3-side-label">◆ {T.heroKicker}</div>
              <div className="v3-side-val">{new Date().getFullYear()}/04/18</div>
            </div>
            <div className="v3-side-group">
              <div className="v3-side-label">◆ LOC</div>
              <div className="v3-side-val">IT · REMOTE</div>
            </div>
            <div className="v3-side-group">
              <div className="v3-side-label">◆ COORD</div>
              <div className="v3-side-val">
                {mouse.x.toFixed(2)}, {mouse.y.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="v3-hero-main">
            <h1 className="v3-hero-title v3-reveal">
              <span className="v3-ht-row">
                <V3GlitchText text="GIOVANNI" />
              </span>
              <span className="v3-ht-row v3-ht-row-2">
                <span className="v3-ht-slash">/</span>
                <V3GlitchText text="PERNIOLA" className="v3-accent-text" />
              </span>
            </h1>

            <div className="v3-hero-meta v3-reveal">
              <div className="v3-meta-block">
                <div className="v3-meta-tag">{D.roles[lang][0]}</div>
                <div className="v3-meta-sep">┐</div>
              </div>
              <div className="v3-meta-block">
                <div className="v3-meta-sep">└</div>
                <div className="v3-meta-tag v3-meta-tag-accent">+ {D.roles[lang][1]}</div>
              </div>
            </div>

            <p className="v3-hero-bio v3-reveal">{D.bio[lang]}</p>

            <div className="v3-hero-cta v3-reveal">
              <a href="#work" className="v3-btn v3-btn-primary">
                <span className="v3-btn-num">01</span>
                <span>{T.workCta.toUpperCase()}</span>
                <span className="v3-btn-arr">→</span>
              </a>
              <a href={`mailto:${D.email}`} className="v3-btn v3-btn-ghost">
                <span className="v3-btn-num">02</span>
                <span>{D.email}</span>
              </a>
            </div>
          </div>

          <div className="v3-hero-dash">
            <div className="v3-dash-item">
              <div className="v3-dash-num">02</div>
              <div className="v3-dash-lbl">SITES<br/>SHIPPED</div>
            </div>
            <div className="v3-dash-item">
              <div className="v3-dash-num">∞</div>
              <div className="v3-dash-lbl">AI<br/>CONTEXT</div>
            </div>
            <div className="v3-dash-item">
              <div className="v3-dash-num v3-accent-text">ON</div>
              <div className="v3-dash-lbl">AVAILABLE<br/>NOW</div>
            </div>
          </div>
        </div>

        <div className="v3-hero-footer">
          <span className="v3-hf-label">⟶ {T.scrollHint.toUpperCase()} /</span>
          <span className="v3-hf-line" />
          <span className="v3-hf-label">NEXT: {T.projectsKicker}</span>
        </div>
      </section>

      {/* WORK */}
      <section className="v3-section" id="work">
        <div className="v3-sec-head v3-reveal">
          <div className="v3-sec-kicker">
            <span>◆ {T.projectsKicker}</span>
            <span className="v3-sec-count">[02]</span>
          </div>
          <h2 className="v3-sec-title">
            <V3GlitchText text={T.projectsTitle.toUpperCase()} />
          </h2>
        </div>

        <div className="v3-projects">
          {D.projects.map((p, i) => (
            <article key={p.id} className={`v3-project v3-reveal v3-project-${i % 2}`}>
              <div className="v3-proj-num">
                <span>0{i + 1}</span>
                <span className="v3-proj-slash">/</span>
                <span>02</span>
              </div>

              <div className="v3-proj-left">
                <div className="v3-proj-meta">
                  <span>{p.category[lang]}</span>
                  <span className="v3-proj-dot">◆</span>
                  <span>{p.year}</span>
                  <span className="v3-proj-dot">◆</span>
                  <span className="v3-accent-text">LIVE</span>
                </div>
                <h3 className="v3-proj-title">
                  <V3GlitchText text={p.name.toUpperCase()} />
                </h3>
                <p className="v3-proj-tag">"{p.tagline[lang]}"</p>
                <p className="v3-proj-desc">{p.description[lang]}</p>

                <div className="v3-proj-split">
                  <div>
                    <div className="v3-proj-lbl">→ STACK</div>
                    <div className="v3-proj-chips">
                      {p.stack.map((s) => <span key={s}>{s}</span>)}
                    </div>
                  </div>
                  <div>
                    <div className="v3-proj-lbl">→ {T.labelFeatures.toUpperCase()}</div>
                    <ul className="v3-proj-feats">
                      {p.features[lang].map((f) => <li key={f}>{f}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="v3-proj-actions">
                  {p.liveUrl ? (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="v3-btn v3-btn-primary v3-btn-sm">
                      <span>{T.viewLive.toUpperCase()}</span>
                      <span className="v3-btn-arr">↗</span>
                    </a>
                  ) : (
                    <span className="v3-btn v3-btn-ghost v3-btn-sm is-disabled" aria-disabled="true">
                      <span>{T.caseComingSoon.toUpperCase()}</span>
                      <span className="v3-btn-arr">◆</span>
                    </span>
                  )}
                  <a href={`#case/${p.id}`} className="v3-btn v3-btn-ghost v3-btn-sm">
                    {T.caseStudy.toUpperCase()}
                  </a>
                </div>
              </div>

              <div className="v3-proj-right">
                <div className="v3-proj-frame">
                  <div className="v3-proj-frame-tag">◆ {p.id}.com / {lang.toUpperCase()}</div>
                  <img src={p.image} alt={p.name} loading="lazy" />
                  <div className="v3-proj-frame-overlay" />
                </div>
                <div className="v3-proj-caption">
                  <span>FIG. {String(i + 1).padStart(2, '0')}</span>
                  <span className="v3-proj-caption-sep">—</span>
                  <span>{p.tagline[lang]}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section className="v3-section v3-about" id="about">
        <div className="v3-about-grid">
          <div className="v3-about-l v3-reveal">
            <div className="v3-sec-kicker">
              <span>◆ {T.aboutKicker}</span>
              <span className="v3-sec-count">[03]</span>
            </div>
            <h2 className="v3-about-title">
              {T.aboutTitle.split('\n').map((l, i) => (
                <span key={i} className="v3-at-line">
                  <V3GlitchText text={l.toUpperCase()} />
                  <br/>
                </span>
              ))}
            </h2>
          </div>

          <div className="v3-about-r v3-reveal">
            <p className="v3-about-bio">{D.bio[lang]}</p>

            <div className="v3-skills">
              <div className="v3-sk-head">◆ {T.skillsKicker}</div>
              {D.skills.map((s, i) => (
                <div key={i} className="v3-sk-row">
                  <div className="v3-sk-top">
                    <span className="v3-sk-idx">0{i + 1}</span>
                    <span className="v3-sk-name">{s.name[lang].toUpperCase()}</span>
                    <span className="v3-sk-pct">{s.level}%</span>
                  </div>
                  <div className="v3-sk-track">
                    <div className="v3-sk-fill" style={{ '--w': `${s.level}%` }} />
                  </div>
                  <div className="v3-sk-desc">{s.desc[lang]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STACK */}
      <section className="v3-section" id="stack">
        <div className="v3-sec-head v3-reveal">
          <div className="v3-sec-kicker">
            <span>◆ {T.stackKicker}</span>
            <span className="v3-sec-count">[04]</span>
          </div>
          <h2 className="v3-sec-title">
            <V3GlitchText text={T.stackTitle.toUpperCase()} />
          </h2>
        </div>

        <div className="v3-stack">
          {Object.entries(D.stack).map(([cat, items], i) => (
            <div key={cat} className="v3-stack-block v3-reveal">
              <div className="v3-stack-head">
                <span className="v3-stack-idx">0{i + 1}</span>
                <span className="v3-stack-cat">/ {cat.toUpperCase()}</span>
                <span className="v3-stack-ct">{String(items.length).padStart(2, '0')}</span>
              </div>
              <div className="v3-stack-list">
                {items.map((t) => (
                  <span key={t} className="v3-stack-tool">
                    <span className="v3-stack-sq" />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="v3-section v3-contact" id="contact">
        <div className="v3-contact-inner">
          <div className="v3-sec-kicker v3-reveal">
            <span>◆ {T.contactKicker}</span>
            <span className="v3-sec-count">[05]</span>
          </div>
          <h2 className="v3-contact-title v3-reveal">
            <V3GlitchText text={T.contactTitle.toUpperCase()} />
          </h2>
          <p className="v3-contact-lead v3-reveal">{T.contactLead}</p>

          <V3ContactForm lang={lang} />

          <div className="v3-contact-alt">
            <a href={`mailto:${D.email}`} className="v3-contact-mail v3-reveal">
              <span className="v3-cm-label">◆ EMAIL</span>
              <span className="v3-cm-val">{D.email}</span>
              <span className="v3-cm-arrow">→</span>
            </a>
            <a href="/cv/CV%20-%20Giovanni%20Carlo%20Perniola.pdf" target="_blank" rel="noopener noreferrer" download className="v3-contact-mail v3-reveal">
              <span className="v3-cm-label">◆ CV</span>
              <span className="v3-cm-val">{lang === 'it' ? 'Scarica il curriculum' : 'Download resume'}</span>
              <span className="v3-cm-arrow">↓</span>
            </a>
            <a href={`https://github.com/${D.github}`} target="_blank" rel="noopener noreferrer" className="v3-contact-mail v3-reveal">
              <span className="v3-cm-label">◆ GITHUB</span>
              <span className="v3-cm-val">github.com/{D.github}</span>
              <span className="v3-cm-arrow">↗</span>
            </a>
          </div>
        </div>
      </section>

      <V3Ticker items={tickerItems} />

      <footer className="v3-footer">
        <div>© 2026 / {D.name.toUpperCase()}</div>
        <div className="v3-footer-center">{T.footerNote.toUpperCase()}</div>
        <div>V1.0</div>
      </footer>

      {termOpen && <V3Terminal lang={lang} onClose={() => setTermOpen(false)} />}
    </div>
  );
}

export default V3;
