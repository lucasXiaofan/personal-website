// Countdown to a fixed instant, rendered entirely in the browser.
// GitHub Pages serves static files only, so "now" comes from the visitor's
// device clock; the deadline is a fixed absolute instant, and every label is
// formatted in America/New_York so EST/EDT is handled automatically.
(() => {
  if (window.__countdownReady) return;
  window.__countdownReady = true;
  const ZONE = 'America/New_York';
  // Explicit components, not dateStyle/timeStyle: those cannot be combined
  // with timeZoneName, which is what makes the EST/EDT label appear.
  const nowFormat = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONE, year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
  });
  const UNITS = ['days', 'hours', 'minutes', 'seconds'];
  const clocks = [];
  for (const node of document.querySelectorAll('[data-countdown]')) {
    const target = Date.parse(node.dataset.target || '');
    if (!Number.isFinite(target)) continue;
    const cells = {};
    for (const unit of UNITS) cells[unit] = node.querySelector('[data-unit="' + unit + '"]');
    if (UNITS.some(unit => !cells[unit])) continue;
    clocks.push({
      node, target, cells,
      status: node.querySelector('[data-countdown-status]'),
      clock: node.querySelector('[data-countdown-now]'),
      days: null,
      over: false
    });
  }
  if (!clocks.length) return;
  const pad = (value, width) => String(value).padStart(width, '0');
  const write = (clock, days, hours, minutes, seconds) => {
    clock.cells.days.textContent = String(days);
    clock.cells.hours.textContent = pad(hours, 2);
    clock.cells.minutes.textContent = pad(minutes, 2);
    clock.cells.seconds.textContent = pad(seconds, 2);
  };
  const tick = () => {
    const now = Date.now();
    const stamp = nowFormat.format(new Date(now));
    for (const clock of clocks) {
      if (clock.clock) clock.clock.textContent = stamp;
      const remaining = Math.floor((clock.target - now) / 1000);
      if (remaining <= 0) {
        clock.node.dataset.countdownState = 'over';
        write(clock, 0, 0, 0, 0);
        if (clock.status && !clock.over) clock.status.textContent = 'The deadline has passed.';
        clock.over = true;
        clock.days = 0;
        continue;
      }
      clock.node.dataset.countdownState = 'running';
      const days = Math.floor(remaining / 86400);
      write(clock, days, Math.floor(remaining / 3600) % 24, Math.floor(remaining / 60) % 60, remaining % 60);
      // The ticking figures are decorative; refresh the spoken summary once a day.
      if (clock.status && (clock.over || clock.days !== days)) {
        clock.status.textContent = days + (days === 1 ? ' day left' : ' days left') + ' before the deadline.';
      }
      clock.over = false;
      clock.days = days;
    }
  };
  tick();
  setInterval(() => { if (!document.hidden) tick(); }, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
})();
