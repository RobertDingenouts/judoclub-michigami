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
    location: {
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
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Tuesday"],
        opens: "19:00",
        closes: "21:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Thursday"],
        opens: "19:00",
        closes: "21:30",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "10:00",
        closes: "12:00",
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
