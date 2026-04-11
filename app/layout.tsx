import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nyaya.ai — Legal OS",
  description: "AI-powered practice management for Indian advocates.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased bg-[#f4f3ef]`}>
        {children}
      </body>
    </html>
  );
}