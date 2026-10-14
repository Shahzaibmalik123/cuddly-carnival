import type { ReactNode } from "react";

export const metadata = {
  title: "File Agent",
  description: "Upload a PDF, Word, Excel or text file and ask Claude about it.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#f6f7f9",
          color: "#1a1a1a",
        }}
      >
        {children}
      </body>
    </html>
  );
}
