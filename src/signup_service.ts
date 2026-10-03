import { z } from "zod";
import { verifyCaptcha } from "./infrai_captcha.js";

export const signupBody = z.object({email: z.string().email(), password: z.string().min(12), name: z.string().min(1), widgetRecordId: z.string().min(1), captchaToken: z.string().min(1), ip: z.string().min(1)});
export type SignupBody = z.infer<typeof signupBody>;
export type SignupDecision = {status: "accepted" | "rejected"; reason: string; audit: {event: string; email: string; at: string}; payment: {event: "signup_credit_reserved"; amount: 2; currency: "USD"}};

export async function decideSignup(input: unknown, captcha = verifyCaptcha): Promise<SignupDecision> {
  const body = signupBody.parse(input);
  const checked = await captcha(body.widgetRecordId, body.captchaToken, body.ip, "fintech_signup");
  const accepted = checked.ok;
  return {status: accepted ? "accepted" : "rejected", reason: accepted ? "captcha_verified" : (checked.error?.code ?? "captcha_rejected"), audit: {event: accepted ? "signup_accepted" : "signup_rejected", email: body.email, at: new Date().toISOString()}, payment: {event: "signup_credit_reserved", amount: 2, currency: "USD"}};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = await decideSignup({email: "learner@example.com", password: "correct horse battery", name: "Learner", widgetRecordId: process.env.INFRAI_WIDGET_RECORD_ID ?? "demo-widget-record-id", captchaToken: "demo-token", ip: "203.0.113.10"});
  console.log(JSON.stringify(result, null, 2));
}
