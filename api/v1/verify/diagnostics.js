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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const allowedIps = getAllowedIps();

  return res.status(200).json({
    success: true,
    requestIp: getRequestIp(req) || 'unknown',
    isIpAllowed: isIpAllowed(req),
    allowlistCount: allowedIps.length,
    allowlist: allowedIps,
    verifyUrls: {
      pan: process.env.CGEPY_VERIFY_URL || process.env.CGPEY_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/pan',
      voterId: process.env.CGEPY_VOTER_VERIFY_URL || process.env.CGPEY_VOTER_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/voter-id',
      criminalVerification: process.env.CGEPY_CRIMINAL_VERIFY_URL || process.env.CGPEY_CRIMINAL_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/criminal_verification',
      okycInitiate: process.env.CGEPY_OKYC_INITIATE_URL || process.env.CGPEY_OKYC_INITIATE_URL || 'https://verify.cgpey.com/api/v1/verify/okyc/initiate',
      okycVerify: process.env.CGEPY_OKYC_VERIFY_URL || process.env.CGPEY_OKYC_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/okyc/verify',
      faceMatch: process.env.CGEPY_FACE_MATCH_URL || process.env.CGPEY_FACE_MATCH_URL || 'not configured'
    },
    credentialsConfigured: {
      merchantId: !!(process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID),
      apiKey: !!(process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY),
      secretKey: !!(process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY)
    }
  });
};