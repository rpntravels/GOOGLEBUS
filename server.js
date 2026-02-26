// RPN Travels Backend Server
// OpenAI API Proxy - Keeps your API key secure on the server

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:5500', 'https://rpntravels.github.io', 'https://your-domain.com'],
    credentials: true
}));
app.use(express.json());

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// RPN AI System Prompt
const SYSTEM_PROMPT = `You are RPN AI, a helpful assistant for RPN Travels (Google Bus).
Company Info:
- Operating since 1973 (52+ years of service)
- Phone: 9842422929, 8072560787
- Email: rpntravels@gmail.com, rpntravels@yahoo.com

Services:
- Tourist bus booking for marriages, college tours, family functions
- Special tours: Navagraham Tour, Kovil Tour, Thirupathi Tour, Arupadai Tour, Sabarimalai Tour

Features:
- Reliable Services
- Affordable Prices
- Safety First
- Customer Satisfaction

Be friendly, concise, and helpful. If you don't know something, suggest contacting the company directly.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Prepare messages for OpenAI
        const messages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history,
            { role: 'user', content: message }
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            max_tokens: 500,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        res.json({
            success: true,
            response: aiResponse,
            usage: completion.usage
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get AI response'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'RPN Travels API' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 RPN Travels Backend running on http://localhost:${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}/api/chat`);
});
