import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LabelForge - AI Annotation Platform",
  description:
    "Collaborative AI-assisted image annotation platform with real-time multi-user support and model version management.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#0F172A",
              border: "1px solid #334155",
              color: "#EAF2FF",
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  );
}
