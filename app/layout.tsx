import "./globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nana",
  description: "simple auth app",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="m-auto max-w-[90%]">
        {children}
      </body>
    </html>
  );
}
