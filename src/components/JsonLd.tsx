// Structured data (JSON-LD) for SEO - SportsOrganization schema
// https://schema.org/SportsOrganization

export function JsonLd() {
  // Build schema as JSON string to avoid @key parsing issues in object literals
  const schema = JSON.stringify({
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
    sports: ["Judo"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Wipstraat 2",
      addressLocality: "Steenbergen",
      postalCode: "4651 XW",
      addressRegion: "Noord-Brabant",
      addressCountry: "NL",
    },
    location: [
      {
        "@type": "Place",
        name: "Sportcentrum De Knotwilg",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Wipstraat 2",
          addressLocality: "Steenbergen",
          postalCode: "4651 XW",
          addressRegion: "Noord-Brabant",
          addressCountry: "NL",
        },
      },
      {
        "@type": "Place",
        name: "De Vossenkuil",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Oud-Vossemeer",
          addressRegion: "Noord-Brabant",
          addressCountry: "NL",
        },
      },
    ],
    areaServed: [
      { "@type": "City", name: "Steenbergen" },
      { "@type": "City", name: "Oud-Vossemeer" },
      { "@type": "City", name: "Nieuw-Vossemeer" },
      { "@type": "City", name: "De Heen" },
      { "@type": "City", name: "Kruisland" },
      { "@type": "City", name: "Dinteloord" },
      { "@type": "City", name: "Sint-Philipsland" },
      { "@type": "City", name: "Oud-Gastel" },
      { "@type": "City", name: "Halsteren" },
      { "@type": "City", name: "Tholen" },
      { "@type": "City", name: "Bergen op Zoom" },
      { "@type": "City", name: "Wouw" },
      { "@type": "City", name: "Roosendaal" },
    ],
    // Lestijden volgens src/data/schedule.ts (autoriait)
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Wednesday"],
        opens: "19:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Friday"],
        opens: "18:45",
        closes: "20:45",
      },
    ],
    sameAs: [
      "https://www.facebook.com/judoclubmichigami",
      "https://www.instagram.com/judoclub_michigami/",
      "https://www.youtube.com/@JudoMichigami",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      email: "judoclub_michigami@hotmail.com",
      telephone: "+31648649912",
      contactType: "customer service",
      availableLanguage: "Dutch",
    },
  });

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schema }}
    />
  );
}
