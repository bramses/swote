import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swote - Quote Collector",
  description: "Collect and save your favorite book quotes",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
