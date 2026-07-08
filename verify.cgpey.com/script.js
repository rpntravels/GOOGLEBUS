const btn = document.getElementById('pingBtn');
const statusEl = document.getElementById('status');

btn?.addEventListener('click', () => {
  const now = new Date().toLocaleString();
  statusEl.textContent = `Ping OK at ${now}`;
});
