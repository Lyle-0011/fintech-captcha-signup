import { strict as assert } from "node:assert";
import { decideSignup } from "./signup_service.js";

const accepted = await decideSignup({email: "student@example.com", password: "a sufficiently long password", name: "Student", widgetRecordId: "test-widget", captchaToken: "token", ip: "198.51.100.9"}, async () => ({ok: true, data: {score: 0.9}}));
assert.equal(accepted.status, "accepted");
assert.equal(accepted.payment.event, "signup_credit_reserved");
const rejected = await decideSignup({email: "student@example.com", password: "a sufficiently long password", name: "Student", widgetRecordId: "test-widget", captchaToken: "token", ip: "198.51.100.9"}, async () => ({ok: false, error: {code: "bot_score_low"}}));
assert.equal(rejected.status, "rejected");
console.log("signup decision test passed");
