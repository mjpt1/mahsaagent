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

/** In-memory mock for tests and local demos. */
export class MockIpgDriver implements IpgDriver {
  readonly name = "mock";
  public paid: IpgPayRequest[] = [];

  async pay(req: IpgPayRequest): Promise<IpgPayResult> {
    if (!req.amount || req.amount <= 0) return { ok: false, error: "invalid_amount" };
    const authority = `MOCK-${this.paid.length + 1}`;
    this.paid.push(req);
    return {
      ok: true,
      authority,
      redirectUrl: `${req.callbackUrl}?Authority=${authority}&Status=OK`,
    };
  }

  async verify(req: IpgVerifyRequest): Promise<IpgVerifyResult> {
    if (!req.authority.startsWith("MOCK-")) return { ok: false, error: "unknown_authority" };
    return { ok: true, refId: `REF-${req.authority}`, cardPan: "6037-****-****-1234" };
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
        "Example: zarinpal-node-sdk, zarinpal-checkout, @naeimsafaee/ipg-node.",
      ].join("\n");
    },
  };
}
