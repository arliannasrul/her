import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "For Amelia — Happy Birthday Bae ❤️",
  description: "A little world crafted just for Amelia, full of stories, memories, and love.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("dark h-full", playfair.variable, dmSans.variable, geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-[#0d0a0e] text-[#f5e6ea] antialiased">
        {children}
      </body>
    </html>
  );
}
