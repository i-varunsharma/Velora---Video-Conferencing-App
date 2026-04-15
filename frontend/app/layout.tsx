import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velora — Video Conferencing",
  description: "A modern, scalable video conferencing platform built with WebRTC. Create meetings, share screens, and collaborate in real-time.",
  keywords: ["video conferencing", "webrtc", "meetings", "screen sharing", "velora"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#0E78F9',
          colorBackground: '#1C1F2E',
          colorText: '#ffffff',
          colorInputBackground: '#252A41',
          colorInputText: '#ffffff',
        },
        layout: {
          socialButtonsVariant: 'iconButton',
          socialButtonsPlacement: 'bottom',
        },
      }}
    >
      <html lang="en">
        <body className={`${inter.variable} antialiased bg-dark-2 text-white`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
