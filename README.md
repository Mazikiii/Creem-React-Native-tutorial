# Creem x Quill

A tutorial project demonstrating how to integrate Creem payments into a React Native app. The demo app is an AI writing assistant with a freemium model — users get 3 free AI actions per day, then hit a paywall that opens a Creem checkout inside a WebView.

---

## Structure

```
quill/           react native app (expo)
quill-backend/   express backend
```

---

## How the payment flow works

1. user taps "get quill pro" on the paywall screen
2. app calls `POST /api/checkout` on the backend
3. backend creates a creem checkout session and returns the `checkoutUrl`
4. app opens the url in a webview (`CheckoutScreen`)
5. user completes payment on the creem-hosted page
6. creem redirects to `quill://payment/success?checkout_id=...&signature=...`
7. webview intercepts the custom scheme, stops loading, parses the params
8. app navigates to `SuccessScreen` and calls `POST /api/verify-payment`
9. backend verifies the hmac-sha256 signature using the creem api key
10. on success, the app unlocks pro access

creem also fires webhooks to `/api/webhooks/creem` for every subscription lifecycle event. these are the source of truth for access control in production.

---

## quill (frontend)

```
src/
  config/
    index.ts        reads EXPO_PUBLIC_BACKEND_URL from env, falls back to localhost

  theme/
    colors.ts       color palette — warm cream + forest green accent
    typography.ts   font families, sizes, weights, spacing, radius
    shadows.ts      3-tier shadow system (ios + android)
    index.ts        barrel export

  types/
    index.ts        Document, AIAction, FREE_DAILY_LIMIT
    navigation.ts   typed stack params for all screens

  store/
    useAppStore.ts  module-level store, no external deps

  components/
    ProBadge.tsx        green badge shown when user is pro
    UsageCounter.tsx    dot-based tracker showing free uses remaining
    DocumentCard.tsx    home screen document card
    AIActionSheet.tsx   bottom sheet with ai actions

  screens/
    HomeScreen.tsx      document list + usage counter
    EditorScreen.tsx    writing editor + mocked ai + action sheet
    PaywallScreen.tsx   plan comparison + calls backend to get checkout url
    CheckoutScreen.tsx  webview that hosts creem checkout + deep link interception
    SuccessScreen.tsx   post-payment screen, verifies signature, unlocks pro
```

### deep link setup

the url scheme `quill://` is registered in `app.json` under `scheme`, `ios.infoPlist`, and `android.intentFilters`. no manual native file editing needed with expo.

### frontend env

the frontend only needs one environment variable — the url of your deployed backend. expo exposes any variable prefixed with `EXPO_PUBLIC_` to the client bundle at build time.

copy `env.example` to `.env` in the `quill/` folder:

```
EXPO_PUBLIC_BACKEND_URL=https://your-deployed-backend-url
```

if you are running the backend locally, you do not need a `.env` file at all. the config falls back to `http://localhost:3000` automatically. you only need to set this variable once you have a deployed backend url.

---

## quill-backend

```
src/
  types/
    creem.ts            webhook event types 
  services/
    creem.service.ts    sdk setup, checkout session creation, signature verification
    webhook.service.ts  handles each creem event type

  routes/
    checkout.route.ts       POST /api/checkout
    verify-payment.route.ts POST /api/verify-payment
    webhook.route.ts        POST /api/webhooks/creem

  middleware/
    rawBody.ts          captures raw body before express.json() parses it
                        required for webhook signature verification

  app.ts      
  server.ts   
```

### backend env variables

copy `env.example` to `.env` in the `quill-backend/` folder and fill in:

```
CREEM_API_KEY         test key from creem dashboard (developers tab)
CREEM_WEBHOOK_SECRET  generated when you register a webhook endpoint
CREEM_PRODUCT_ID      product id for "quill pro" from the products tab
PORT                  defaults to 3000
```

### important — webhook route ordering

the webhook route is mounted before `express.json()` on purpose. creem signature verification requires the raw request body string. once express parses it as json the original bytes are gone. the `rawBodyMiddleware` captures them first.

---

## before you run anything — setup checklist

work through this in order. skipping steps will cause silent failures.

**creem dashboard**

- create an account at creem.io and enable test mode
  - create a product called "quill pro" — recurring, monthly, whatever price you want(adviced $10, because of whats set in the ui)
- copy the product id from the products tab, you will need it for `CREEM_PRODUCT_ID`
- go to developers > api keys and copy your test key, this is `CREEM_API_KEY`

**deploy the backend first**

the backend must be live and reachable before you can register a webhook url in creem or point the frontend at it. see the deployment section below and come back here once you have a url.

**creem webhook**

- go to developers > webhooks in your creem dashboard and create a new webhook
- paste your deployed backend url followed by `/api/webhooks/creem` as the endpoint
- leave all events selected
- save it and copy the webhook secret creem generates, this is `CREEM_WEBHOOK_SECRET`

**backend env**

- fill in all three creem variables in `quill-backend/.env`
- restart the backend after saving

**frontend env**

- create `quill/.env` and set `EXPO_PUBLIC_BACKEND_URL` to your deployed backend url
- this is the only variable the frontend needs

**run the app**

- start your android emulator from android studio device manager
- run `npx expo start --android` from the `quill/` folder

---

## deploying the backend

### railway (This is recommended)

railway is the simplest option. it detects node automatically, gives you a permanent https url immediately, and has a free tier that is more than enough for a demo.

push your repo to github. go to railway.app, create a new project, connect your github repo. when it asks for a root directory set it to `quill-backend` — this tells railway to ignore the react native app entirely and only deploy the backend folder. add your three environment variables in the railway variables tab. railway runs `npm run build` then `npm start` automatically.

once deployed you get a url like `https://quill-backend-production.up.railway.app`. use that everywhere.

### render

render is a solid alternative to railway with a similar free tier. the setup is almost identical,connect your github repo, set the root directory to `quill-backend`, set the build command to `npm run build`, set the start command to `npm start`, and add your environment variables in the render dashboard. the main difference is that render's free tier spins down after 15 minutes of inactivity, so the first request after idle will be slow.

### fly.io

fly.io is more hands-on but gives you more control and better performance on the free tier.

### vercel

vercel works if you convert the express app to serverless functions, but that requires restructuring the code and loses the raw body middleware approach for webhooks. not recommended without changes.

---

## running locally

```bash
# backend
cd quill-backend
cp env.example .env   # fill in your keys
npm run dev

# frontend — open a new terminal, emulator must be running
cd quill
npx expo start --android
```

when running locally the frontend falls back to `http://localhost:3000` so no `.env` is needed in the `quill/` folder. the backend and emulator need to be on the same network or you need to update the fallback url in `src/config/index.ts` to your machine's local ip address if the emulator cannot reach localhost directly.

---

## test mode

everything runs against creem's sandbox by default. the test api key prefix is `creem_test_`. use creem's test card details to simulate payments. to go live, swap `CREEM_API_KEY` for your production key and set `NODE_ENV=production` on the backend.
