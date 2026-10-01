// Server-rendered SEO-footer: zorgt dat Google crawlbare, lokale content ziet
// (de rest van de site is client-renderd en dus grotendeels onzichtbaar in de HTML).
// Inhoud spiegelt src/data/schedule.ts (autoriait) en references/michigami-facts.md.

export function SeoFooter() {
  return (
    <footer
      id="judo-steenbergen"
      className="md:ml-64 border-t border-[#2a2a2a]/10 bg-[#f5f5f0] text-[#2a2a2a] px-6 py-10 text-sm leading-relaxed"
    >
      <div className="max-w-3xl space-y-4">
        <h2 className="text-lg font-semibold">
          Judoclub Michigami — judo in Steenbergen en Oud-Vossemeer
        </h2>
        <p>
          Judoclub Michigami is een judovereniging in de gemeente Steenbergen,
          opgericht in 1993. Wij geven judoles voor kinderen vanaf 6 jaar,
          jongeren en volwassenen — van beginner tot gevorderde, recreatief en
          prestatiegericht. Judles in Steenbergen en Oud-Vossemeer, voor iedereen
          uit Steenbergen, De Vossemeer, Halsteren, Tholen, Bergen op Zoom,
          Wouw en omstreken.
        </p>

        <h3 className="font-semibold">Trainingstijden</h3>
        <p>
          <strong>Woensdag 19:00 - 20:00</strong> — algemene training voor alle
          leeftijden in De Vossenkuil, Oud-Vossemeer.
          <br />
          <strong>Vrijdag 18:45 - 19:45</strong> — 1e groep (6 t/m 9 jaar) in
          Sportcentrum De Knotwilg, Wipstraat 2, Steenbergen.
          <br />
          <strong>Vrijdag 19:45 - 20:45</strong> — 2e groep (9 jaar en ouder) in
          Sportcentrum De Knotwilg, Steenbergen.
        </p>

        <h3 className="font-semibold">Proefles judo</h3>
        <p>
          Nieuwsgierig? Iedereen mag 3 gratis proeflessen judo volgen, zonder
          verplichtingen. Kom langs op een trainingsavond of meld je aan via het
          proeflesformulier op deze website. Judo is een veilige vechtsport en
          zelfverdedigingssport die balans, discipline en zelfvertrouwen
          ontwikkelt — geschikt voor jong en oud.
        </p>

        <h3 className="font-semibold">Contributie</h3>
        <p>
          €42 per kwartaal (€168 per jaar), eenmalige inschrijfkosten €15 en
          €15 verzekering per jaar. Lid worden? Schrijf je in via
          judoclubmichigami.nl/inschrijven.
        </p>

        <p className="text-xs opacity-70">
          Judoclub Michigami Steenbergen · Sportcentrum De Knotwilg, Wipstraat
          2, 4651 XW Steenbergen · De Vossenkuil, Oud-Vossemeer ·{" "}
          judoclub_michigami@hotmail.com
        </p>
      </div>
    </footer>
  );
}
