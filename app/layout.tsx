import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./components/AuthProvider";
import { LanguageProvider } from "./components/LanguageProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MobileMenu from "./components/MobileMenu";
import BugReporter from "./components/BugReporter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GuruDome",
  description: "Verify social media gurus. Real reviews. Real data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark w-full overflow-x-hidden" style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col w-full`}
      >
        <LanguageProvider>
          <AuthProvider>
            <Header />
            {children}
            <Footer />
            <div className="h-24 md:hidden" aria-hidden="true" />
            <MobileMenu />
            <BugReporter />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
