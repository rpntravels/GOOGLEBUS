const panForm = document.getElementById('panForm');
const panInput = document.getElementById('panInput');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

function getApiBase() {
  return window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
}

function normalizePan(value) {
  return (value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidPan(value) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
}

function setStatus(message, tone) {
  statusEl.textContent = message;
  statusEl.className = tone || '';
}

panForm?.addEventListener('submit', async function(event) {
  event.preventDefault();

  const pan = normalizePan(panInput.value);
  panInput.value = pan;
  resultEl.textContent = '';

  if (!isValidPan(pan)) {
    setStatus('Enter a valid PAN in format ABCDE1234F.', 'err');
    return;
  }

  setStatus('Verifying...', 'info');

  try {
    const response = await fetch(getApiBase() + '/api/v1/verify/pan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ pan: pan })
    });

    const data = await response.json();
    resultEl.textContent = JSON.stringify(data, null, 2);

    if (!response.ok) {
      setStatus(data.error || 'Verification failed.', 'err');
      return;
    }

    setStatus('PAN verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    resultEl.textContent = error && error.message ? error.message : 'Unexpected error';
  }
});
