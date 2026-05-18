'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { type Section } from '@/components/nav-config';
import { clubInfo } from '@/data/club-info';
import { openProeflesForm } from '@/lib/form-events';
import { SignupConfirmationModal } from '@/components/SignupConfirmationModal';

export function InfoSection({ onNavigate }: { onNavigate?: (s: Section) => void }) {
  const [signupOpen, setSignupOpen] = useState(false);
  const [tabValue, setTabValue] = useState('history');
  const tabOrder = ['history', 'leiding', 'judo', 'benefits', 'lesson', 'belts'];
  
  const navigateTab = (direction: 'prev' | 'next') => {
    const idx = tabOrder.indexOf(tabValue);
    const newIdx = direction === 'next' 
      ? (idx + 1) % tabOrder.length 
      : (idx - 1 + tabOrder.length) % tabOrder.length;
    setTabValue(tabOrder[newIdx]);
  };
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-0 shadow-sm sm:shadow-lg">
        <div className="relative bg-gradient-to-br from-[#a90000] via-[#8c0000] to-[#7a0000] text-white p-4 sm:p-6 md:p-10 overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{clubInfo.fullName}</h1>
            <p className="text-white/80 mt-2 text-sm sm:text-base">{clubInfo.tagline}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#f5f5f0]">
          <TabsTrigger value="history" className="text-xs sm:text-sm">Geschiedenis</TabsTrigger>
          <TabsTrigger value="leiding" className="text-xs sm:text-sm">Leiding</TabsTrigger>
          <TabsTrigger value="judo" className="text-xs sm:text-sm">Wat is Judo?</TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs sm:text-sm">Voordelen</TabsTrigger>
          <TabsTrigger value="lesson" className="text-xs sm:text-sm">Lessen</TabsTrigger>
          <TabsTrigger value="belts" className="text-xs sm:text-sm">Banden</TabsTrigger>
        </TabsList>

    <TabsContent value="history" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fdf6f6] flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-5 h-5 text-[#c00000]" />
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 mb-2">Onze geschiedenis</h3>
                  {clubInfo.history.split('\n\n').map((paragraph, i) => {
                    const headerMatch = paragraph.match(/^##\s+(.+)$/);
                    if (headerMatch) {
                      return (
                        <h4 key={i} className="font-bold text-base text-gray-800 mt-6 mb-2 first:mt-0">{headerMatch[1]}</h4>
                      );
                    }
                    return (
                      <p key={i} className="text-sm text-gray-600 leading-relaxed">{paragraph}</p>
                    );
                  })}
                </div>
              </div>

              {/* Timeline button */}
              {onNavigate && (
                <Button
                  onClick={() => onNavigate('timeline')}
                  variant="outline"
                  className="w-full sm:w-auto border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6] gap-2"
                >
                  Bekijk onze tijdlijn <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== LEIDING TAB ==================== */}
        <TabsContent value="leiding" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#c00000]" /> Huidige leiding
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sinds 2021 zorgt een nieuwe generatie voor de toekomst van Judoclub Michigami. 
                Drie vrienden die al bijna vanaf de oprichting samen judo oefenen, regionale en internationale wedstrijden doen, 
                en alle drie de zwarte band (3e dan) hebben behaald.
              </p>
              <div className="space-y-3">
                {clubInfo.leadership.current.map((person) => (
                  <div key={person.name} className="p-4 rounded-xl bg-[#fdf6f6] border border-[#fce0e0]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a90000] to-[#c00000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800">{person.name}</h4>
                        <p className="text-xs font-medium text-[#c00000] mt-0.5">{person.dan} • {person.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#c00000]" /> Oprichter & Erfenis
              </h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#fdf6f6] to-white border border-[#fce0e0]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8c0000] to-[#a90000] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                    KV
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800">{clubInfo.leadership.founder.name}</h4>
                    <p className="text-xs font-medium text-[#c00000] mt-0.5">{clubInfo.leadership.founder.dan} • {clubInfo.leadership.founder.role}</p>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{clubInfo.leadership.founder.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== WAT IS JUDO TAB ==================== */}
        <TabsContent value="judo" className="space-y-4 mt-4">
          {/* Hero foto */}
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#fce0e0]">
            <img 
              src="/hero/dojo-2024.jpg" 
              alt="Judoclub Michigami dojo" 
              className="w-full h-48 sm:h-64 md:h-80 object-cover"
            />
            <div className="bg-gradient-to-r from-[#a90000] to-[#8c0000] p-4 sm:p-6 text-white">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">🥋 Welkom bij Judoclub Michigami!</h3>
              <p className="text-white/90 text-sm sm:text-base">Judo voor jong en oud — van kleuters tot volwassenen, recreatief of competitief.</p>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800 text-lg">Wat is judo?</h3>
              {clubInfo.whatIsJudo.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('## ')) {
                  return <h4 key={i} className="font-bold text-base text-[#c00000] mt-6 mb-2 first:mt-0">{paragraph.replace('## ', '')}</h4>;
                }
                return <p key={i} className="text-sm text-gray-600 leading-relaxed">{paragraph}</p>;
              })}
            </CardContent>
          </Card>

          {/* Foto grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl overflow-hidden shadow-md border border-[#fce0e0]">
              <img 
                src="/hero/budodag-actie-1.jpg" 
                alt="Budodag Michigami" 
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="bg-[#fdf6f6] p-3">
                <p className="text-xs text-gray-600 text-center font-medium">🎉 Budodag activiteiten</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md border border-[#fce0e0]">
              <img 
                src="/hero/heerle-toernooi-1.jpg" 
                alt="Toernooi Michigami" 
                className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="bg-[#fdf6f6] p-3">
                <p className="text-xs text-gray-600 text-center font-medium">🏆 Toernooien</p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Voor wie is judo geschikt?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{clubInfo.philosophy}</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== VOORDELEN TAB ==================== */}
        <TabsContent value="benefits" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Voordelen van Judo voor Je Leven</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo is meer dan sport — het is een complete ontwikkeling van lichaam, geest en karakter.
                Hier zijn de belangrijkste voordelen die judo biedt:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: 'Motorische Ontwikkeling', desc: 'Judo ontwikkelt de volledige motoriek door kruisbewegingen die linkse en rechtse hersenhelften verbinden. Verbeterd evenwicht, snelheid en vaak twee-handigheid.' },
                  { title: 'Valbeheersing', desc: 'Judo leert je vallen en opstaan als getrainde reflex. Dit vermindert het blessurerisico aanzienlijk, zowel binnen als buiten de dojo.' },
                  { title: 'Complete Conditioning', desc: 'Alle energiestromen worden tegelijk betrokken: uithoudingsvermogen én explosieve kracht. Een unieke combinatie die weinig andere sporten bieden.' },
                  { title: 'Kernsterkte & Functie', desc: 'Continue lichaamsgewicht-training bouwt een sterke core op, vermindert rugklachten en ontwikkelt functionele kracht zonder externe gewichten.' },
                  { title: 'Zelfvertrouwen & Weerbaarheid', desc: 'Regelmatig contactsparring vermindert angst voor aanraking en vallen. Judoka\'s weten hoe ze veilig kunnen vallen en herstellen zonder pijn.' },
                  { title: 'Samenwerking & Respect', desc: 'Judo is een duosport die teamwerk en samenwerking bevordert. De groepsdynamiek in de dojo versterkt collectief leren boven individuele competitie.' },
                  { title: 'Zoeken naar Balans', desc: 'Het kernprincipe: maximaliseer efficiëntie met minimaal inspanning om een tegenstander uit balans te brengen. Van toepassing op zowel techniek als levensfilosofie.' },
                  { title: 'Doorzettingsvermogen', desc: 'Het traject naar een zwarte band vereist jarenlange toewijding. Dit signaleert discipline en doorzettingsvermogen — waardevol op je CV en in het dagelijks leven.' },
                ].map((benefit) => (
                  <div key={benefit.title} className="p-3 rounded-xl bg-[#fdf6f6] border border-[#fce0e0]">
                    <h4 className="font-semibold text-sm text-[#c00000] mb-1">{benefit.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Meer dan alleen sport</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo belichaamt een "Positieve Levenswijze" met overdraagbare levenswaarden.
                Normen en waarden die je leert in de dojo, pas je direct toe in je dagelijks leven.
                Het zoeken naar balans — maximaliseer efficiëntie met minimale inspanning — is een filosofie
                die je helpt in werk, relaties, en persoonlijke groei.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Levensvaardigheden</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judoka's leren doorzettingsvermogen, discipline, emotionele regulatie, en continue groei.
                Of je nu een nieuwe worp meester wordt of door vermoeidheid heen werkt — elke kleine overwinning
                bouwt aan je zelfvertrouwen. Het pad van de witte band naar zwart leer je: falen is geen eindpunt,
                maar een stap in het leerproces.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lesson" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Hoe gaat zo'n judoles?</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{clubInfo.lessonStructure}</p>
              <div className="bg-[#fdf6f6] rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-sm text-[#c00000]">Tip voor proeflessen</h4>
                <p className="text-xs text-gray-600">Kom je voor het eerst? Trek dan een joggingpak of trainingspak aan zonder scherpe delen (gespen, knopen). Een judopak is de eerste maand niet verplicht!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Judokleding (judogi)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo wordt beoefend in speciale kleding. Deze judopakken of judogi zijn gemaakt om aan te kunnen trekken. 
                Let op: koop geen karatepak, daar deze niet bestand zijn tegen het trek en duwwerk van de judosport!
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Judo wordt beoefend op de blote voeten. Zorg daarom voor schone voeten en kortgeknipte nagels.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="belts" className="space-y-4 mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <h3 className="font-bold text-gray-800">Judobanden</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Aan de hand van de kleur band die een judoka draagt, kun je zien hoe ver gevorderd hij/zij is. 
                Als beginneling start je met een witte band. De volgorde van banden is:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { color: 'bg-white border-gray-300', name: 'Wit' },
                  { color: 'bg-yellow-400', name: 'Geel' },
                  { color: 'bg-orange-500', name: 'Oranje' },
                  { color: 'bg-green-600', name: 'Groen' },
                  { color: 'bg-blue-700', name: 'Blauw' },
                  { color: 'bg-amber-800', name: 'Bruin' },
                  { color: 'bg-gray-900', name: 'Zwart' },
                ].map((belt) => (
                  <div key={belt.name} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-100 shadow-sm">
                    <div className={`w-6 h-6 rounded-full ${belt.color} border`} />
                    <span className="text-xs font-medium text-gray-700">{belt.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Dit zijn de zogenaamde kyu-graden. Om een andere band te verkrijgen moet je examen doen. 
                Ben je nog geen 13, dan zijn er tevens slippen te verdienen — stukken gekleurde band die je kunt verdienen door goed je best te doen tijdens de lessen.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Zwarte band (Dan-graden)</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Na de gekleurde banden van de kyu-graden komt de zwarte band. Om hiervoor examen te mogen doen, moet je minimaal 16 jaar zijn. 
                Je moet dan voor een judocommissie verschijnen van hele hoge judoka's. Zwarte banden noemen ze Dan-graden.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-6 space-y-3">
              <h3 className="font-bold text-gray-800">Judo wedstrijden</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Hoewel de meeste judoka's judoën om lekker bezig te zijn, zijn er ook jongens en meisjes die graag meedoen aan wedstrijden. 
                Tijdens deze wedstrijden kun je medailles of bekers winnen. Voor de echte fanatieke judoka's is het zelfs mogelijk om aan internationale wedstrijden deel te nemen.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Previous / Next Navigation — within Info tabs */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={() => navigateTab('prev')}
          variant="outline"
          className="border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6] gap-2 text-sm flex-1"
        >
          <ChevronLeft className="w-4 h-4" /> Vorige
        </Button>
        <Button
          onClick={() => navigateTab('next')}
          variant="outline"
          className="border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6] gap-2 text-sm flex-1"
        >
          Volgende <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Contact CTA */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-[#fdf6f6] to-white">
        <CardContent className="p-4 sm:p-6 text-center space-y-3">
          <h3 className="font-bold text-gray-800">Interesse in judo?</h3>
          <p className="text-sm text-gray-600 max-w-lg mx-auto">
            Kom gerust eens kijken op een training - je bent van harte welkom!
            Als het je bevalt, kun je direct starten met <span className="font-semibold text-[#c00000]">{clubInfo.costs.proeflessen}</span>.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            <Button onClick={() => openProeflesForm()} className="bg-[#27ae60] hover:bg-[#219a52] text-white text-base px-8 font-bold shadow-md" style={{ fontSize: '1rem' }}>
              Gratis Proefles
            </Button>
            <Button variant="outline" onClick={() => setSignupOpen(true)} className="text-sm border-[#c00000] text-[#c00000] hover:bg-[#fdf6f6]">
              Inschrijven
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signup Confirmation Modal */}
      <SignupConfirmationModal open={signupOpen} onClose={() => setSignupOpen(false)} signupUrl="https://forms.office.com/r/8Vw9kPcLT6" />
    </div>
  );
}
