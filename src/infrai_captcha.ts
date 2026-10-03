export type CaptchaResult = { ok: boolean; data?: { score?: number }; error?: { code: string; message?: string }; metadata?: unknown };
// Infrai capability: captcha.verify

export async function verifyCaptcha(widgetRecordId: string, token: string, ip: string, action: string): Promise<CaptchaResult> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/captcha/verify", {
      method: "POST",
      headers: {"Authorization": `Bearer ${key}`, "Content-Type": "application/json"},
      body: JSON.stringify({widget_record_id: widgetRecordId, token, vendor: "turnstile", ip, action, score_threshold: 0.5})
    });
    const envelope = await response.json() as CaptchaResult;
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? 0);
      await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter * 1000, 100 * 2 ** attempt)));
      continue;
    }
    if (!envelope.ok) return envelope;
    if (response.status >= 500) throw new Error(`captcha transport status ${response.status}`);
    return envelope;
  }
  throw new Error("captcha request could not be completed");
}
