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

drivingLicenceForm?.addEventListener('submit', async function(event) {
  event.preventDefault();

  const licenceNumber = normalizeLicenceNumber(licenceNumberInput.value);
  const dob = (dobInput.value || '').trim();

  licenceNumberInput.value = licenceNumber;
  resultEl.textContent = '';

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

    const data = await response.json();
    resultEl.textContent = JSON.stringify(data, null, 2);

    if (!response.ok) {
      setStatus(data.error || 'Verification failed.', 'err');
      return;
    }

    setStatus('Driving licence verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    resultEl.textContent = error && error.message ? error.message : 'Unexpected error';
  }
});

faceMatchForm?.addEventListener('submit', async function(event) {
  event.preventDefault();

  if (!image1Input?.files?.length || !image2Input?.files?.length) {
    setStatus('Select both images to continue.', 'err');
    return;
  }

  const payload = new FormData();
  payload.append('image1', image1Input.files[0]);
  payload.append('image2', image2Input.files[0]);
  resultEl.textContent = '';
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

    resultEl.textContent = JSON.stringify(data, null, 2);

    if (!response.ok) {
      setStatus((data && data.error) || 'Face match verification failed.', 'err');
      return;
    }

    setStatus('Face match verification request completed.', 'ok');
  } catch (error) {
    setStatus('Unable to reach verification API.', 'err');
    resultEl.textContent = error && error.message ? error.message : 'Unexpected error';
  }
});
