import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// The user app's face (apps/frontend), only the weights this page uses.
const googleSansFlex = localFont({
  src: [
    { path: "./fonts/google-sans-flex/google-sans-flex-latin-400-normal.woff", weight: "400" },
    { path: "./fonts/google-sans-flex/google-sans-flex-latin-500-normal.woff", weight: "500" },
    { path: "./fonts/google-sans-flex/google-sans-flex-latin-600-normal.woff", weight: "600" },
  ],
  variable: "--font-google-sans-flex",
});

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
      <body className={googleSansFlex.variable}>{children}</body>
    </html>
  );
}
