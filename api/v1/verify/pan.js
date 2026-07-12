const fetch = require('node-fetch');

const PAN_VERIFY_API_URL = process.env.CGEPY_VERIFY_URL || process.env.CGPEY_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/pan';

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

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = parseBody(req);
  const pan = (body.pan || '').toString().trim().toUpperCase();
  const merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
  const apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
  const secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
  const baseUrl = getBaseUrl(req);
  const normalizedVerifyUrl = (PAN_VERIFY_API_URL || '').replace(/\/$/, '');

  if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/pan')) {
    return res.status(500).json({
      success: false,
      error: 'PAN verify proxy target points to this same endpoint. Set CGEPY_VERIFY_URL to the real upstream API URL.'
    });
  }

  if (!pan) {
    return res.status(400).json({ success: false, error: 'PAN is required' });
  }

  if (!merchantId || !apiKey || !secretKey) {
    return res.status(500).json({
      success: false,
      error: 'CGEPY credentials are not configured on server'
    });
  }

  try {
    const response = await fetch(PAN_VERIFY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-merchant-id': merchantId,
        'x-api-key': apiKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify({ pan: pan })
    });

    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (err) {
      data = { raw: text };
    }

    if (!response.ok) {
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
