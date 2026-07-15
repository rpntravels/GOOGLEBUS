// RPN Travels Backend Server
// OpenAI API Proxy - Keeps your API key secure on the server

require('dotenv').config({ path: 'cgepy.env' });
require('dotenv').config();
var express = require('express');
var cors = require('cors');
var fetch = require('node-fetch');
var multer = require('multer');
var FormData = require('form-data');

var app = express();
var PORT = process.env.PORT || 3000;
var PAN_VERIFY_API_URL = process.env.CGEPY_VERIFY_URL || process.env.CGPEY_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/pan';
var VOTER_VERIFY_API_URL = process.env.CGEPY_VOTER_VERIFY_URL || process.env.CGPEY_VOTER_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/voter-id';
var CRIMINAL_VERIFY_API_URL = process.env.CGEPY_CRIMINAL_VERIFY_URL || process.env.CGPEY_CRIMINAL_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/criminal_verification';
var OKYC_INITIATE_API_URL = process.env.CGEPY_OKYC_INITIATE_URL || process.env.CGPEY_OKYC_INITIATE_URL || 'https://verify.cgpey.com/api/v1/verify/okyc/initiate';
var OKYC_VERIFY_API_URL = process.env.CGEPY_OKYC_VERIFY_URL || process.env.CGPEY_OKYC_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/okyc/verify';
var FACE_MATCH_API_URL = process.env.CGEPY_FACE_MATCH_URL=https://your-working-face-match-endpointCGEPY_FACE_MATCH_URL=https://your-working-face-match-endpointCGEPY_FACE_MATCH_URL=https://your-working-face-match-endpointCGEPY_FACE_MATCH_URL || process.env.CGPEY_FACE_MATCH_URL || '';
var upload = multer({ storage: multer.memoryStorage() });

function getRequestIp(req) {
    var forwardedFor = req.headers['x-forwarded-for'];

    if (forwardedFor && typeof forwardedFor === 'string') {
        return forwardedFor.split(',')[0].trim();
    }

    if (req.ip) {
        return req.ip;
    }

    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }

    if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress;
    }

    return '';
}

function getAllowedIps() {
    var value = process.env.IP_WHITELIST || process.env.IP_ALLOWLIST || '';

    return value.split(',').map(function(ip) {
        return ip.trim();
    }).filter(Boolean);
}

function isIpAllowed(req) {
    var allowedIps = getAllowedIps();

    if (allowedIps.length === 0) {
        return true;
    }

    var requestIp = getRequestIp(req);

    return allowedIps.indexOf(requestIp) !== -1;
}

function getBaseUrl(req) {
    var host = req.get('host');
    if (!host) {
        return '';
    }
    return req.protocol + '://' + host;
}

function getMissingEnvKeys(keys) {
    return keys.filter(function(key) {
        var value = process.env[key];
        return !value || !value.toString().trim();
    });
}

function logVerificationIpContext(label, req, details) {
    var requestIp = getRequestIp(req);
    var upstreamClientIp = details && details.error && (details.error.clientIP || details.error.clientIp);
    var requestId = details && details.requestId;

    console.warn('[' + label + '] verification failed - requestIp=' + (requestIp || 'unknown') + ', upstreamClientIP=' + (upstreamClientIp || 'unknown') + ', requestId=' + (requestId || 'n/a'));
}

function logIncomingVerificationRequest(label, req) {
    var requestIp = getRequestIp(req);
    console.log('[' + label + '] incoming verification request - requestIp=' + (requestIp || 'unknown'));
}

function buildVerificationHeaders(req, merchantId, apiKey, secretKey) {
    var requestIp = getRequestIp(req);
    var headers = {
        'Content-Type': 'application/json',
        'x-merchant-id': merchantId,
        'x-api-key': apiKey,
        'x-secret-key': secretKey
    };

    if (requestIp) {
        headers['x-forwarded-for'] = requestIp;
        headers['x-real-ip'] = requestIp;
    }

    return headers;
}

function getVerificationDiagnostics(req) {
    var allowedIps = getAllowedIps();
    var requestIp = getRequestIp(req);

    return {
        success: true,
        requestIp: requestIp || 'unknown',
        isIpAllowed: isIpAllowed(req),
        allowlistCount: allowedIps.length,
        allowlist: allowedIps,
        verifyUrls: {
            pan: PAN_VERIFY_API_URL,
            voterId: VOTER_VERIFY_API_URL,
            criminalVerification: CRIMINAL_VERIFY_API_URL,
            okycInitiate: OKYC_INITIATE_API_URL,
            okycVerify: OKYC_VERIFY_API_URL,
            faceMatch: FACE_MATCH_API_URL || 'not configured'
        },
        credentialsConfigured: {
            merchantId: !!(process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID),
            apiKey: !!(process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY),
            secretKey: !!(process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY)
        }
    };
}

// Middleware - CORS settings
app.use(cors({
    origin: true, // Allow all origins for development. Set to specific URL in production.
    credentials: true
}));
app.use(express.json());

// RPN AI System Prompt
var SYSTEM_PROMPT = 'You are RPN AI, a helpful assistant for RPN Travels (Google Bus).\n' +
'Company Info:\n' +
'- Operating since 1973 (52+ years of service)\n' +
'- Phone: 9842422929, 8072560787\n' +
'- Email: rpntravels@gmail.com, rpntravels@yahoo.com\n' +
'\n' +
'Services:\n' +
'- Tourist bus booking for marriages, college tours, family functions\n' +
'- Special tours: Navagraham Tour, Kovil Tour, Thirupathi Tour, Arupadai Tour, Sabarimalai Tour\n' +
'\n' +
'Features:\n' +
'- Reliable Services\n' +
'- Affordable Prices\n' +
'- Safety First\n' +
'- Customer Satisfaction\n' +
'\n' +
'Be friendly, concise, and helpful. If you don\'t know something, suggest contacting the company directly.';

// Chat endpoint
app.post('/api/chat', function(req, res) {
    var message = req.body.message;
    var history = req.body.history || [];

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
            success: false, 
            error: 'OpenAI API key not configured on server' 
        });
    }

    // Prepare messages for OpenAI
    var messages = [
        { role: 'system', content: SYSTEM_PROMPT }
    ].concat(history).concat([
        { role: 'user', content: message }
    ]);

    // Call OpenAI API using node-fetch
    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            throw new Error(data.error.message || 'OpenAI API error');
        }
        res.json({
            success: true,
            response: data.choices[0].message.content,
            usage: data.usage
        });
    })
    .catch(function(error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get AI response'
        });
    });
});

function handlePanVerification(req, res) {
    logIncomingVerificationRequest('PAN', req);

    var pan = (req.body.pan || '').toString().trim().toUpperCase();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (PAN_VERIFY_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/pan')) {
        return res.status(500).json({
            success: false,
            error: 'PAN verify proxy target points to this same endpoint. Set CGEPY_VERIFY_URL to the real upstream API URL.'
        });
    }

    if (!pan) {
        return res.status(400).json({ success: false, error: 'PAN is required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for PAN verification'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    fetch(PAN_VERIFY_API_URL, {
        method: 'POST',
        headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
        body: JSON.stringify({ pan: pan })
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('PAN', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

function handleVoterIdVerification(req, res) {
    logIncomingVerificationRequest('VOTER_ID', req);

    var voterId = (req.body.voterId || '').toString().trim().toUpperCase();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (VOTER_VERIFY_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/voter-id')) {
        return res.status(500).json({
            success: false,
            error: 'Voter ID verify proxy target points to this same endpoint. Set CGEPY_VOTER_VERIFY_URL to the real upstream API URL.'
        });
    }

    if (!voterId) {
        return res.status(400).json({ success: false, error: 'Voter ID is required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for Voter ID verification'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    fetch(VOTER_VERIFY_API_URL, {
        method: 'POST',
        headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
        body: JSON.stringify({ voterId: voterId })
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('VOTER_ID', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

function handleOkycVerification(req, res) {
    logIncomingVerificationRequest('OKYC', req);

    var sessionId = (req.body.sessionId || '').toString().trim();
    var otp = (req.body.otp || '').toString().trim();
    var aadhaarNumber = (req.body.aadhaarNumber || '').toString().trim();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (OKYC_VERIFY_API_URL || '').replace(/\/$/, '');

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

    fetch(OKYC_VERIFY_API_URL, {
        method: 'POST',
        headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
        body: JSON.stringify({
            sessionId: sessionId,
            otp: otp,
            aadhaarNumber: aadhaarNumber
        })
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('OKYC', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

function handleOkycInitiate(req, res) {
    logIncomingVerificationRequest('OKYC_INITIATE', req);

    var aadhaarNumber = (req.body.aadhaarNumber || '').toString().trim();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedInitiateUrl = (OKYC_INITIATE_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedInitiateUrl === (baseUrl + '/api/v1/verify/okyc/initiate')) {
        return res.status(500).json({
            success: false,
            error: 'OKYC initiate proxy target points to this same endpoint. Set CGEPY_OKYC_INITIATE_URL to the real upstream API URL.'
        });
    }

    if (!aadhaarNumber) {
        return res.status(400).json({ success: false, error: 'aadhaarNumber is required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for OKYC initiate'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    fetch(OKYC_INITIATE_API_URL, {
        method: 'POST',
        headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
        body: JSON.stringify({
            aadhaarNumber: aadhaarNumber
        })
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('OKYC_INITIATE', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

function handleCriminalVerification(req, res) {
    logIncomingVerificationRequest('CRIMINAL_VERIFICATION', req);

    var name = (req.body.name || '').toString().trim();
    var address = (req.body.address || '').toString().trim();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (CRIMINAL_VERIFY_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/criminal_verification')) {
        return res.status(500).json({
            success: false,
            error: 'Criminal verification proxy target points to this same endpoint. Set CGEPY_CRIMINAL_VERIFY_URL to the real upstream API URL.'
        });
    }

    if (!name || !address) {
        return res.status(400).json({ success: false, error: 'name and address are required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for criminal verification'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    fetch(CRIMINAL_VERIFY_API_URL, {
        method: 'POST',
        headers: buildVerificationHeaders(req, merchantId, apiKey, secretKey),
        body: JSON.stringify({
            name: name,
            address: address
        })
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('CRIMINAL_VERIFICATION', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

function handleFaceMatchVerification(req, res) {
    logIncomingVerificationRequest('FACE_MATCH', req);

    var files = req.files || {};
    var image1 = files.image1 && files.image1[0];
    var image2 = files.image2 && files.image2[0];
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (FACE_MATCH_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/face_match')) {
        return res.status(500).json({
            success: false,
            error: 'Face match proxy target points to this same endpoint. Set CGEPY_FACE_MATCH_URL to the real upstream API URL.'
        });
    }

    if (!image1 || !image2) {
        return res.status(400).json({ success: false, error: 'image1 and image2 files are required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for face match verification'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    if (!FACE_MATCH_API_URL) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY face match upstream URL is not configured on server. Set CGEPY_FACE_MATCH_URL to the working upstream endpoint.'
        });
    }

    var payload = new FormData();
    payload.append('image1', image1.buffer, {
        filename: image1.originalname || 'image1.jpg',
        contentType: image1.mimetype || 'application/octet-stream'
    });
    payload.append('image2', image2.buffer, {
        filename: image2.originalname || 'image2.jpg',
        contentType: image2.mimetype || 'application/octet-stream'
    });

    var requestIp = getRequestIp(req);
    var headers = payload.getHeaders({
        'x-merchant-id': merchantId,
        'x-api-key': apiKey,
        'x-secret-key': secretKey
    });

    if (requestIp) {
        headers['x-forwarded-for'] = requestIp;
        headers['x-real-ip'] = requestIp;
    }

    fetch(FACE_MATCH_API_URL, {
        method: 'POST',
        headers: headers,
        body: payload
    })
    .then(function(response) {
        return response.text().then(function(text) {
            var data;
            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                data = { raw: text };
            }

            if (!response.ok) {
                logVerificationIpContext('FACE_MATCH', req, data);
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY verification API'
        });
    });
}

// PAN verification proxy endpoints
app.post('/api/verify/pan', handlePanVerification);
app.post('/api/v1/verify/pan', handlePanVerification);

// Voter ID verification proxy endpoints
app.post('/api/verify/voter-id', handleVoterIdVerification);
app.post('/api/v1/verify/voter-id', handleVoterIdVerification);

// Criminal verification proxy endpoints
app.post('/api/verify/criminal_verification', handleCriminalVerification);
app.post('/api/v1/verify/criminal_verification', handleCriminalVerification);

// Face match verification proxy endpoints
app.post('/api/verify/face_match', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), handleFaceMatchVerification);
app.post('/api/v1/verify/face_match', upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), handleFaceMatchVerification);

// OKYC verification proxy endpoints
app.post('/api/verify/okyc/initiate', handleOkycInitiate);
app.post('/api/v1/verify/okyc/initiate', handleOkycInitiate);
app.post('/api/verify/okyc/verify', handleOkycVerification);
app.post('/api/v1/verify/okyc/verify', handleOkycVerification);

// Verification diagnostics endpoints
app.get('/api/verify/diagnostics', function(req, res) {
    res.json(getVerificationDiagnostics(req));
});
app.get('/api/v1/verify/diagnostics', function(req, res) {
    res.json(getVerificationDiagnostics(req));
});

// Health check endpoint
app.get('/api/health', function(req, res) {
    res.json({ status: 'OK', service: 'RPN Travels API' });
});

// Start server
app.listen(PORT, function() {
    console.log('🚀 RPN Travels Backend running on http://localhost:' + PORT);
    console.log('📡 API endpoint: http://localhost:' + PORT + '/api/chat');
    console.log('🧾 PAN verify endpoint: http://localhost:' + PORT + '/api/verify/pan');
    console.log('🧾 PAN verify v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/pan');
    console.log('🗳️ Voter ID verify endpoint: http://localhost:' + PORT + '/api/verify/voter-id');
    console.log('🗳️ Voter ID verify v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/voter-id');
    console.log('🧑‍⚖️ Criminal verify endpoint: http://localhost:' + PORT + '/api/verify/criminal_verification');
    console.log('🧑‍⚖️ Criminal verify v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/criminal_verification');
    console.log('🧑 Face match endpoint: http://localhost:' + PORT + '/api/verify/face_match');
    console.log('🧑 Face match v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/face_match');
    console.log('🪪 OKYC initiate endpoint: http://localhost:' + PORT + '/api/verify/okyc/initiate');
    console.log('🪪 OKYC initiate v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/okyc/initiate');
    console.log('🪪 OKYC verify endpoint: http://localhost:' + PORT + '/api/verify/okyc/verify');
    console.log('🪪 OKYC verify v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/okyc/verify');
    console.log('🩺 Verify diagnostics endpoint: http://localhost:' + PORT + '/api/v1/verify/diagnostics');

    var missingOpenAIKeys = getMissingEnvKeys(['OPENAI_API_KEY']);
    if (missingOpenAIKeys.length > 0) {
        console.warn('⚠️ Missing env keys for AI:', missingOpenAIKeys.join(', '));
    }

    var missingCgepyKeys = getMissingEnvKeys(['CGEPY_MERCHANT_ID', 'CGEPY_API_KEY', 'CGEPY_SECRET_KEY']);
    if (missingCgepyKeys.length > 0) {
        console.warn('⚠️ Missing env keys for verification APIs:', missingCgepyKeys.join(', '));
    }

    var allowedIps = getAllowedIps();
    if (allowedIps.length > 0) {
        console.log('🔒 Verification API IP whitelist enabled:', allowedIps.join(', '));
    }
});
