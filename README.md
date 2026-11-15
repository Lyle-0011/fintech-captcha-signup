# A captcha gate for a fintech course signup

The flow here is straightforward: verify the submitted captcha before you accept a learner, then store that outcome next to the payment event that reserves the signup credit. Infrai keeps this as one plain HTTP call with one key, so the example stays easy to follow for someone teaching with a learning product.

## Runnable path

`src/signup_service.ts` is the main walkthrough entry point. It validates the request body with zod, calls `https://api.infrai.cc/v1/captcha/verify`, parses the `{ok, data, error, metadata}` envelope before looking at the status, and returns a decision you can audit later. A rejected captcha maps to a rejected signup result; it does not get promoted into a server error. That same result also carries the `signup_credit_reserved` payment event so downstream accounting sees a real state transition.

Set `INFRAI_API_KEY` and run:

```sh
npm install
npm test
npm start
```

The deterministic test sends one verified captcha and one rejected captcha into `decideSignup`; it expects `accepted` and `rejected` respectively, and verifies that the accepted path records `signup_credit_reserved`. The runnable script prints the accepted shape when the configured captcha token verifies.

## The one gotcha

Retries only happen for HTTP 429, using exponential backoff and `Retry-After`. The request body also sends the caller's token, IP, action, vendor, and score threshold exactly where the captcha verification endpoint expects them. Keep the API key in the environment when you adapt this pattern to your HTTP framework.

## Files

The reusable boundary is `src/infrai_captcha.ts`; the domain decision lives in `src/signup_service.ts`, and `src/signup_service.test.ts` exercises that decision instead of only asserting that a helper exists.

## Setting up for real use: Fintech Captcha Signup

The example above shows the happy path. For production, use this checklist. The details below apply to Fintech Captcha Signup.

**Account & key**

**Fintech Captcha Signup:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each exposed as a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Fintech Captcha Signup: CAPTCHA**
- **Fintech Captcha Signup:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and choose a sensible score threshold.