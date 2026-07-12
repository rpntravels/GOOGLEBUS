# RPN Travels Backend Server

Secure backend server for RPN Travels OpenAI API integration.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

Edit `.env` and add your API key:
```
OPENAI_API_KEY=your-actual-api-key-here
PORT=3000
```

### 3. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start at `http://localhost:3000`

### 4. Update Frontend Configuration

In `script.js`, update the `AI_CONFIG.apiEndpoint` if your backend is hosted at a different URL:

```javascript
const AI_CONFIG = {
    apiEndpoint: 'http://localhost:3000/api/chat', // For local development
    // For production:
    // apiEndpoint: 'https://your-server.com/api/chat'
};
```

## API Endpoints

### POST `/api/chat`
Send a message to the RPN AI assistant.

**Request:**
```json
{
    "message": "How do I book a bus?",
    "history": [
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi! How can I help?"}
    ]
}
```

**Response:**
```json
{
    "success": true,
    "response": "For bus bookings, please call us at 9842422929...",
    "usage": {
        "prompt_tokens": 50,
        "completion_tokens": 30,
        "total_tokens": 80
    }
}
```

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
    "status": "OK",
    "service": "RPN Travels API"
}
```

### POST `/api/v1/verify/pan`
PAN verification proxy endpoint.

Request:
```json
{
    "pan": "AZYPH1234W"
}
```

Local test commands:
```bash
# Public IP to share with CGEPY support
npm run ip

# Direct call to upstream using values from .env
npm run pan:test:direct

# Through local backend proxy (run `npm start` first)
npm run pan:test:local
```

If you receive `403 Forbidden` with `IP whitelist is mandatory but not configured`,
your source IP must be allowlisted by CGEPY for your merchant.

## Deployment Options

### Option 1: Render (Free)
1. Push code to GitHub
2. Connect repository to [Render](https://render.com)
3. Add `OPENAI_API_KEY` as environment variable
4. Deploy

### Option 2: Railway (Free)
1. Push code to GitHub
2. Connect to [Railway](https://railway.app)
3. Add environment variables
4. Deploy

### Option 3: Vercel
Use `vercel.json` configuration for serverless deployment.

For PAN verification API on Vercel, add these project environment variables:
- `CGEPY_VERIFY_URL`
- `CGEPY_MERCHANT_ID`
- `CGEPY_API_KEY`
- `CGEPY_SECRET_KEY`

### Option 4: Heroku
```bash
heroku create rpn-travels-backend
heroku config:set OPENAI_API_KEY=your-key
git push heroku main
```

## Security Notes

- ✅ API key is stored securely on the server
- ✅ CORS is configured for specific origins
- ✅ Never commit `.env` file to GitHub
- ⚠️ Update CORS origins in `server.js` for your production domain

## Troubleshooting

**CORS Error:**
- Update the `origin` array in `server.js` with your frontend URL
- For local testing, add your local dev server URL (e.g., `http://127.0.0.1:5500`)

**API Not Responding:**
- Check if server is running: `http://localhost:3000/api/health`
- Verify OpenAI API key is correct in `.env`
- Check console logs for errors

**PAN Verify Returns 403:**
- Run `npm run ip` and share that IP with CGEPY support.
- Ask CGEPY to allowlist the server IP (or disable IP whitelist for the merchant).
- Include `requestId` from the failed response when raising support ticket.

## Files

- `server.js` - Main backend server
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (DO NOT COMMIT)
- `.env.example` - Template for environment variables
