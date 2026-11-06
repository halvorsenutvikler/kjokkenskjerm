/* =====================================================================
   INNSTILLINGER – denne fila er laget for å kunne endres.
   Endre verdiene, lagre, og last opp fila på nytt til GitHub.
   Pass på å beholde kommaer, anførselstegn og klammer slik de står.
   ===================================================================== */

var INNSTILLINGER = {

  // Stedet værmeldingen hentes for
  sted: { navn: "Veitvet", lat: 59.945, lon: 10.847 },

  // Hvem som bruker hvilket kjøretøy ("sykkel" eller "vogn")
  kjoretoy: { mamma: "sykkel", pappa: "vogn" },

  // Faste hendelser som legges inn automatisk.
  // Hver uke:          { ukedag: 3, tekst: "..." }   (1 = mandag ... 7 = søndag)
  // Fast dato:         { dato: "12-01", tekst: "..." }   (måned-dag)
  // Siste søndag i en måned: { maaned: 3, sisteSondag: true, tekst: "..." }
  fasteHendelser: [
    { ukedag: 3, tekst: "Smør 2 matpakker" },
    { ukedag: 4, tekst: "Tur: 2 matpakker" },
    { ukedag: 7, tekst: "10: Åpen gymsal" },
    { maaned: 3, sisteSondag: true, tekst: "Test røyk + jordfeil" },
    { maaned: 10, sisteSondag: true, tekst: "Test røyk + jordfeil" },
    { dato: "12-01", tekst: "Batteri røykvarsler" },
    { dato: "04-01", tekst: "Bytt klær i bhg" },
    { dato: "10-01", tekst: "Bytt klær i bhg" },
    { dato: "04-30", tekst: "Frist skattemelding" }
  ],

  // Klær, basert på været mellom kl. 07 og 17
  klaer: {
    veldigKaldt: -10,   // under dette: ull og vinterdress
    kaldt: 0,           // under dette: lue og votter
    regnMm: 0.2         // mer nedbør enn dette (mm): regnjakke og støvler
  },

  // Fra dette klokkeslettet på søndag viser skjermen neste uke
  nesteUkeFraSondagKl: 16,

  // Fra dette klokkeslettet viser værboksen været for i morgen
  vaerIMorgenFraKl: 18,

  // Utfyllingsregler i søndagsskjemaet
  maksHendelser: 3,
  tegnPerFelt: 20,
  heiaropMaksOrd: 5,

  // Småjobber: over dette antallet (eller mer enn én stor) sier skjemaet fra
  smajobberAnbefalt: 6,

  /* ÅRSHJULET – forslag til småjobber i søndagsskjemaet.
     str: "10" (10 min), "30" (30 min) eller "stor"
     hver: "maaned" = hver måned, fra uke 1–4 i måneden (uke)
     maaneder: [1, 4, 7, 10] = bare i disse månedene (1 = januar)
     engang: true = prosjekt som foreslås til det er gjort én gang
     Et forslag vises fra riktig uke og fram til jobben er krysset av som gjort den måneden. */
  arshjul: [
    // Hver måned
    { tekst: "Vaske sluk", str: "10", hver: "maaned", uke: 1 },
    { tekst: "Avkalke kaffemaskin og vannkoker", str: "10", hver: "maaned", uke: 1 },
    { tekst: "Tørrvareskap: ingenting oppå", str: "10", hver: "maaned", uke: 1 },
    { tekst: "Rense vaskemaskinfilter", str: "10", hver: "maaned", uke: 2 },
    { tekst: "Rense oppvaskmaskinfilter", str: "10", hver: "maaned", uke: 2 },
    { tekst: "Rense kondensator i tørketrommel", str: "10", hver: "maaned", uke: 2 },
    { tekst: "Tørke av lister og dører", str: "30", hver: "maaned", uke: 3 },
    { tekst: "Vaske speil og glass", str: "10", hver: "maaned", uke: 3 },
    { tekst: "Stelle inneplanter", str: "10", hver: "maaned", uke: 3 },
    { tekst: "Rydde skap og skuffer", str: "30", hver: "maaned", uke: 4 },
    { tekst: "Sjekke matlager og fryser", str: "10", hver: "maaned", uke: 4 },

    // Hvert kvartal (uke 2 i januar, april, juli, oktober)
    { tekst: "Rense fettfilter i kjøkkenvifta", str: "10", maaneder: [1, 4, 7, 10], uke: 2 },
    { tekst: "Vaskemaskin tom på 90°", str: "10", maaneder: [1, 4, 7, 10], uke: 2 },
    { tekst: "Oppvaskmaskin med maskinrens", str: "10", maaneder: [1, 4, 7, 10], uke: 2 },
    { tekst: "Avkalke dusjhode og kraner", str: "10", maaneder: [1, 4, 7, 10], uke: 2 },
    { tekst: "Vaske søppelbøtter", str: "30", maaneder: [1, 4, 7, 10], uke: 2 },

    // Sesong og årlig
    { tekst: "Rense sluk og avløp grundig", str: "30", maaneder: [1] },
    { tekst: "Papir, økonomi og forsikring", str: "stor", maaneder: [1] },
    { tekst: "Sjekke førstehjelpsskrin", str: "10", maaneder: [1] },
    { tekst: "Rydde boden", str: "stor", maaneder: [2] },
    { tekst: "Avrime fryseren", str: "30", maaneder: [2] },
    { tekst: "Vaske bak komfyr og kjøleskap", str: "30", maaneder: [3] },
    { tekst: "Klær til salg eller gave", str: "30", maaneder: [3, 9] },
    { tekst: "Rense balkong og terrasse", str: "30", maaneder: [4] },
    { tekst: "Gjødsle planter", str: "10", maaneder: [4] },
    { tekst: "Bytte ventilasjonsfilter", str: "10", maaneder: [4, 10] },
    { tekst: "Se over fasade og tak", str: "10", maaneder: [4] },
    { tekst: "Sommerklær til barnet", str: "30", maaneder: [4] },
    { tekst: "Vaske vinduer", str: "stor", maaneder: [5] },
    { tekst: "Ta fram utemøbler", str: "30", maaneder: [5] },
    { tekst: "Vaske dyner og vintertekstiler", str: "30", maaneder: [5] },
    { tekst: "Vaske gardiner", str: "30", maaneder: [5] },
    { tekst: "Solkrem i barnehagesekken", str: "10", maaneder: [5] },
    { tekst: "Vaske utemøbler", str: "30", maaneder: [6] },
    { tekst: "Rense grillen", str: "30", maaneder: [6] },
    { tekst: "Sjekke utekraner og sluk ute", str: "10", maaneder: [6] },
    { tekst: "Sjekke fuger på badet", str: "10", maaneder: [6] },
    { tekst: "Beise eller male", str: "stor", maaneder: [7] },
    { tekst: "Dyprens av sofa og madrass", str: "stor", maaneder: [8] },
    { tekst: "Passer regntøy og støvler?", str: "10", maaneder: [8] },
    { tekst: "Vaske yttertøy", str: "30", maaneder: [9] },
    { tekst: "Passer vinterklærne til barnet?", str: "30", maaneder: [9] },
    { tekst: "Refleks på jakker og vogn", str: "10", maaneder: [9] },
    { tekst: "Sjekke oppvarming og varmepumpe", str: "30", maaneder: [9] },
    { tekst: "Tømme takrenner", str: "30", maaneder: [10] },
    { tekst: "Klargjøre ute for vinteren", str: "30", maaneder: [10] },
    { tekst: "Sjekke utebelysning", str: "10", maaneder: [10] },
    { tekst: "Smøre hengsler og låser", str: "10", maaneder: [10] },
    { tekst: "Gå over barnesikringen", str: "30", maaneder: [10] },
    { tekst: "Lys på sykkel og vogn", str: "10", maaneder: [11] },
    { tekst: "Rense ventiler på bad og kjøkken", str: "10", maaneder: [11] },
    { tekst: "Sikkerhetsventil på varmtvannstanken", str: "10", maaneder: [11] },
    { tekst: "Sjekke luftfuktigheten", str: "10", maaneder: [12] },
    { tekst: "Brodder klare til glatta", str: "10", maaneder: [12] },

    // Prosjekter (én gang)
    { tekst: "Rydde hjørneskapet (plastbokser)", str: "stor", engang: true },
    { tekst: "Faste soner i kjøleskapet", str: "30", engang: true },
    { tekst: "Skaffe læringstårn til kjøkkenet", str: "30", engang: true }
  ]
};
