/**
 * SMS / OTP contract — interface + in-memory mock (no real SMS gateway).
 */
export type SmsMessage = {
  to: string;
  text: string;
  templateId?: string;
  vars?: Record<string, string>;
};

export type SmsSendResult = {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
};

export interface SmsProvider {
  send(message: SmsMessage): Promise<SmsSendResult>;
}

export class MockSmsProvider implements SmsProvider {
  public sent: SmsMessage[] = [];

  async send(message: SmsMessage): Promise<SmsSendResult> {
    if (!/^09\d{9}$/.test(message.to.replace(/\D/g, "").replace(/^98/, "0"))) {
      return { ok: false, error: "invalid_mobile" };
    }
    this.sent.push(message);
    return { ok: true, providerMessageId: `mock_${this.sent.length}` };
  }
}

export function buildOtpMessage(code: string, appName = "App"): SmsMessage {
  return {
    to: "",
    text: `${appName}: کد تأیید شما ${code} است.`,
    templateId: "otp",
    vars: { code, appName },
  };
}

export function generateOtp(length = 6, seed?: number): string {
  let s = seed ?? Date.now();
  let out = "";
  for (let i = 0; i < length; i++) {
    s = (s * 1103515245 + 12345) >>> 0;
    out += String(s % 10);
  }
  return out;
}
