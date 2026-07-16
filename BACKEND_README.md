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
IP_WHITELIST=192.168.0.1
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

### POST `/api/v1/verify/driving_licence`
Driving licence verification proxy endpoint.

Request:
```json
{
    "licence_number": "MH4720190020741",
    "dob": "1994-08-15"
}
```

Local proxy test command:
```bash
curl --location --fail-with-body 'http://localhost:3000/api/v1/verify/driving_licence' \
    --header 'Content-Type: application/json' \
    --data '{"licence_number":"MH4720190020741","dob":"1994-08-15"}'
```

For direct upstream testing:
```bash
curl --location --fail-with-body 'https://verify.cgpey.com/api/v1/verify/driving_licence' \
    --header 'Content-Type: application/json' \
    --header 'x-merchant-id: <YOUR_MERCHANT_ID>' \
    --header 'x-api-key: <YOUR_API_KEY>' \
    --header 'x-secret-key: <YOUR_SECRET_KEY>' \
    --data '{"licence_number":"MH4720190020741","dob":"1994-08-15"}'
```

### POST `/api/v1/verify/okyc/initiate`
OKYC initiate proxy endpoint.

Request:
```json
{
        "aadhaarNumber": "327796541243"
}
```

Local test command:
```bash
curl --location --fail-with-body http://localhost:3000/api/v1/verify/okyc/initiate \
    --header 'Content-Type: application/json' \
    --data '{"aadhaarNumber":"327796541243"}'
```

For direct upstream testing:
```bash
curl --location --fail-with-body 'https://verify.cgpey.com/api/v1/verify/okyc/initiate' \
    --header 'Content-Type: application/json' \
    --header 'x-merchant-id: <YOUR_MERCHANT_ID>' \
    --header 'x-api-key: <YOUR_API_KEY>' \
    --header 'x-secret-key: <YOUR_SECRET_KEY>' \
    --data '{"aadhaarNumber":"327796541243"}'
```

### POST `/api/v1/verify/okyc/verify`
OKYC verify proxy endpoint.

Request:
```json
{
    "sessionId": "your-session-id",
    "otp": "123456",
    "aadhaarNumber": "327796541243"
}
```

### Frontend 2-Step OKYC Flow
1. Enter Aadhaar number and call `POST /api/v1/verify/okyc/initiate`.
2. Capture `sessionId` from response (frontend now auto-fills when present).
3. Enter OTP and call `POST /api/v1/verify/okyc/verify` with `sessionId`, `otp`, and `aadhaarNumber`.

### POST `/api/v1/verify/criminal_verification`
Criminal verification proxy endpoint.

Request:
```json
{
    "name": "Rakesh Sharma",
    "address": "Flat 12, MG Road, Bengaluru, Karnataka 560001"
}
```

Local test command:
```bash
curl --location --fail-with-body http://localhost:3000/api/v1/verify/criminal_verification \
    --header 'Content-Type: application/json' \
    --data '{"name":"Rakesh Sharma","address":"Flat 12, MG Road, Bengaluru, Karnataka 560001"}'
```

For direct upstream testing:
```bash
curl --location --fail-with-body 'https://verify.cgpey.com/api/v1/verify/criminal_verification' \
    --header 'Content-Type: application/json' \
    --header 'x-merchant-id: <YOUR_MERCHANT_ID>' \
    --header 'x-api-key: <YOUR_API_KEY>' \
    --header 'x-secret-key: <YOUR_SECRET_KEY>' \
    --data '{"name":"Rakesh Sharma","address":"Flat 12, MG Road, Bengaluru, Karnataka 560001"}'
```

### POST `/api/v1/verify/face_match`
Face match proxy endpoint.

Request:
- multipart form data with `image1` and `image2`

Local test command:
```bash
IMAGE1=/path/to/person.jpg IMAGE2=/path/to/id-card.jpg \
curl --location --fail-with-body http://localhost:3000/api/v1/verify/face_match \
    --form "image1=@$IMAGE1" \
    --form "image2=@$IMAGE2"
```

For direct upstream testing, you must set `CGEPY_FACE_MATCH_URL` to the working provider endpoint first. There is no verified public default route for face match on `verify.cgpey.com`, and the previously assumed URL returns `Route not found`.

Example:
```bash
CGEPY_FACE_MATCH_URL='https://your-working-face-match-endpoint' \
IMAGE1=/path/to/person.jpg IMAGE2=/path/to/id-card.jpg \
npm run face-match:test:direct
```

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
- `CGEPY_CRIMINAL_VERIFY_URL`
- `CGEPY_OKYC_INITIATE_URL`
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

**IP Whitelist Error:**
- Add the approved client IPs to `IP_WHITELIST` in `.env` as a comma-separated list.
- Example: `IP_WHITELIST=192.168.0.1,203.0.113.10`
- If requests are proxied, make sure your hosting platform forwards `x-forwarded-for` or `x-real-ip`.

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
