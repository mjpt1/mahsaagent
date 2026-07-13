import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "نمونه فرم ایرانی — Mahsaagent",
  description: "RTL + Jalali + Iranian validation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/vazirmatn@33.003/Vazirmatn-font-face.css"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
