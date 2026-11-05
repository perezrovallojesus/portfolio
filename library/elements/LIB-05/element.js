// LIB-05 Signal scope (origen: v3)
(function buildTrace() {
  const P = 140, pts = [];
  for (let x = 10; x <= 10 + 280 + P; x += 2) {
    const a = (2 * Math.PI * x) / P;
    pts.push(`${x} ${(100 - (26 * Math.sin(a) + 9 * Math.sin(3 * a + 0.6) + 5 * Math.sin(7 * a))).toFixed(1)}`);
  }
  document.getElementById('osc-trace').setAttribute('d', 'M' + pts.join('L'));
})();
