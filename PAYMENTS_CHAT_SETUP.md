# Payments (Flutterwave) + Chat (OpenAI) — Setup (beginner)

## Rule 1: keys NEVER go in the app or GitHub
- `cancercompass-app.html` has NO keys. It only talks to YOUR backend URL.
- Keys live in backend `.env` on your computer/server only.

## What to tell me
1. **Payment purpose:** donations to CancerCompass? premium content? clinic bills? (PRD has no payments — I labelled it "support" for now.)
2. **Live or test?** Use Flutterwave TEST keys first (`sk_test_...`).

## Run locally (5 min)
1. Install Node.js LTS from nodejs.org
2. In this folder: `npm install express cors dotenv node-fetch@2`
3. Copy `.env.example` to `.env`, paste your test keys
4. Run: `node backend-example.js` → shows `http://localhost:3001`
5. In the app → Support tab → Backend URL: `http://localhost:3001` → Send chat / Pay
   - No backend? App still works offline in demo mode (canned kind replies, pay intent saved).

## Safety (PRD Sec 22)
- Chat system prompt: general info only, no diagnosis/doses, encourages team consult, red-flags open Help + urge human care.
- Payments: created server-side via Flutterwave `/v3/payments`, user pays on Flutterwave's page. Verify webhook + tx_ref server-side before granting anything.
- Do not store health details with payments. Keep `wipe data` working.

## Go live later
- Host backend (Render/Fly/VPS) with HTTPS, set env vars there, put that URL in the app.
- Switch Flutterwave to live keys only after test success + refund policy written.
