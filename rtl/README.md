# RTL در Cursor — اعمال خودکار

## قبلاً اعمال شده؟

اسکریپت `apply-to-cursor.ps1` استایل را داخل `workbench.html` تزریق می‌کند (پایدار تا آپدیت Cursor).

## اعمال مجدد (بعد از آپدیت Cursor)

```powershell
powershell -ExecutionPolicy Bypass -File rtl/apply-to-cursor.ps1
```

سپس: **Ctrl+Shift+P → Developer: Reload Window**

## حذف

```powershell
powershell -ExecutionPolicy Bypass -File rtl/remove-from-cursor.ps1
```

## روش کنسول (اختیاری)

1. Developer Tools → Console
2. تایپ `allow pasting` و Enter
3. Paste فایل `inject.js`
