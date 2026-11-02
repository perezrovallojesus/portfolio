// Interacciones mínimas: tema claro/oscuro, copiar email y año del footer.

const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');
const live = document.getElementById('live-region');
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Devuelve el tema activo: el elegido por el usuario o el del sistema
function currentTheme() {
  return root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');
}

// Actualiza la etiqueta accesible del botón según el tema activo
function updateToggleLabel() {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  toggle.setAttribute('aria-label', `Switch to ${next} theme`);
}

toggle.addEventListener('click', () => {
  const next = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateToggleLabel();
});
darkQuery.addEventListener('change', updateToggleLabel);
updateToggleLabel();

// Copia el email al portapapeles y avisa visualmente y por lector de pantalla
document.querySelectorAll('.copy-email').forEach((btn) => {
  const label = btn.querySelector('.copy-label');
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.email);
      label.textContent = 'Copied!';
      live.textContent = 'Email address copied to clipboard';
    } catch (e) {
      // Sin permiso de portapapeles: abrimos el cliente de correo
      window.location.href = `mailto:${btn.dataset.email}`;
      return;
    }
    setTimeout(() => { label.textContent = 'Copy email'; live.textContent = ''; }, 2000);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
