const fetch = require('node-fetch');

const OKYC_VERIFY_API_URL = process.env.CGEPY_OKYC_VERIFY_URL || process.env.CGPEY_OKYC_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/okyc/verify';

function getRequestIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];

  if (forwardedFor && typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0].trim();
  }

  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  if (req.socket && req.socket.remoteAddress) {
    return req.socket.remoteAddress;
  }

  if (req.connection && req.connection.remoteAddress) {
    return req.connection.remoteAddress;
  }

  return '';
}

function getAllowedIps() {
  const value = process.env.IP_WHITELIST || process.env.IP_ALLOWLIST || '';

  return value.split(',').map((ip) => ip.trim()).filter(Boolean);
}

function isIpAllowed(req) {
  const allowedIps = getAllowedIps();

  if (allowedIps.length === 0) {
    return true;
  }

  const requestIp = getRequestIp(req);

  return allowedIps.includes(requestIp);
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

  console.warn('[OKYC] verification failed - requestIp=' + (requestIp || 'unknown') + ', upstreamClientIP=' + (upstreamClientIp || 'unknown') + ', requestId=' + (requestId || 'n/a'));
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
  const sessionId = (body.sessionId || '').toString().trim();
  const otp = (body.otp || '').toString().trim();
  const aadhaarNumber = (body.aadhaarNumber || '').toString().trim();
  const merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
  const apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
  const secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
  const baseUrl = getBaseUrl(req);
  const normalizedVerifyUrl = (OKYC_VERIFY_API_URL || '').replace(/\/$/, '');

  if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/okyc/verify')) {
    return res.status(500).json({
      success: false,
      error: 'OKYC verify proxy target points to this same endpoint. Set CGEPY_OKYC_VERIFY_URL to the real upstream API URL.'
    });
  }

  if (!sessionId || !otp || !aadhaarNumber) {
    return res.status(400).json({ success: false, error: 'sessionId, otp and aadhaarNumber are required' });
  }

  if (!isIpAllowed(req)) {
    return res.status(403).json({
      success: false,
      error: 'IP is not allowlisted for OKYC verification'
    });
  }

  if (!merchantId || !apiKey || !secretKey) {
    return res.status(500).json({
      success: false,
      error: 'CGEPY credentials are not configured on server'
    });
  }

  try {
    const response = await fetch(OKYC_VERIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-id': merchantId,
        'x-api-key': apiKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify({
        sessionId: sessionId,
        otp: otp,
        aadhaarNumber: aadhaarNumber
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