// LIB-13 Typewriter caret (origen: v1)
const typed = document.querySelector('.typed');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (typed && !reduceMotion) {
  const text = typed.textContent;
  typed.textContent = '';
  let i = 0;
  const tick = () => {
    typed.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, 38);
  };
  setTimeout(tick, 300);
}
