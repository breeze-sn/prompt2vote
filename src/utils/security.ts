/**
 * Security utilities to discourage unauthorized inspection and protect 
 * the application environment during the hackathon.
 */

export const initSecurity = () => {
  if (process.env.NODE_ENV === 'development') return;

  // 1. Disable Right Click
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
      (e.ctrlKey && e.key === 'U') ||
      (e.metaKey && e.key === 'u')
    ) {
      e.preventDefault();
    }
  });

  // 3. Anti-Debug Loop (Pauses execution if DevTools is opened)
  setInterval(() => {
    (function () {
      (function a() {
        try {
          (function b(i) {
            if (('' + i / i).length !== 1 || i % 20 === 0) {
              (function () {}.constructor('debugger')());
            } else {
              debugger;
            }
            b(++i);
          })(0);
        } catch (e) {}
      })();
    })();
  }, 1000);

  // 4. Console Warning
  console.log(
    '%c STOP! ',
    'color: white; background: red; font-size: 50px; font-weight: bold; text-shadow: 2px 2px black;'
  );
  console.log(
    '%cThis is a secure area. Any unauthorized inspection or attempt to access internal credentials is logged.',
    'color: red; font-size: 20px;'
  );

  // Periodic console clearing
  setInterval(() => {
    console.clear();
    console.log('%cPrompt2Vote Security System Active', 'color: blue; font-weight: bold;');
  }, 5000);
};
