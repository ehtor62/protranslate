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
    title: "Follow-Up Email After No Response - Professional Templates | Sentenly",
    description: "Write polite follow-up emails when you haven't received a response. Transform frustrated messages into professional, courteous reminders that get results.",
    keywords: [
      "follow-up email no response",
      "polite follow-up email",
      "email reminder template",
      "professional follow-up",
      "no reply email follow-up",
      "follow-up email generator",
      "gentle reminder email",
      "follow-up email examples",
      "how to write follow-up email",
      "professional email reminder"
    ],
    openGraph: {
      title: "Follow-Up Email After No Response - Professional Templates | Sentenly",
      description: "Write polite follow-up emails when you haven't received a response. Transform frustrated messages into professional, courteous reminders that get results.",
      type: "website",
      locale: ogLocale,
      images: [
        {
          url: "/og-image-followup.png",
          width: 1200,
          height: 630,
          alt: "Follow-Up Email After No Response - Sentenly",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Follow-Up Email After No Response - Professional Templates | Sentenly",
      description: "Write polite follow-up emails when you haven't received a response. Transform frustrated messages into professional, courteous reminders that get results.",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
