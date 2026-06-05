'use client'

import Script from 'next/script'

export default function UtmifyPixel() {
  return (
    <Script
      id="utmify-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          window.pixelId = "6a221f834a12cde06d80fa97";
          var a = document.createElement("script");
          a.setAttribute("async", "");
          a.setAttribute("defer", "");
          a.setAttribute("src", "https://cdn.utmify.com.br/scripts/pixel/pixel.js");
          document.head.appendChild(a);
        `,
      }}
    />
  )
}
