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

  // Faste hendelser som legges inn automatisk hver uke.
  // ukedag: 1 = mandag, 2 = tirsdag ... 7 = søndag
  fasteHendelser: [
    { ukedag: 3, tekst: "Smør 2 matpakker" },
    { ukedag: 4, tekst: "Tur: 2 matpakker" },
    { ukedag: 7, tekst: "10: Åpen gymsal" }
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
  heiaropMaksOrd: 5
};
