import Script from "next/script";

/**
 * JSON-LD structured data component for SEO.
 * Renders SportsOrganization schema with full club details, locations, and social profiles.
 */
export function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: "Judoclub Michigami Steenbergen",
    alternateName: ["Judoclub Michigami", "Michigami"],
    url: "https://judoclubmichigami.nl",
    logo: "https://judoclubmichigami.nl/logo.png",
    image: "https://judoclubmichigami.nl/logo.png",
    description:
      "Judo voor jong en oud, voor beginners en gevorderden - recreatief of prestatiegericht. Opgericht in 1993.",
    foundingDate: "1993",
    sport: "Judo",
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "Wipstraat 2",
        addressLocality: "Steenbergen",
        postalCode: "4651 XW",
        addressRegion: "Zeeland",
        addressCountry: "NL",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "Bou Kooijmanstraat 48",
        addressLocality: "Oud-Vossemeer",
        postalCode: "4698 AM",
        addressRegion: "Zeeland",
        addressCountry: "NL",
      },
    ],
    location: [
      {
        "@type": "SportsActivityLocation",
        name: "Sportcentrum De Knotwilg",
        description: "Hoofdlocatie judo trainingen Steenbergen",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Wipstraat 2",
          addressLocality: "Steenbergen",
          postalCode: "4651 XW",
          addressRegion: "Zeeland",
          addressCountry: "NL",
        },
        url: "https://maps.app.goo.gl/Wipstraat+2+Steenbergen",
      },
      {
        "@type": "SportsActivityLocation",
        name: "Dorpshuis De Vossenkuil",
        description: "Judo trainingen Oud-Vossemeer",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Bou Kooijmanstraat 48",
          addressLocality: "Oud-Vossemeer",
          postalCode: "4698 AM",
          addressRegion: "Zeeland",
          addressCountry: "NL",
        },
        url: "https://maps.google.com/?q=Dorpshuis+De+Vossenkuil+Oud-Vossemeer",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "judoclub_michigami@hotmail.com",
      contactType: "customer service",
      availableLanguage: "Dutch",
    },
    sameAs: [
      "https://www.facebook.com/judoclubmichigami",
      "https://www.youtube.com/channel/UC8tXSKppIMF6awS2cj7w50A",
      "https://www.instagram.com/judoclub_michigami",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Judo Trainingen",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Judo training volwassenen",
            description:
              "Recreatieve en prestatiegerichte judo training voor volwassenen.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Judo training kinderen",
            description:
              "Judo lessen voor jonge judoka's van verschillende leeftijden.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Judo examens en technieken",
            description:
              "Examenprogramma volgens KNJB richtlijnen met gedetailleerde techniekendatabase.",
          },
        },
      ],
    },
  };

  return (
    <Script
      id="jsonld-sports-organization"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
