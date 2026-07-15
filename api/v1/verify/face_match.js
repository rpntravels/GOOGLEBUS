const fetch = require('node-fetch');

const FACE_MATCH_VERIFY_API_URL = process.env.CGEPY_FACE_MATCH_URL || process.env.CGPEY_FACE_MATCH_URL || '';

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

function logVerificationIpContext(req, details) {
  const requestIp = getRequestIp(req);
  const upstreamClientIp = details && details.error && (details.error.clientIP || details.error.clientIp);
  const requestId = details && details.requestId;

  console.warn('[FACE_MATCH] verification failed - requestIp=' + (requestIp || 'unknown') + ', upstreamClientIP=' + (upstreamClientIp || 'unknown') + ', requestId=' + (requestId || 'n/a'));
}

function collectRawBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === 'string') {
    return Promise.resolve(Buffer.from(req.body));
  }

  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    return Promise.resolve(Buffer.from(JSON.stringify(req.body)));
  }

  return new Promise((resolve, reject) => {
    const chunks = [];

    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

function buildVerificationHeaders(req, merchantId, apiKey, secretKey) {
  const requestIp = getRequestIp(req);
  const headers = {
    'x-merchant-id': merchantId,
    'x-api-key': apiKey,
    'x-secret-key': secretKey
  };

  if (req.headers['content-type']) {
    headers['Content-Type'] = req.headers['content-type'];
  }

  if (requestIp) {
    headers['x-forwarded-for'] = requestIp;
    headers['x-real-ip'] = requestIp;
  }

  return headers;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
  const apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
  const secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
  const baseUrl = getBaseUrl(req);
  const normalizedVerifyUrl = (FACE_MATCH_VERIFY_API_URL || '').replace(/\/$/, '');

  if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/face_match')) {
    return res.status(500).json({
      success: false,
      error: 'Face match proxy target points to this same endpoint. Set CGEPY_FACE_MATCH_URL to the real upstream API URL.'
    });
  }

  if (!isIpAllowed(req)) {
    return res.status(403).json({
      success: false,
      error: 'IP is not allowlisted for Face Match verification'
    });
  }

  if (!merchantId || !apiKey || !secretKey) {
    return res.status(500).json({
      success: false,
      error: 'CGEPY credentials are not configured on server'
    });
  }

  if (!FACE_MATCH_VERIFY_API_URL) {
    return res.status(500).json({
      success: false,
      error: 'CGEPY face match upstream URL is not configured on server. Set CGEPY_FACE_MATCH_URL to the working upstream endpoint.'
    });
  }

  try {
    const requestBody = await collectRawBody(req);

    if (!requestBody || requestBody.length === 0) {
      return res.status(400).json({ success: false, error: 'image1 and image2 files are required' });
    }

    const response = await fetch(FACE_MATCH_VERIFY_API_URL, {
      method: 'POST',
      headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
      body: requestBody
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