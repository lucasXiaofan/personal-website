// One reading language at a time; the preference is local to this browser.
(() => {
  const controls = document.querySelector('.language-switch');
  const blocks = document.querySelectorAll('[data-reading-language]');
  if (!controls || !blocks.length) return;
  let language = 'en';
  try { language = localStorage.getItem('reading-language') || language; } catch {}
  const hashLanguage = () => {
    let hash;
    try { hash = decodeURIComponent(location.hash); } catch { return null; }
    return hash === '#中文' ? 'zh' : hash === '#english' ? 'en' : null;
  };
  const apply = (value) => {
    language = value === 'zh' ? 'zh' : 'en';
    document.documentElement.dataset.readingLanguage = language;
    for (const block of blocks) block.hidden = block.dataset.readingLanguage !== language;
    for (const button of controls.querySelectorAll('button')) {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    }
    try { localStorage.setItem('reading-language', language); } catch {}
    const frame = document.querySelector('iframe.giscus-frame');
    frame?.contentWindow?.postMessage({ giscus: { setConfig: { lang: language === 'zh' ? 'zh-CN' : 'en' } } }, 'https://giscus.app');
    const script = document.querySelector('script[src="https://giscus.app/client.js"]');
    if (script) script.dataset.lang = language === 'zh' ? 'zh-CN' : 'en';
  };
  controls.hidden = false;
  apply(hashLanguage() || language);
  controls.addEventListener('click', event => {
    const button = event.target.closest('button[data-language]');
    if (!button) return;
    apply(button.dataset.language);
    if (hashLanguage()) history.replaceState(null, '', location.pathname + location.search);
  });
  window.addEventListener('hashchange', () => { if (hashLanguage()) apply(hashLanguage()); });
  // giscus loads asynchronously; synchronize once its iframe is ready too.
  const container = document.querySelector('.giscus');
  if (container) new MutationObserver(() => {
    const frame = container.querySelector('iframe');
    if (frame && !frame.dataset.languageBound) {
      frame.dataset.languageBound = 'true';
      frame.addEventListener('load', () => apply(language));
    }
  }).observe(container, { childList: true, subtree: true });
})();
