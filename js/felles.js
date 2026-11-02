/* Felles hjelpere for skjermen og søndagsskjemaet: datoer, lagring, faste
   hendelser og ikoner. Lagring skjer bare i nettleseren på denne enheten. */

var KS = (function () {
  "use strict";

  var NOKKEL = "kjokkenskjerm.data";
  var DAGNAVN = ["mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag", "søndag"];
  var MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
  var MND_KORT = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

  /* ---------- Tid (støtter ?dato=2026-10-30T07:42 for testing) ---------- */
  var param = {};
  location.search.replace(/[?&]([^=&]+)=?([^&]*)/g, function (m, k, v) { param[k] = decodeURIComponent(v || "1"); });
  var forskyvning = 0;
  if (param.dato) {
    var m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(param.dato);
    if (m) forskyvning = new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 8), +(m[5] || 0)).getTime() - Date.now();
  }
  function naa() { return new Date(Date.now() + forskyvning); }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function fraIso(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function leggTil(d, dager) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + dager); }
  function ukedagIndeks(d) { return (d.getDay() + 6) % 7; } // 0 = mandag
  function mandag(d) { return leggTil(d, -ukedagIndeks(d)); }
  function ukenummer(d) {
    var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dag = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - dag);
    var aar1 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - aar1) / 86400000 + 1) / 7);
  }

  /* ---------- Lagring ---------- */
  function les() {
    try {
      var r = JSON.parse(localStorage.getItem(NOKKEL) || "null");
      if (r && r.dager) return r;
    } catch (e) { /* tom eller ødelagt – start på nytt */ }
    return { versjon: 1, dager: {}, heiarop: {} };
  }
  function skriv(data) {
    try { localStorage.setItem(NOKKEL, JSON.stringify(data)); return true; }
    catch (e) { return false; }
  }

  function erHelg(d) { return ukedagIndeks(d) >= 5; }

  function dag(data, d) {
    var lagret = data.dager[iso(d)] || {};
    return {
      lever: lagret.lever || (erHelg(d) ? "ingen" : ""),
      hent: lagret.hent || (erHelg(d) ? "ingen" : ""),
      middag: lagret.middag || "",
      hendelser: (lagret.hendelser || []).filter(function (h) { return h && h.trim(); })
    };
  }

  function faste(d) {
    var nr = ukedagIndeks(d) + 1, ut = [];
    (INNSTILLINGER.fasteHendelser || []).forEach(function (f) { if (f.ukedag === nr) ut.push(f.tekst); });
    return ut;
  }

  // Egne + faste hendelser. De med klokkeslett ("18: ...") sorteres først, etter tid.
  function alleHendelser(data, d) {
    var liste = faste(d).concat(dag(data, d).hendelser);
    var tid = function (t) { var m = /^\s*(\d{1,2})(?:[:.](\d{2}))?\s*:/.exec(t); return m ? (+m[1]) * 60 + (+(m[2] || 0)) : null; };
    return liste.map(function (t, i) { return { t: t, tid: tid(t), i: i }; })
      .sort(function (a, b) {
        if (a.tid !== null && b.tid !== null) return a.tid - b.tid;
        if (a.tid !== null) return -1;
        if (b.tid !== null) return 1;
        return a.i - b.i;
      })
      .map(function (x) { return x.t; });
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  /* ---------- Ikoner (håndtegnet stil, inline SVG) ---------- */
  function svg(w, h, vb, innhold, etikett) {
    return '<svg width="' + w + '" height="' + h + '" viewBox="' + vb + '"' +
      (etikett ? ' role="img" aria-label="' + esc(etikett) + '"' : ' aria-hidden="true"') + '>' + innhold + '</svg>';
  }

  var VOGN = '<path d="M16 17 L9 5 L3 5" stroke="#1C1F1E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M12 32 L12 20 Q12 10 24 9 Q40 7 52 16 Q60 22 59 32 Z" fill="#2B3D6B" stroke="#1C1F1E" stroke-width="2.5" stroke-linejoin="round"/><path d="M15 21 Q15 13 25 12 Q39 10 50 18 Q55 22 56.5 28" stroke="#F3EEE1" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M37 15 Q47 15 53 22 Q56 26 56 30 L37 30 Z" fill="#AEB8D0"/><circle cx="43" cy="22" r="2" fill="#1C1F1E"/><circle cx="50" cy="23" r="2" fill="#1C1F1E"/><circle cx="40" cy="26.5" r="2.4" fill="#EFB3C8"/><circle cx="53.5" cy="27.5" r="2.2" fill="#EFB3C8"/><path d="M43.5 26 Q46.5 29 49.5 26.5" stroke="#1C1F1E" stroke-width="1.8" fill="none" stroke-linecap="round"/><line x1="9" y1="33" x2="60" y2="33" stroke="#1C1F1E" stroke-width="2.5" stroke-linecap="round"/><circle cx="21" cy="35" r="9" fill="#F3EEE1" stroke="#1C1F1E" stroke-width="3"/><circle cx="21" cy="35" r="2" fill="#1C1F1E"/><path d="M58 33 L60 38" stroke="#1C1F1E" stroke-width="2.5" stroke-linecap="round"/><circle cx="60" cy="40.5" r="4.5" fill="#1C1F1E"/>';
  var SYKKEL = '<g stroke="#2E3B37" stroke-width="3" fill="#F3EEE1"><circle cx="13" cy="28" r="10"/><circle cx="47" cy="28" r="10"/></g><g stroke="#1C1F1E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M13 28 L24 28 L35 13 L21 13 Z"/><path d="M35 13 L47 28"/><path d="M24 28 L19 8"/><path d="M9 18 L19 18"/></g><g stroke="#2E3B37" stroke-width="3" stroke-linecap="round" fill="none"><path d="M15 8 L23 8"/><path d="M35 13 L37 6 L42 6"/></g><path d="M2 17 L2 7 Q2 3 6 3 L8 3 Q12 3 12 8 L12 12 Q12 17 8 17 Z" fill="#C2391F" stroke="#1C1F1E" stroke-width="2" stroke-linejoin="round"/><rect x="40" y="11" width="13" height="8" rx="2" fill="#F2C230" stroke="#2E3B37" stroke-width="2"/><circle cx="46" cy="8" r="2.5" fill="#EFB3C8"/>';
  var HUSBIT = '<path d="M0 6 L18 19 L15 19 L15 38 L0 38 Z" fill="#F3EEE1"/><path d="M0 6 L18 19 M15 19 L15 38 M0 38 L17 38" stroke="#2E3B37" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 33 C3 30 3.5 26 5.5 26 C6.5 26 7 27 7 27 C7 27 7.5 26 8.5 26 C10.5 26 11 30 7 33 Z" fill="#D9432B"/>';
  var HUS = '<g stroke="#2E3B37" stroke-width="2.2" fill="#F3EEE1" stroke-linejoin="round"><path d="M4 15 L16 4 L28 15 L28 29 L4 29 Z"/></g><path d="M16 25 C10 20 11 15 14 15 C15.5 15 16 16.5 16 16.5 C16 16.5 16.5 15 18 15 C21 15 22 20 16 25 Z" fill="#D9432B"/>';
  var FART = '<g stroke="#2E3B37" stroke-width="2.2" stroke-linecap="round"><line x1="2" y1="6" x2="12" y2="6"/><line x1="5" y1="12" x2="12" y2="12"/><line x1="2" y1="18" x2="12" y2="18"/></g>';

  var ikon = {
    kjoretoy: function (type, etikett) {
      return type === "vogn" ? svg(76, 53, "0 0 66 46", VOGN, etikett) : svg(70, 47, "0 0 60 40", SYKKEL, etikett);
    },
    ukjent: function (etikett) {
      return svg(44, 44, "0 0 44 44", '<circle cx="22" cy="22" r="18" fill="none" stroke="#2E3B37" stroke-width="2.5" stroke-dasharray="5 5"/><text x="22" y="29" text-anchor="middle" font-family="Fredoka, sans-serif" font-size="20" font-weight="600" fill="#2E3B37">?</text>', etikett);
    },
    husVenstre: function () { return svg(20, 40, "0 0 20 40", HUSBIT); },
    husHoyre: function () { return svg(20, 40, "0 0 20 40", '<g transform="translate(20 0) scale(-1 1)">' + HUSBIT + '</g>'); },
    hus: function (s) { return svg(s, s, "0 0 32 32", HUS); },
    fart: function () { return svg(12, 22, "0 0 14 24", FART); },
    stjerne: function (s) { return svg(s, s, "0 0 24 24", '<path d="M12 2 L14.8 9 L22 9.5 L16.4 14 L18.3 21 L12 17 L5.7 21 L7.6 14 L2 9.5 L9.2 9 Z" fill="#F2C230" stroke="#2E3B37" stroke-width="2" stroke-linejoin="round"/>'); },
    hjerte: function (s) { return svg(s, s * 0.92, "0 0 24 22", '<path d="M12 20 C3 13 4 4 9 4 C11 4 12 6 12 6 C12 6 13 4 15 4 C20 4 21 13 12 20 Z" fill="#D9432B"/>'); },
    blyant: function (s) { return svg(s, s, "0 0 24 24", '<path d="M4 20 L5 15 L16 4 L20 8 L9 19 Z" fill="#F2C230" stroke="#2E3B37" stroke-width="2" stroke-linejoin="round"/><path d="M14 6 L18 10" stroke="#2E3B37" stroke-width="2"/>'); }
  };

  /* Vær: MET-symbolkode -> vårt ikon */
  var SKY = '<g fill="#9AA7D0"><circle cx="22" cy="30" r="11"/><circle cx="34" cy="24" r="14"/><circle cx="45" cy="32" r="9"/><rect x="14" y="30" width="38" height="12" rx="6"/></g><circle cx="29" cy="31" r="1.8" fill="#2E3B37"/><circle cx="37" cy="31" r="1.8" fill="#2E3B37"/><path d="M30 35.5 Q33 38 36 35.5" stroke="#2E3B37" stroke-width="1.6" fill="none" stroke-linecap="round"/>';
  var HOYSKY = '<g fill="#9AA7D0"><circle cx="22" cy="22" r="11"/><circle cx="34" cy="16" r="14"/><circle cx="45" cy="24" r="9"/><rect x="14" y="22" width="38" height="12" rx="6"/></g><circle cx="29" cy="23" r="1.8" fill="#2E3B37"/><circle cx="37" cy="23" r="1.8" fill="#2E3B37"/>';
  var VAERIKON = {
    sol: '<g stroke="#E0A800" stroke-width="4" stroke-linecap="round"><line x1="30" y1="4" x2="30" y2="9"/><line x1="30" y1="43" x2="30" y2="48"/><line x1="8" y1="26" x2="13" y2="26"/><line x1="47" y1="26" x2="52" y2="26"/><line x1="14" y1="10" x2="17.5" y2="13.5"/><line x1="46" y1="10" x2="42.5" y2="13.5"/><line x1="14" y1="42" x2="17.5" y2="38.5"/><line x1="46" y1="42" x2="42.5" y2="38.5"/></g><circle cx="30" cy="26" r="12" fill="#F2C230"/><circle cx="26" cy="24" r="1.6" fill="#2E3B37"/><circle cx="34" cy="24" r="1.6" fill="#2E3B37"/><path d="M26.5 29 Q30 32 33.5 29" stroke="#2E3B37" stroke-width="1.6" fill="none" stroke-linecap="round"/>',
    solsky: '<circle cx="38" cy="18" r="12" fill="#F2C230"/><g fill="#9AA7D0"><circle cx="20" cy="32" r="10"/><circle cx="31" cy="28" r="11"/><rect x="12" y="32" width="30" height="11" rx="5.5"/></g><circle cx="25" cy="34" r="1.8" fill="#2E3B37"/><circle cx="32" cy="34" r="1.8" fill="#2E3B37"/>',
    sky: SKY,
    regn: HOYSKY + '<g stroke="#2F3FD0" stroke-width="3.5" stroke-linecap="round"><line x1="22" y1="40" x2="20" y2="47"/><line x1="33" y1="41" x2="31" y2="48"/><line x1="44" y1="40" x2="42" y2="47"/></g>',
    sludd: HOYSKY + '<g stroke="#2F3FD0" stroke-width="3.5" stroke-linecap="round"><line x1="22" y1="40" x2="20" y2="47"/><line x1="44" y1="40" x2="42" y2="47"/></g><circle cx="32" cy="45" r="3" fill="#2F3FD0"/>',
    sno: HOYSKY + '<g fill="#2F3FD0"><circle cx="20" cy="42" r="3"/><circle cx="32" cy="47" r="3"/><circle cx="44" cy="42" r="3"/></g>',
    torden: HOYSKY + '<path d="M32 34 L25 44 L31 44 L27 52 L38 40 L32 40 L35 34 Z" fill="#F2C230" stroke="#2E3B37" stroke-width="1.5" stroke-linejoin="round"/>',
    mane: '<path d="M36 8 A18 18 0 1 0 48 38 A14 14 0 1 1 36 8 Z" fill="#B79BD6"/><circle cx="27" cy="26" r="1.8" fill="#2E3B37"/><path d="M24 32 Q27 35 30 32" stroke="#2E3B37" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
  };
  function vaerType(kode) {
    var k = String(kode || "");
    var natt = /_night$/.test(k);
    k = k.replace(/_(day|night|polartwilight)$/, "");
    if (k.indexOf("thunder") >= 0) return "torden";
    if (k.indexOf("snow") >= 0) return "sno";
    if (k.indexOf("sleet") >= 0) return "sludd";
    if (k.indexOf("rain") >= 0) return "regn";
    if (k === "clearsky" || k === "fair") return natt ? "mane" : (k === "fair" ? "solsky" : "sol");
    if (k === "partlycloudy") return natt ? "mane" : "solsky";
    return "sky";
  }
  ikon.vaer = function (kode, w) {
    return svg(w, Math.round(w * 52 / 60), "0 0 60 52", VAERIKON[vaerType(kode)] || SKY);
  };

  /* Klær */
  var KLAER = {
    regnjakke: ['Regnjakke', "0 0 120 130", '<g stroke="#2E3B37" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M44 20 Q60 2 76 20 L90 34 L102 72 L88 76 L82 50 L84 120 L36 120 L38 50 L32 76 L18 72 L30 34 Z" fill="#F2C230"/><path d="M60 28 L60 120" fill="none"/></g><g fill="#2E3B37"><circle cx="52" cy="40" r="4"/><circle cx="68" cy="40" r="4"/></g>', 34, 37],
    stovler: ['Støvler', "0 0 120 100", '<g stroke="#2E3B37" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="#D9432B"><path d="M10 8 L34 8 L34 58 Q34 66 42 66 L52 66 Q58 66 58 76 L58 86 L10 86 Z"/><path d="M62 8 L86 8 L86 58 Q86 66 94 66 L104 66 Q110 66 110 76 L110 86 L62 86 Z"/></g>', 38, 32],
    lue: ['Lue', "0 0 40 40", '<g stroke="#2E3B37" stroke-width="2.5" stroke-linejoin="round"><path d="M7 28 Q7 10 20 10 Q33 10 33 28 Z" fill="#D9432B"/><rect x="5" y="27" width="30" height="8" rx="3" fill="#F2C230"/><circle cx="20" cy="7" r="4" fill="#F3EEE1"/></g>', 34, 34],
    votter: ['Votter', "0 0 40 40", '<g stroke="#2E3B37" stroke-width="2.5" stroke-linejoin="round"><path d="M12 30 L12 14 Q12 6 20 6 Q28 6 28 14 L28 30 Z" fill="#2F3FD0"/><path d="M12 18 Q4 16 6 22 Q8 26 12 25" fill="#2F3FD0"/><rect x="10" y="29" width="20" height="6" rx="2" fill="#F3EEE1"/></g>', 32, 34],
    ull: ['Ullgenser', "0 0 40 40", '<g stroke="#2E3B37" stroke-width="2.5" stroke-linejoin="round"><path d="M14 6 L26 6 L36 12 L34 22 L29 20 L29 36 L11 36 L11 20 L6 22 L4 12 Z" fill="#F4C2D2"/></g><g stroke="#B23A6E" stroke-width="2"><line x1="11" y1="26" x2="29" y2="26"/><line x1="11" y1="31" x2="29" y2="31"/></g><path d="M16 6 Q20 11 24 6" stroke="#2E3B37" stroke-width="2.5" fill="none"/>', 36, 36],
    vinterdress: ['Vinterdress', "0 0 40 48", '<g stroke="#2E3B37" stroke-width="2.5" stroke-linejoin="round"><circle cx="20" cy="9" r="7" fill="#2F6B47"/><circle cx="20" cy="9.5" r="3.6" fill="#F3EEE1"/><path d="M11 17 L29 17 L35 30 L31 32 L28 26 L28 44 L22 44 L20 34 L18 44 L12 44 L12 26 L9 32 L5 30 Z" fill="#2F6B47"/></g><line x1="20" y1="18" x2="20" y2="33" stroke="#F2C230" stroke-width="2"/>', 30, 36]
  };
  ikon.klaer = function (navn, skala) {
    var k = KLAER[navn]; if (!k) return "";
    var s = skala || 1;
    return svg(Math.round(k[3] * s), Math.round(k[4] * s), k[1], k[2], k[0]);
  };

  return {
    DAGNAVN: DAGNAVN, MND: MND, MND_KORT: MND_KORT, param: param,
    naa: naa, pad: pad, iso: iso, fraIso: fraIso, leggTil: leggTil, mandag: mandag,
    ukedagIndeks: ukedagIndeks, ukenummer: ukenummer, erHelg: erHelg,
    les: les, skriv: skriv, dag: dag, faste: faste, alleHendelser: alleHendelser,
    esc: esc, ikon: ikon, vaerType: vaerType
  };
})();
