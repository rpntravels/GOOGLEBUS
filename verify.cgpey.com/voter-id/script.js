const voterForm = document.getElementById('voterForm');
const voterInput = document.getElementById('voterInput');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

function getApiBase() {
  return window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
}

function normalizeVoterId(value) {
  return (value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidVoterId(value) {
  return /^[A-Z]{3}[A-Z0-9]{7}$/.test(value);
}

function setStatus(message, tone) {
  statusEl.textContent = message;
  statusEl.className = tone || '';
}

voterForm?.addEventListener('submit', async function(event) {
  event.preventDefault();

  const voterId = normalizeVoterId(voterInput.value);
  voterInput.value = voterId;
  resultEl.textContent = '';

  if (!isValidVoterId(voterId)) {
    setStatus('Enter a valid voter ID (10 characters, e.g. YIM139XXXX).', 'err');
    return;
  }

  setStatus('Verifying...', 'info');

  try {
    const response = await fetch(getApiBase() + '/api/v1/verify/voter-id', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ voterId: voterId })
    });

    const data = await response.json();
    resultEl.textContent = JSON.stringify(data, null, 2);

    if (!response.ok) {
      setStatus(data.error || 'Verification failed.', 'err');
      return;
    }

    setStatus('Voter ID verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    resultEl.textContent = error && error.message ? error.message : 'Unexpected error';
  }
});
