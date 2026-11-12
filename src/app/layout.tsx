import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStateProvider } from "@/context/AppStateContext";

export const metadata: Metadata = {
  title: "AYURVEDA∞ — Complete BAMS Academic Ecosystem",
  description:
    "AI-Powered BAMS Learning, NCISM Syllabus Tracker, PYQ Bank, One-Tap Mock Exam Studio, Smart Notes, Mind Maps, and FSRS Flashcards.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AYURVEDA∞",
  },
};

export const viewport: Viewport = {
  themeColor: "#080E0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-[#27C68B]/30 selection:text-[#F4F7F4]">
        <AppStateProvider>{children}</AppStateProvider>
      </body>
    </html>
  );
}
