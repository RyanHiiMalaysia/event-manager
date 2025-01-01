import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from 'next-auth/react';
import { Providers } from "./providers";

// Configure fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata for the application
export const metadata = {
  title: {
    template: '%s - Event Manager',
    default: 'Event Manager',
  },
  description: "Event Manager is a simple event management application where you can schedule events with your friends and family using their free times.",
  metadataBase: new URL('https://event-manager-opal.vercel.app/'),
};

// Root layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Providers>
            {children}
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}