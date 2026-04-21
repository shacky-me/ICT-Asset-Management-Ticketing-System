import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "State Department for Justice, Human Rights and Constitutional Affairs - ICT Asset Management and Tracking System",
  description:
    "A web-based application designed to streamline the management and tracking of ICT assets within the State Department for Justice, Human Rights and Constitutional Affairs.",
  authors: [
    {
      name: "ICT SDJHRCA Team",
    },
  ],
  keywords: [
    "ICT Asset Management",
    "Asset Tracking System",
    "State Department for Justice",
    "Human Rights",
    "Constitutional Affairs",
    "Web Application",
    "Asset Inventory",
    "Asset Lifecycle Management",
    "Ticketing System",
    "Maintenance Scheduling",
    "Reporting and Analytics",
    "Profile Management",
  ],
  applicationName: "ICT Asset Management and Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
