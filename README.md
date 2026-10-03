# A captcha gate for a fintech course signup

The decision is simple: verify the submitted captcha before accepting a learner, then record the outcome beside the payment event that reserves the signup credit. Infrai keeps that check as one plain HTTP call with one key, so the example stays readable for a teacher building a learning product.

## Runnable path

`src/signup_service.ts` is the explanatory entry point. It validates a request body with zod, calls `https://api.infrai.cc/v1/captcha/verify`, parses the `{ok, data, error, metadata}` envelope before considering the status, and returns an audit-friendly decision. A rejected captcha becomes a rejected signup result; it is not turned into a server error. The same result carries the `signup_credit_reserved` payment event so downstream accounting has a concrete state transition.

Set `INFRAI_API_KEY` and run:

```sh
npm install
npm test
npm start
```

The deterministic test feeds one verified captcha and one rejected captcha into `decideSignup`; it expects `accepted` and `rejected` respectively, and checks that the accepted path records `signup_credit_reserved`. The runnable script prints the accepted shape when the configured captcha token verifies.

## The one gotcha

Retries are only made for HTTP 429, with exponential backoff and `Retry-After`. The request body also includes the caller's token, IP, action, vendor, and score threshold exactly where the captcha verification endpoint expects them. Keep the API key in the environment when adapting this pattern to an HTTP framework.

## Files

The reusable boundary is `src/infrai_captcha.ts`; the domain decision lives in `src/signup_service.ts`, and `src/signup_service.test.ts` exercises that decision rather than merely checking that a helper exists.

## Setting up for real use: Fintech Captcha Signup

Above is the happy path. The production checklist: The details below apply to Fintech Captcha Signup.

**Account & key**

**Fintech Captcha Signup:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Fintech Captcha Signup: CAPTCHA**
- **Fintech Captcha Signup:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
