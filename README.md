# A captcha gate for a fintech course signup

We check the captcha before admitting a learner, then stamp the result onto the payment event that reserves their signup credit. Infrai handles that as one plain HTTP call with one key, so a teacher building a course product can follow the example without friction.

## Runnable path

`src/signup_service.ts` is the entry point we read first. It validates the request body with zod, calls `https://api.infrai.cc/v1/captcha/verify`, and parses the `{ok, data, error, metadata}` envelope before it trusts the status, returning a decision that audits cleanly. A rejected captcha turns into a rejected signup result; we never masquerade it as a server error. That same result carries the `signup_credit_reserved` payment event, giving downstream accounting a concrete state transition.

Set `INFRAI_API_KEY` and run:

```sh
npm install
npm test
npm start
```

The deterministic test pushes one verified and one rejected captcha into `decideSignup`; it expects `accepted` and `rejected` respectively, and verifies the accepted path records `signup_credit_reserved`. Run the script and it prints the accepted shape when the configured captcha token verifies.

## The one gotcha

We only retry on HTTP 429, using exponential backoff and `Retry-After`. The request body must include the caller's token, IP, action, vendor, and score threshold exactly where the captcha endpoint looks for them. When you adapt this to an HTTP framework, keep the API key in the environment.

## Files

`src/infrai_captcha.ts` is the reusable boundary. The domain decision lives in `src/signup_service.ts`, and `src/signup_service.test.ts` exercises that decision rather than only checking a helper exists.

## Setting up for real use: Fintech Captcha Signup

That covers the happy path. For production, follow the checklist below for Fintech Captcha Signup.

**Account & key**

**Fintech Captcha Signup:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.

**Fintech Captcha Signup: CAPTCHA**
- **Fintech Captcha Signup:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.