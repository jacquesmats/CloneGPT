import { Inter } from "next/font/google";
import Providers from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ChatGPT Clone",
  description: "A ChatGPT-like interface built with Next.js and MUI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
