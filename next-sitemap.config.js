/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://judoclubmichigami.nl",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
  },
  exclude: ["/api/*", "/admin-login", "/signin", "/signup", "/wachtwoord-reset", "/admin/*", "/leden/*"],
  changefreq: "daily",
  priority: 1.0,
  alternateLinks: [
    {
      href: "https://judoclubmichigami.nl",
      hreflang: "nl-NL",
    },
  ],
};
