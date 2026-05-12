import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cuts & Co. | Premium Barbershop",
  description: "Experience the art of grooming at Cuts & Co. Premium Barbershop. Classic cuts, modern style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#0d0d0d] text-white">{children}</body>
    </html>
  );
}