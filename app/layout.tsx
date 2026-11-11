import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofBridge Dashboard",
  description: "ProofBridge network stats: bridges, dispute outcomes and proof times over the last 30 days.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
