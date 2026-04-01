import type { Metadata } from "next";

type Props = {
  params: { locale: string };
};

const localeMapping: Record<string, string> = {
  en: "en_US",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  pt: "pt_BR",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = params;
  const ogLocale = localeMapping[locale] || "en_US";
  
  return {
    title: "Make Message More Polite - Professional Tone Adjustment | Sentenly",
    description: "Transform direct or blunt messages into polite, professional communication. Adjust tone and formality while maintaining your core message.",
    keywords: [
      "make message polite",
      "polite message writer",
      "professional tone adjustment",
      "soften message tone",
      "diplomatic communication",
      "polite email writer",
      "improve message politeness",
      "make text more polite",
      "professional politeness tool",
      "courteous message rewriter"
    ],
    openGraph: {
      title: "Make Message More Polite - Professional Tone Adjustment | Sentenly",
      description: "Transform direct or blunt messages into polite, professional communication. Adjust tone and formality while maintaining your core message.",
      type: "website",
      locale: ogLocale,
      images: [
        {
          url: "/og-image-polite.png",
          width: 1200,
          height: 630,
          alt: "Make Message More Polite - Sentenly",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Make Message More Polite - Professional Tone Adjustment | Sentenly",
      description: "Transform direct or blunt messages into polite, professional communication. Adjust tone and formality while maintaining your core message.",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
