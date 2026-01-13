import type { Metadata } from "next";
import {
  Playfair_Display,
  Merriweather,
  Lora,
  Crimson_Text,
  Libre_Baskerville,
  EB_Garamond,
  Cormorant_Garamond,
  Spectral,
  Source_Serif_4,
  Bitter,
} from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const merriweather = Merriweather({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-merriweather" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const crimson = Crimson_Text({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-crimson" });
const libreBaskerville = Libre_Baskerville({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-libre-baskerville" });
const ebGaramond = EB_Garamond({ subsets: ["latin"], variable: "--font-eb-garamond" });
const cormorant = Cormorant_Garamond({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-cormorant" });
const spectral = Spectral({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--font-spectral" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
const bitter = Bitter({ subsets: ["latin"], variable: "--font-bitter" });

const fontVariables = [
  playfair.variable,
  merriweather.variable,
  lora.variable,
  crimson.variable,
  libreBaskerville.variable,
  ebGaramond.variable,
  cormorant.variable,
  spectral.variable,
  sourceSerif.variable,
  bitter.variable,
].join(" ");

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
      <body className={`antialiased ${fontVariables}`}>
        {children}
      </body>
    </html>
  );
}
