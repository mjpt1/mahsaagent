/**
 * Iranian IPG (payment gateway) contract — uniform interface, no live SDKs bundled.
 * Wire ZarinPal / IdPay / Zibal / … behind these adapters in your app.
 */

export type IpgCurrency = "IRR" | "IRT";

export type IpgPayRequest = {
  amount: number;
  callbackUrl: string;
  description?: string;
  orderId?: string;
  mobile?: string;
  email?: string;
  currency?: IpgCurrency;
  metadata?: Record<string, string>;
};

export type IpgPayResult = {
  ok: boolean;
  authority?: string;
  redirectUrl?: string;
  error?: string;
  raw?: unknown;
};

export type IpgVerifyRequest = {
  authority: string;
  amount: number;
  currency?: IpgCurrency;
};

export type IpgVerifyResult = {
  ok: boolean;
  refId?: string;
  cardPan?: string;
  error?: string;
  raw?: unknown;
};

export interface IpgDriver {
  readonly name: string;
  pay(req: IpgPayRequest): Promise<IpgPayResult>;
  verify(req: IpgVerifyRequest): Promise<IpgVerifyResult>;
}

/** In-memory mock with amount-binding (like production verify checks). */
export class MockIpgDriver implements IpgDriver {
  readonly name = "mock";
  public paid: Array<IpgPayRequest & { authority: string }> = [];

  async pay(req: IpgPayRequest): Promise<IpgPayResult> {
    if (!req.amount || req.amount <= 0) {
      return {
        ok: false,
        error: "invalid_amount",
        raw: { code: -1, message: "Amount must be positive" },
      };
    }
    if (!req.callbackUrl) {
      return { ok: false, error: "missing_callback", raw: { code: -2, message: "callbackUrl required" } };
    }
    const authority = `MOCK-${Date.now().toString(36)}-${this.paid.length + 1}`;
    this.paid.push({ ...req, authority });
    return {
      ok: true,
      authority,
      redirectUrl: `${req.callbackUrl}?Authority=${authority}&Status=OK`,
      raw: {
        Status: 100,
        Authority: authority,
        amount: req.amount,
        currency: req.currency ?? "IRR",
        orderId: req.orderId ?? null,
      },
    };
  }

  async verify(req: IpgVerifyRequest): Promise<IpgVerifyResult> {
    const found = this.paid.find((p) => p.authority === req.authority);
    if (!found) {
      return {
        ok: false,
        error: "unknown_authority",
        raw: { Status: -51, message: "Authority not found" },
      };
    }
    if (Number(found.amount) !== Number(req.amount)) {
      return {
        ok: false,
        error: "amount_mismatch",
        raw: {
          Status: -54,
          expected: found.amount,
          received: req.amount,
          message: "Paid amount does not match verify amount",
        },
      };
    }
    return {
      ok: true,
      refId: `REF-${req.authority}`,
      cardPan: "6037-****-****-1234",
      raw: {
        Status: 100,
        RefID: `REF-${req.authority}`,
        card_pan: "6037-****-****-1234",
        amount: req.amount,
      },
    };
  }
}

export function createIpgRegistry(drivers: IpgDriver[] = [new MockIpgDriver()]) {
  const map = new Map(drivers.map((d) => [d.name, d]));
  return {
    list: () => [...map.keys()],
    get: (name: string) => map.get(name),
    register: (d: IpgDriver) => map.set(d.name, d),
    async pay(driver: string, req: IpgPayRequest) {
      const d = map.get(driver);
      if (!d) return { ok: false as const, error: "driver_not_found" };
      return d.pay(req);
    },
    async verify(driver: string, req: IpgVerifyRequest) {
      const d = map.get(driver);
      if (!d) return { ok: false as const, error: "driver_not_found" };
      return d.verify(req);
    },
    guide() {
      return [
        "IPG contract: implement IpgDriver for ZarinPal / IdPay / Zibal.",
        "Use official SDKs in your backend; Mahsaagent only defines the shape + mock.",
        "Always verify amount server-side (mock enforces amount_mismatch).",
        "Example packages: zarinpal-checkout, zarinpal-node-sdk, idpay SDKs.",
        "Wire: createIpgRegistry([new YourDriver(), new MockIpgDriver()]).",
      ].join("\n");
    },
  };
}
