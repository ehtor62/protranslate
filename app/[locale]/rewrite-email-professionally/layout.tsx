import type { Metadata } from "next";

export const metadata: Metadata = {
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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rewrite Email Professionally in Seconds | Sentenly",
    description: "Emails written quickly can sound unclear, abrupt, or unprofessional. Turn any message into clear, structured, professional communication.",
  },
  alternates: {
    canonical: "/en/rewrite-email-professionally",
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

export default function RewriteEmailProfessionallyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
