// RPN Travels Backend Server
// OpenAI API Proxy - Keeps your API key secure on the server

require('dotenv').config({ path: 'cgepy.env' });
require('dotenv').config();
var express = require('express');
var cors = require('cors');
var fetch = require('node-fetch');

var app = express();
var PORT = process.env.PORT || 3000;
var PAN_VERIFY_API_URL = process.env.CGEPY_VERIFY_URL || process.env.CGPEY_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/pan';
var VOTER_ID_VERIFY_API_URL = process.env.CGEPY_VOTER_ID_VERIFY_URL || process.env.CGPEY_VOTER_ID_VERIFY_URL || 'https://verify.cgpey.com/api/v1/verify/voter-id';

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
        headers: {
            'Content-Type': 'application/json',
            'x-merchant-id': merchantId,
            'x-api-key': apiKey,
            'x-secret-key': secretKey
        },
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
    var voterId = (req.body.voterId || '').toString().trim().toUpperCase();
    var merchantId = process.env.CGEPY_MERCHANT_ID || process.env.CGPEY_MERCHANT_ID;
    var apiKey = process.env.CGEPY_API_KEY || process.env.CGPEY_API_KEY;
    var secretKey = process.env.CGEPY_SECRET_KEY || process.env.CGPEY_SECRET_KEY;
    var baseUrl = getBaseUrl(req);
    var normalizedVerifyUrl = (VOTER_ID_VERIFY_API_URL || '').replace(/\/$/, '');

    if (baseUrl && normalizedVerifyUrl === (baseUrl + '/api/v1/verify/voter-id')) {
        return res.status(500).json({
            success: false,
            error: 'Voter ID verify proxy target points to this same endpoint. Set CGEPY_VOTER_ID_VERIFY_URL to the real upstream API URL.'
        });
    }

    if (!voterId) {
        return res.status(400).json({ success: false, error: 'voterId is required' });
    }

    if (!isIpAllowed(req)) {
        return res.status(403).json({
            success: false,
            error: 'IP is not allowlisted for voter ID verification'
        });
    }

    if (!merchantId || !apiKey || !secretKey) {
        return res.status(500).json({
            success: false,
            error: 'CGEPY credentials are not configured on server'
        });
    }

    fetch(VOTER_ID_VERIFY_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-merchant-id': merchantId,
            'x-api-key': apiKey,
            'x-secret-key': secretKey
        },
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
                return res.status(response.status).json({
                    success: false,
                    error: 'CGEPY voter ID verification failed',
                    details: data
                });
            }

            res.json(data);
        });
    })
    .catch(function(error) {
        console.error('CGEPY Voter ID API Error:', error);
        res.status(502).json({
            success: false,
            error: error.message || 'Failed to connect to CGEPY voter ID verification API'
        });
    });
}

// PAN verification proxy endpoints
app.post('/api/verify/pan', handlePanVerification);
app.post('/api/v1/verify/pan', handlePanVerification);
app.post('/api/verify/voter-id', handleVoterIdVerification);
app.post('/api/v1/verify/voter-id', handleVoterIdVerification);

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
    console.log('🪪 Voter ID verify endpoint: http://localhost:' + PORT + '/api/verify/voter-id');
    console.log('🪪 Voter ID verify v1 endpoint: http://localhost:' + PORT + '/api/v1/verify/voter-id');

    var missingOpenAIKeys = getMissingEnvKeys(['OPENAI_API_KEY']);
    if (missingOpenAIKeys.length > 0) {
        console.warn('⚠️ Missing env keys for AI:', missingOpenAIKeys.join(', '));
    }

    var missingCgepyKeys = getMissingEnvKeys(['CGEPY_MERCHANT_ID', 'CGEPY_API_KEY', 'CGEPY_SECRET_KEY']);
    if (missingCgepyKeys.length > 0) {
        console.warn('⚠️ Missing env keys for PAN verify:', missingCgepyKeys.join(', '));
    }

    var allowedIps = getAllowedIps();
    if (allowedIps.length > 0) {
        console.log('🔒 PAN verify IP whitelist enabled:', allowedIps.join(', '));
    }
});
