const fetch = require('node-fetch');

const DRIVING_LICENCE_VERIFY_API_URL = process.env.CGEPY_DRIVING_LICENCE_VERIFY_URL || process.env.CGPEY_DRIVING_LICENCE_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/driving_licence';

function normalizeIp(ip) {
  if (!ip) {
    return '';
  }

  let normalized = ip.toString().trim();

  if (!normalized) {
    return '';
  }

  if (normalized.indexOf('::ffff:') === 0) {
    normalized = normalized.slice(7);
  }

  if (normalized[0] === '[' && normalized.indexOf(']') > 0) {
    normalized = normalized.slice(1, normalized.indexOf(']'));
  }

  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(normalized)) {
    normalized = normalized.split(':')[0];
  }

  return normalized;
}

function getRequestIps(req) {
  const collected = [];
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor && typeof forwardedFor === 'string') {
    forwardedFor.split(',').forEach((entry) => {
      const normalized = normalizeIp(entry);
      if (normalized) {
        collected.push(normalized);
      }
    });
  }

  [
    req.headers['x-real-ip'],
    req.ip,
    req.socket && req.socket.remoteAddress,
    req.connection && req.connection.remoteAddress
  ].forEach((entry) => {
    const normalized = normalizeIp(entry);
    if (normalized) {
      collected.push(normalized);
    }
  });

  return Array.from(new Set(collected));
}

function getRequestIp(req) {
  const requestIps = getRequestIps(req);
  return requestIps[0] || '';
}

function getAllowedIps() {
  const value = process.env.IP_WHITELIST || process.env.IP_ALLOWLIST || '';

  return value.split(',').map((ip) => normalizeIp(ip)).filter(Boolean);
}

function isLocalIp(ip) {
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
}

function isIpAllowed(req) {
  if (process.env.CGEPY_ENFORCE_REQUEST_IP_ALLOWLIST !== 'true') {
    return true;
  }

  const allowedIps = getAllowedIps();

  if (allowedIps.length === 0) {
    return true;
  }

  const requestIps = getRequestIps(req);

  if (process.env.NODE_ENV !== 'production' && requestIps.some(isLocalIp)) {
    return true;
  }

  return requestIps.some((ip) => allowedIps.includes(ip));
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getBaseUrl(req) {
  const host = req.headers.host;
  if (!host) {
    return '';
  }
  const proto = req.headers['x-forwarded-proto'] || 'https';
  return proto + '://' + host;
}

function parseBody(req) {
  if (req && typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (err) {
      return {};
    }
  }

  return {};
}

function logVerificationIpContext(req, details) {
  const requestIp = getRequestIp(req);
  const upstreamClientIp = details && details.error && (details.error.clientIP || details.error.clientIp);
  const requestId = details && details.requestId;

  console.warn('[DRIVING_LICENCE] verification failed - requestIp=' + (requestIp || 'unknown') + ', upstreamClientIP=' + (upstreamClientIp || 'unknown') + ', requestId=' + (requestId || 'n/a'));
}

function buildVerificationHeaders(req, merchantId, apiKey, secretKey) {
  const headers = {
    'Content-Type': 'application/json',
    'x-merchant-id': merchantId,
    'x-api-key': apiKey,
    'x-secret-key': secretKey
  };

  // Forwarding the browser/client IP can cause upstream IP allowlist failures.
  // Default behavior relies on server egress IP; opt in only when explicitly needed.
  if (process.env.CGEPY_FORWARD_CLIENT_IP === 'true') {
    const requestIp = getRequestIp(req);
    if (requestIp) {
      headers['x-forwarded-for'] = requestIp;
      headers['x-real-ip'] = requestIp;
    }
  }

  return headers;
}

function isValidDobFormat(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) {
    return false;
  }

  const parsed = new Date(value + 'T00:00:00');
  return !isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const licenceNumber = (body.licence_number || '').toString().trim().toUpperCase();
  const dob = (body.dob || '').toString().trim();
  const merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
  const apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
  const secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
  const baseUrl = getBaseUrl(req);
  const normalizedVerifyUrl = (DRIVING_LICENCE_VERIFY_API_URL || '').replace(/\/$/, '');

  if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/driving_licence')) {
    return res.status(500).json({
      success: false,
      error: 'Driving licence verify proxy target points to this same endpoint. Set CGEPY_DRIVING_LICENCE_VERIFY_URL to the real upstream API URL.'
    });
  }

  if (!licenceNumber || !dob) {
    return res.status(400).json({ success: false, error: 'licence_number and dob are required' });
  }

  if (!isValidDobFormat(dob)) {
    return res.status(400).json({ success: false, error: 'dob must be in YYYY-MM-DD format' });
  }

  if (!isIpAllowed(req)) {
    return res.status(403).json({
      success: false,
      error: 'IP is not allowlisted for Driving Licence verification'
    });
  }

  if (!merchantId || !apiKey || !secretKey) {
    return res.status(500).json({
      success: false,
      error: 'CGEPY credentials are not configured on server'
    });
  }

  try {
    const response = await fetch(DRIVING_LICENCE_VERIFY_API_URL, {
      method: 'POST',
      headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
      body: JSON.stringify({
        licence_number: licenceNumber,
        dob: dob
      })
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      data = { raw: text };
    }

    if (!response.ok) {
      logVerificationIpContext(req, data);
      return res.status(response.status).json({
        success: false,
        error: 'CGEPY verification failed',
        details: data
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error.message || 'Failed to connect to CGEPY verification API'
    });
  }
};
