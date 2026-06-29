import type {Metadata} from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fantasy Map Generator",
  description: "Next.js launcher for Azgaar's Fantasy Map Generator"
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
