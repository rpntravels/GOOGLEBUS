# verify.cgpey.com

This directory was added to provide a starter scaffold for `verify.cgpey.com`.

## Files

- `index.html` – root landing page with links to verification services
- `pan/index.html` – PAN verification page
- `driving_licence/index.html` – driving licence verification page
- `face_match/index.html` – face match page using the backend proxy route
- `face_match/local-proxy-example.html` – standalone local proxy example for face match uploads
- `script.js` – shared PAN, driving licence, and face match interaction logic
- `style.css` – shared styling for verify pages

## Links

- Home page links to PAN page
- Home page links to Driving Licence page
- Home page links to Face Match page
- PAN page links to Home page
- Driving Licence page links to Home page
- Face Match page links to the standalone local proxy example

## Local Proxy Usage

The face match browser pages post files to `/api/v1/verify/face_match` on the same origin. The backend proxy injects `CGEPY_MERCHANT_ID`, `CGEPY_API_KEY`, and `CGEPY_SECRET_KEY`, so those values are not exposed in browser JavaScript.

For local development, opening the HTML files directly from disk falls back to `http://localhost:3000`.

## Driving Licence API Test

Use this direct upstream test command:

```bash
curl --location --fail-with-body 'https://verify.cgpey.com/api/v1/verify/driving_licence' \
	--header 'Content-Type: application/json' \
	--header 'x-merchant-id: <YOUR_MERCHANT_ID>' \
	--header 'x-api-key: <YOUR_API_KEY>' \
	--header 'x-secret-key: <YOUR_SECRET_KEY>' \
	--data '{
		"licence_number": "MH4720190020741",
		"dob": "1994-08-15"
	}'
```

Use this local proxy test command (run `npm start` first):

```bash
curl --location --fail-with-body 'http://localhost:3000/api/v1/verify/driving_licence' \
	--header 'Content-Type: application/json' \
	--data '{
		"licence_number": "MH4720190020741",
		"dob": "1994-08-15"
	}'
```
