const panForm = document.getElementById('panForm');
const panInput = document.getElementById('panInput');
const drivingLicenceForm = document.getElementById('drivingLicenceForm');
const licenceNumberInput = document.getElementById('licenceNumberInput');
const dobInput = document.getElementById('dobInput');
const faceMatchForm = document.getElementById('faceMatchForm');
const image1Input = document.getElementById('image1Input');
const image2Input = document.getElementById('image2Input');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const ipAllowlistNoticeEl = document.getElementById('ipAllowlistNotice');

function clearIpAllowlistNotice() {
  if (!ipAllowlistNoticeEl) {
    return;
  }

  ipAllowlistNoticeEl.hidden = true;
  ipAllowlistNoticeEl.textContent = '';
}

function showIpAllowlistNotice(data) {
  if (!ipAllowlistNoticeEl) {
    return;
  }

  const details = data && data.details ? data.details : {};
  const detailsMessage = details && details.message ? String(details.message) : '';
  const nestedError = details && details.error ? details.error : {};
  const clientIp = nestedError.clientIP || nestedError.clientIp || 'unknown';

  if (!/ip\s+not\s+allowed/i.test(detailsMessage)) {
    clearIpAllowlistNotice();
    return;
  }

  ipAllowlistNoticeEl.textContent = 'CGPEY rejected this request because IP is not allowlisted. Upstream client IP: ' + clientIp + '. Please add this IP in your CGPEY allowlist and retry.';
  ipAllowlistNoticeEl.hidden = false;
}

function showResult(payload) {
  if (!resultEl) {
    return;
  }

  if (typeof payload === 'string') {
    resultEl.textContent = payload;
  } else {
    resultEl.textContent = JSON.stringify(payload, null, 2);
  }

  resultEl.style.display = 'block';
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function parseJsonSafe(response) {
  const raw = await response.text();

  try {
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {
      success: false,
      error: 'Unexpected response from verification API',
      raw: raw
    };
  }
}

function extractErrorMessage(data, fallback) {
  if (!data || typeof data !== 'object') {
    return fallback;
  }

  return (
    data.error ||
    data.message ||
    (data.details && data.details.message) ||
    fallback
  );
}

function getApiBase() {
  return window.location.protocol === 'file:' ? 'http://localhost:3000' : '';
}

function normalizePan(value) {
  return (value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidPan(value) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
}

function normalizeLicenceNumber(value) {
  return (value || '').replace(/\s+/g, '').toUpperCase();
}

function isValidDob(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(value + 'T00:00:00');
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.toISOString().slice(0, 10) === value;
}

function setStatus(message, tone) {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
  statusEl.className = tone || '';
}

panForm?.addEventListener('submit', async function(event) {
  event.preventDefault();
  clearIpAllowlistNotice();

  const pan = normalizePan(panInput.value);
  panInput.value = pan;
  showResult('');

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

    const data = await parseJsonSafe(response);
    showResult(data);

    if (!response.ok) {
      setStatus(extractErrorMessage(data, 'Verification failed.'), 'err');
      return;
    }

    setStatus('PAN verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    showResult(error && error.message ? error.message : 'Unexpected error');
  }
});

drivingLicenceForm?.addEventListener('submit', async function(event) {
  event.preventDefault();
  clearIpAllowlistNotice();

  const licenceNumber = normalizeLicenceNumber(licenceNumberInput.value);
  const dob = (dobInput.value || '').trim();

  licenceNumberInput.value = licenceNumber;
  showResult('');

  if (!licenceNumber) {
    setStatus('Enter a valid licence number.', 'err');
    return;
  }

  if (!isValidDob(dob)) {
    setStatus('Enter DOB in YYYY-MM-DD format.', 'err');
    return;
  }

  setStatus('Verifying...', 'info');

  try {
    const response = await fetch(getApiBase() + '/api/v1/verify/driving_licence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licence_number: licenceNumber,
        dob: dob
      })
    });

    const data = await parseJsonSafe(response);
    showResult(data);

    if (!response.ok) {
      showIpAllowlistNotice(data);
      setStatus(extractErrorMessage(data, 'Verification failed.'), 'err');
      return;
    }

    setStatus('Driving licence verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    showResult(error && error.message ? error.message : 'Unexpected error');
  }
});

faceMatchForm?.addEventListener('submit', async function(event) {
  event.preventDefault();
  clearIpAllowlistNotice();

  if (!image1Input?.files?.length || !image2Input?.files?.length) {
    setStatus('Select both images to continue.', 'err');
    return;
  }

  const payload = new FormData();
  payload.append('image1', image1Input.files[0]);
  payload.append('image2', image2Input.files[0]);
  showResult('');
  setStatus('Verifying face match...', 'info');

  try {
    const response = await fetch(getApiBase() + '/api/v1/verify/face_match', {
      method: 'POST',
      body: payload
    });

    const raw = await response.text();
    let data;

    try {
      data = raw ? JSON.parse(raw) : {};
    } catch (error) {
      data = { raw: raw };
    }

    showResult(data);

    if (!response.ok) {
      setStatus(extractErrorMessage(data, 'Face match verification failed.'), 'err');
      return;
    }

    setStatus('Face match verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    showResult(error && error.message ? error.message : 'Unexpected error');
  }
});
