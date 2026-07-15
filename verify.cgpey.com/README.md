# verify.cgpey.com

This directory was added to provide a starter scaffold for `verify.cgpey.com`.

## Files

- `index.html` – root landing page with links to verification services
- `pan/index.html` – PAN verification page
- `face_match/index.html` – face match page using the backend proxy route
- `face_match/local-proxy-example.html` – standalone local proxy example for face match uploads
- `script.js` – shared PAN and face match interaction logic
- `style.css` – shared styling for verify pages

## Links

- Home page links to PAN page
- Home page links to Face Match page
- PAN page links to Home page
- Face Match page links to the standalone local proxy example

## Local Proxy Usage

The face match browser pages post files to `/api/v1/verify/face_match` on the same origin. The backend proxy injects `CGEPY_MERCHANT_ID`, `CGEPY_API_KEY`, and `CGEPY_SECRET_KEY`, so those values are not exposed in browser JavaScript.

For local development, opening the HTML files directly from disk falls back to `http://localhost:3000`.
