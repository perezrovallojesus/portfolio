// LIB-15 Scroll reveal (origen: v1)
// Revela al entrar en vista. En la demo se repite cada 4 s para poder verlo.
const cells = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
const start = () => cells.forEach((c, i) => setTimeout(() => io.observe(c), i * 160));
start();
setInterval(() => { cells.forEach((c) => c.classList.remove('is-in')); setTimeout(start, 700); }, 4000);
