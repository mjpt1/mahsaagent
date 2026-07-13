---
name: iran-forms-kit
description: >
  Build Iranian forms with Zod (mahsaagent/zod), react-hook-form, and bank sheba/account sync.
---

# Iranian forms kit

```bash
npm i mahsaagent zod react-hook-form @hookform/resolvers
```

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { nationalIdSchema, mobileSchema, shebaSchema, jalaliDateSchema } from "mahsaagent/zod";
import { useBankSync } from "mahsaagent/react/forms";

const schema = z.object({
  nationalId: nationalIdSchema,
  mobile: mobileSchema,
  sheba: shebaSchema,
  jalaliDate: jalaliDateSchema,
});

export function IranContactForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  const sheba = form.watch("sheba");
  const bank = useBankSync({ sheba });

  return (
    <form onSubmit={form.handleSubmit(console.log)} dir="rtl">
      {/* fields… */}
      {bank.bank && <p>{(bank.bank as { name?: string }).name}</p>}
    </form>
  );
}
```

See also `templates/next-rtl-iran` and skill `jalali-datepicker`.
