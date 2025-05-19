import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "TRD Dialer & SMS",
  description: "SMS and Voice Dialer Application powered by Twilio with EspoCRM integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Simple script to ensure localStorage functionality
            try {
              window.localStorage;
            } catch (e) {
              // Add a fake localStorage for environments that have it disabled
              window.localStorage = {
                _data: {},
                setItem: function(id, val) { this._data[id] = String(val); },
                getItem: function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : null; },
                removeItem: function(id) { delete this._data[id]; },
                clear: function() { this._data = {}; }
              };
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="min-h-screen bg-tech-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
