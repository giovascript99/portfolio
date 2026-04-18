import React from 'react';
import ReactDOM from 'react-dom/client';
import V3 from './V3.jsx';
import './v3-glitch.css';
import './styles.css';

function Root() {
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem('gp-portfolio') || '{}'); }
    catch { return {}; }
  })();
  const [lang, setLang] = React.useState(saved.lang || 'it');

  React.useEffect(() => {
    localStorage.setItem('gp-portfolio', JSON.stringify({ lang }));
    document.documentElement.lang = lang;
  }, [lang]);

  return <V3 lang={lang} setLang={setLang} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
