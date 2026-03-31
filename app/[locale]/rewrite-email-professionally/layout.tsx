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
    title: "Rewrite Email Professionally in Seconds | Sentenly",
    description: "Emails written quickly can sound unclear, abrupt, or unprofessional. Turn any message into clear, structured, professional communication — without changing your intent.",
    keywords: [
      "rewrite email professionally",
      "professional email writer",
      "email tone improvement",
      "business email rewriter",
      "professional communication tool",
      "email formality checker",
      "improve email tone",
      "professional email assistant",
      "email rewriting tool",
      "make email professional"
    ],
    openGraph: {
      title: "Rewrite Email Professionally in Seconds | Sentenly",
      description: "Emails written quickly can sound unclear, abrupt, or unprofessional. Turn any message into clear, structured, professional communication — without changing your intent.",
      type: "website",
      locale: ogLocale,
      images: [
        {
          url: "/og-image-rewrite-email.png",
          width: 1200,
          height: 630,
          alt: "Rewrite Email Professionally - Sentenly",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Rewrite Email Professionally in Seconds | Sentenly",
      description: "Emails written quickly can sound unclear, abrupt, or unprofessional. Turn any message into clear, structured, professional communication.",
      images: ["/og-image-rewrite-email.png"],
    },
    alternates: {
      canonical: `/${locale}/rewrite-email-professionally`,
      languages: {
        en: "/en/rewrite-email-professionally",
        de: "/de/rewrite-email-professionally",
        es: "/es/rewrite-email-professionally",
        fr: "/fr/rewrite-email-professionally",
        it: "/it/rewrite-email-professionally",
        pt: "/pt/rewrite-email-professionally",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function RewriteEmailProfessionallyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
