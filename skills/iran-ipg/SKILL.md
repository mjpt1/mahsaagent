---
name: iran-ipg
description: >
  Wire Iranian payment gateways (ZarinPal, IdPay, Zibal) behind Mahsaagent IpgDriver — never invent a parallel SDK.
---

# Iranian IPG integration

Use official / maintained SDKs behind the Mahsaagent contract:

```ts
import { createIpgRegistry, type IpgDriver, type IpgPayRequest } from "mahsaagent/ipg";

class ZarinpalAdapter implements IpgDriver {
  readonly name = "zarinpal";
  constructor(private merchantId: string) {}
  async pay(req: IpgPayRequest) {
    // call zarinpal-node-sdk / zarinpal-checkout here
    return { ok: false, error: "wire_official_sdk" };
  }
  async verify(req) {
    return { ok: false, error: "wire_official_sdk" };
  }
}

const ipg = createIpgRegistry([new ZarinpalAdapter(process.env.ZARINPAL_MERCHANT!)]);
```

Local mock for tests:

```bash
npx mahsaagent  # tool ipg_mock
```

Packages to prefer: `zarinpal-node-sdk`, `zarinpal-checkout`, `@naeimsafaee/ipg-node`.
