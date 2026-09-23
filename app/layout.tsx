import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "Smart Tech Store | Appliances, Electronics, Solar & Computing Kenya",
    template: "%s | Smart Tech Store",
  },

  description:
    "Shop home appliances, smart electronics and gadgets, solar and backup power, computing and office products at Smart Tech Store in Kenya. Countrywide delivery available.",

  applicationName: "Smart Tech Store",

  keywords: [
    "Smart Tech Store",
    "Smart Tech Kenya",
    "electronics Kenya",
    "home appliances Kenya",
    "smart electronics Kenya",
    "gadgets Kenya",
    "solar systems Kenya",
    "solar products Kenya",
    "backup power Kenya",
    "laptops Kenya",
    "computers Kenya",
    "office electronics Kenya",
    "online electronics store Kenya",
  ],

  authors: [
    {
      name: "Smart Tech Store",
    },
  ],

  creator: "Smart Tech Store",

  publisher: "Smart Tech Store",

  category: "shopping",

  openGraph: {
    type: "website",
    locale: "en_KE",

    siteName: "Smart Tech Store",

    title:
      "Smart Tech Store | Appliances, Electronics, Solar & Computing Kenya",

    description:
      "Shop home appliances, smart electronics and gadgets, solar and backup power, computing and office products at Smart Tech Store in Kenya.",

    images: [
      {
        url: "/images/logo/smart-tech-logo.jpg",
        width: 1200,
        height: 630,
        alt: "Smart Tech Store Kenya",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Smart Tech Store | Appliances, Electronics, Solar & Computing Kenya",

    description:
      "Shop appliances, electronics, solar and backup power, computing and office products from Smart Tech Store in Kenya.",

    images: [
      "/images/logo/smart-tech-logo.jpg",
    ],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en-KE"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}