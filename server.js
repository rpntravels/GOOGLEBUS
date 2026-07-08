// RPN Travels Backend Server
// OpenAI API Proxy - Keeps your API key secure on the server

require('dotenv').config();
var express = require('express');
var cors = require('cors');
var fetch = require('node-fetch');

var app = express();
var PORT = process.env.PORT || 3000;

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

// Health check endpoint
app.get('/api/health', function(req, res) {
    res.json({ status: 'OK', service: 'RPN Travels API' });
});

// Start server
app.listen(PORT, function() {
    console.log('🚀 RPN Travels Backend running on http://localhost:' + PORT);
    console.log('📡 API endpoint: http://localhost:' + PORT + '/api/chat');
});
import dotenv from "dotenv";
dotenv.config({ path: "cgepy.env" });
