import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { notFound } from 'next/navigation';
import { routing } from '../../i18n.routing';
import "./globals.css";
import LocaleProviders from './LocaleProviders';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProTranslate - AI Translation Tool",
  description: "Professional message translation with context awareness",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}



export default async function RootLayout(
  props: { children: React.ReactNode; params: { locale: string } } | { children: React.ReactNode; params: Promise<{ locale: string }> }
) {
  let params: { locale: string };
  if (props.params instanceof Promise) {
    params = await props.params;
  } else {
    params = props.params;
  }
  const { children } = props;
  const { locale } = params;

  // Validate locale
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  return (
    <LocaleProviders>
      {children}
    </LocaleProviders>
  );
}
