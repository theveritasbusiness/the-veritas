import Head from "next/head";
import Script from "next/script";
import "../src/index.css";

export default function VeritasApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-9106312967186703"
        />
        <meta
          name="description"
          content="The Veritas covers breaking news, geopolitics, India, politics, legal affairs, entertainment, sports, and live desk tracking."
        />
        <meta property="og:site_name" content="The Veritas" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="The Veritas" />
        <meta
          property="og:description"
          content="The Veritas covers breaking news, geopolitics, India, politics, legal affairs, entertainment, sports, and live desk tracking."
        />
        <meta property="og:url" content="https://www.theveritas.in/" />
        <meta property="og:image" content="https://www.theveritas.in/LOGO.jpeg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="The Veritas" />
        <meta
          name="twitter:description"
          content="The Veritas covers breaking news, geopolitics, India, politics, legal affairs, entertainment, sports, and live desk tracking."
        />
        <meta name="twitter:image" content="https://www.theveritas.in/LOGO.jpeg" />
        <link rel="icon" href="/LOGO.jpeg?v=2" />
        <link rel="shortcut icon" href="/LOGO.jpeg?v=2" />
        <link rel="apple-touch-icon" href="/LOGO.jpeg?v=2" />
        <link
          rel="stylesheet"
          href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
          integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU"
          crossOrigin="anonymous"
        />
      </Head>

      <Script
        async
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9106312967186703"
        crossOrigin="anonymous"
      />
      <Script
        async
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
