import Head from "next/head";
import Script from "next/script";
import "../src/index.css";

const HOME_DESCRIPTION =
  "The Veritas is a fearless voice for truth and justice. In an age of misinformation, we practice unbiased, fact-checked, and responsible journalism. We uncover hidden realities, amplify marginalized voices, and hold power to account going beyond headlines to report stories that truly impact society. The Veritas is not just a media house; it is a movement where truth speaks and justice prevails.";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: "The Veritas",
  url: "https://www.theveritas.in/",
  logo: "https://www.theveritas.in/LOGO.jpeg",
  description: HOME_DESCRIPTION,
  email: "theveritasbusiness@gmail.com",
  sameAs: ["https://www.instagram.com/thedailyveritas/"]
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "The Veritas",
  alternateName: "The Veritas",
  url: "https://www.theveritas.in/",
  description: HOME_DESCRIPTION,
  publisher: {
    "@type": "Organization",
    name: "The Veritas"
  }
};

export default function VeritasApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="google-adsense-account" content="ca-pub-9106312967186703" />
        <meta name="application-name" content="The Veritas" />
        <meta itemProp="name" content="The Veritas" />
        <meta property="og:site_name" content="The Veritas" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.theveritas.in/LOGO.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://www.theveritas.in/LOGO.jpeg" />
        <meta name="twitter:site" content="@thedailyveritas" />
        <link rel="icon" href="/LOGO.jpeg?v=2" />
        <link rel="shortcut icon" href="/LOGO.jpeg?v=2" />
        <link rel="apple-touch-icon" href="/LOGO.jpeg?v=2" />
        
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && (
          <meta
            name="google-site-verification"
            content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
          />
        )}
        {process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION && (
          <meta
            name="msvalidate.01"
            content={process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION}
          />
        )}
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
          integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU"
          crossOrigin="anonymous"
        />
      </Head>

      {/* Scripts are fine using afterInteractive */}
      <Script
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9106312967186703"
        crossOrigin="anonymous"
      />
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-CGB4JKXZ8J"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-CGB4JKXZ8J');
        `}
      </Script>

      <Component {...pageProps} />
    </>
  );
}
