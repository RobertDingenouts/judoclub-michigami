/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://judoclubmichigami.nl",
  generateRobotsTxt: false, // We use a manual robots.txt in public/ with sitemap reference
  exclude: ["/api/*"],
  changefreq: "daily",
  priority: 1.0,
  alternateLinks: [
    {
      href: "https://judoclubmichigami.nl",
      hreflang: "nl-NL",
    },
  ],
};
