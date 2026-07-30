import type { Metadata } from "next";
import { VT323 } from "next/font/google";
import "./globals.css";

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt323",
});

export const metadata: Metadata = {
  title: "IMF OPS 7.1.00",
  description: "IMF Terminal Operations Dossier and Field Agent Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${vt323.variable} antialiased bg-black text-[#00ff00] selection:bg-[#00ff00] selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}