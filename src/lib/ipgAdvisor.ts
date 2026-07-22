import { createIpgRegistry, type IpgPayRequest } from "../ipg/index.js";

export type IpgGateway = {
  id: string;
  nameFa: string;
  website: string;
  currencies: Array<"IRR" | "IRT">;
  sandbox: boolean;
  npmHints: string[];
  stepsFa: string[];
};

const GATEWAYS: IpgGateway[] = [
  {
    id: "zarinpal",
    nameFa: "زرین‌پال",
    website: "https://www.zarinpal.com",
    currencies: ["IRR"],
    sandbox: true,
    npmHints: ["zarinpal-checkout", "zarinpal-node-sdk"],
    stepsFa: [
      "در پنل زرین‌پال Merchant ID بگیرید",
      "در backend: Request → Authority → Redirect",
      "callback: Verify با amount و authority",
    ],
  },
  {
    id: "idpay",
    nameFa: "آیدی‌پی",
    website: "https://idpay.ir",
    currencies: ["IRR"],
    sandbox: true,
    npmHints: ["@idpay/sdk", "idpay-node-sdk"],
    stepsFa: ["API Key از پنل", "POST /v1.1/payment", "Verify در callback"],
  },
  {
    id: "zibal",
    nameFa: "زیبال",
    website: "https://zibal.ir",
    currencies: ["IRR"],
    sandbox: true,
    npmHints: ["zibal", "axios + REST"],
    stepsFa: ["merchant از پنل", "request → trackId", "verify با trackId"],
  },
  {
    id: "mock",
    nameFa: "موک Mahsaagent",
    website: "local",
    currencies: ["IRR", "IRT"],
    sandbox: true,
    npmHints: ["mahsaagent/ipg"],
    stepsFa: ["createIpgRegistry().pay('mock', …)", "verify با authority موک"],
  },
];

export function listIpgGateways() {
  return GATEWAYS;
}

export function adviseIpgIntegration(opts: {
  gateway?: string;
  amount?: number;
  callbackUrl?: string;
  currency?: "IRR" | "IRT";
}) {
  const gw = GATEWAYS.find((g) => g.id === opts.gateway) ?? null;
  const registry = createIpgRegistry();
  const mockFlow =
    opts.amount && opts.callbackUrl
      ? {
          pay: {
            request: {
              amount: opts.amount,
              callbackUrl: opts.callbackUrl,
              currency: opts.currency ?? "IRR",
            } satisfies IpgPayRequest,
          },
        }
      : null;

  return {
    selected: gw,
    available: GATEWAYS.map((g) => ({ id: g.id, nameFa: g.nameFa, sandbox: g.sandbox })),
    contract: registry.guide(),
    integrationSteps: gw?.stepsFa ?? ["gateway را انتخاب کنید"],
    npmHints: gw?.npmHints ?? [],
    mockFlow,
    securityFa: [
      "Verify همیشه سمت سرور — نه در مرورگر",
      "amount را با سفارش ذخیره‌شده مقایسه کنید",
      "callback URL را whitelist کنید",
    ],
  };
}

export async function simulateIpgFlow(input: {
  amount: number;
  callbackUrl: string;
  currency?: "IRR" | "IRT";
}) {
  const reg = createIpgRegistry();
  const pay = await reg.pay("mock", {
    amount: input.amount,
    callbackUrl: input.callbackUrl,
    currency: input.currency ?? "IRR",
    description: "Mahsaagent IPG advisor mock",
  });
  if (!pay.ok || !pay.authority) return { ok: false as const, pay };
  const verify = await reg.verify("mock", { authority: pay.authority, amount: input.amount });
  return { ok: true as const, pay, verify };
}
