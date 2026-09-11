import type { Metadata } from "next";
import { Bricolage_Grotesque, Google_Sans_Code } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  weight: "variable",
  subsets: ["latin"],
});

const googleSansCode = Google_Sans_Code({
  variable: "--font-google-sans-code",
  weight: "variable",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ethnoglott — Ethnic groups of the world",
  description: "Saving the world's ethnic languages before they're lost",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${googleSansCode.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col p-6 lg:h-dvh lg:overflow-hidden">
        {children}
      </body>
    </html>
  );
}
