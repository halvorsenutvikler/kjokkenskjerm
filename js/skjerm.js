/* Kjøkkenskjermen: tegner klokke, vær og ukeplan.
   Testvisning uten nett og uten egne data: legg til ?test=1 i adressen.
   Annen dato/tid for testing: ?test=1&dato=2026-10-30T07:42 */

(function () {
  "use strict";

  var S = INNSTILLINGER, $ = function (id) { return document.getElementById(id); };
  var TEST = KS.param.test === "1";
  var VAER_NOKKEL = "kjokkenskjerm.vaer";

  /* ================= Skalering til skjermen ================= */
  // Skalerer etter høyden og lar ukeplanen bli bredere når skjermen har plass til det
  // (f.eks. når statuslinja på iPaden tar litt av høyden).
  var forrigeBredde = 0;
  function skaler() {
    var sc = $("scene"), w = window.innerWidth, h = window.innerHeight;
    var s = h / 768;
    if (w / s < 1024) s = w / 1024;
    var bredde = Math.min(1366, Math.max(1024, Math.floor(w / s)));
    sc.style.width = bredde + "px";
    var x = Math.round((w - bredde * s) / 2), y = Math.round((h - 768 * s) / 2);
    sc.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
    if (bredde !== forrigeBredde) { forrigeBredde = bredde; if ($("uke").firstChild) tilpassTekst(); }
  }

  /* ================= Hvilken uke og modus ================= */
  function visningsMandag(n) {
    var m = KS.mandag(n);
    if (KS.ukedagIndeks(n) === 6 && n.getHours() >= S.nesteUkeFraSondagKl) m = KS.leggTil(m, 7);
    return m;
  }
  function vaerModusIMorgen(n) { return n.getHours() >= S.vaerIMorgenFraKl; }

  /* ================= Data ================= */
  function testData(man) {
    var d = {}, f = function (i) { return KS.iso(KS.leggTil(man, i)); };
    d[f(0)] = { lever: "pappa", hent: "mamma", middag: "I kirken", hendelser: ["Kari fyller 18"] };
    d[f(1)] = { lever: "mamma", hent: "pappa", middag: "Pizza", hendelser: ["Mikkel 2 år i bhg"] };
    d[f(2)] = { lever: "pappa", hent: "mamma", middag: "Fiske-grateng", hendelser: ["18: Mamma kurs"] };
    d[f(3)] = { lever: "mamma", hent: "pappa", middag: "Suppe", hendelser: [] };
    d[f(4)] = { lever: "pappa", hent: "mamma", middag: "Taco!", hendelser: ["14: Foreldre-samtale", "Kjøp gave til Nora", "Pappa pakker"] };
    d[f(5)] = { middag: "Grøt", hendelser: ["09: Hunde-frisør", "Pappa reiser"] };
    d[f(6)] = { middag: "Laks", hendelser: ["Søndags-møte"] };
    var h = {}; h[KS.iso(man)] = "Hvordan går det med deg?";
    var j = {}, t = Date.now();
    j[KS.iso(man)] = [
      { tekst: "Sette på vask", str: "10", hvem: "pappa", dag: 0, barn: false, gjort: t },
      { tekst: "Sope gangen", str: "10", hvem: "pappa", dag: 1, barn: true, gjort: t },
      { tekst: "Rense oppvaskmaskinfilter", str: "10", hvem: "mamma", dag: 2, barn: false, gjort: t },
      { tekst: "Vaske speil og glass", str: "10", hvem: "mamma", dag: 3, barn: false, gjort: null },
      { tekst: "Passer vinterklærne til barnet?", str: "30", hvem: "mamma", dag: 5, barn: true, gjort: null },
      { tekst: "Rydde hjørneskapet", str: "stor", hvem: "begge", dag: 6, barn: true, gjort: null }
    ];
    return { versjon: 2, dager: d, heiarop: h, jobber: j };
  }
  var testLager = {};
  function data(man) {
    if (!TEST) return KS.les();
    var k = KS.iso(man);
    if (!testLager[k]) testLager[k] = testData(man);
    return testLager[k];
  }

  /* ================= Klokke og uke ================= */
  var KLOKKEFARGER = ["#2F3FD0", "#D9432B", "#2E3B37", "#2F6B47", "#B23A6E"];
  var NAVNFARGER = ["#2F3FD0", "#C2391F", "#2F6B47", "#B23A6E", "#2E3B37"];

  function farget(tekst, farger, start) {
    var ut = "";
    for (var i = 0; i < tekst.length; i++) ut += '<span style="color:' + farger[(start + i) % farger.length] + '">' + KS.esc(tekst.charAt(i)) + "</span>";
    return ut;
  }

  function tegnKlokke(n) {
    var t = KS.pad(n.getHours()) + ":" + KS.pad(n.getMinutes()), ut = "";
    for (var i = 0; i < 5; i++) ut += '<span style="color:' + KLOKKEFARGER[i] + '">' + t.charAt(i) + "</span>";
    $("klokke").innerHTML = ut;
  }

  /* ================= Vær ================= */
  var vaer = lesVaer();

  function lesVaer() {
    try { var v = JSON.parse(localStorage.getItem(VAER_NOKKEL) || "null"); if (v && v.punkter) return v; } catch (e) { }
    return { punkter: [], kilde: "", hentet: 0 };
  }
  function lagreVaer() { try { localStorage.setItem(VAER_NOKKEL, JSON.stringify(vaer)); } catch (e) { } }

  // punkter: [tid(ms), temp, symbolkode, nedbør(mm)]
  function slaaSammen(nye, kilde) {
    if (!nye.length) return;
    var forste = nye[0][0], grense = KS.leggTil(KS.mandag(KS.naa()), -8).getTime();
    var gamle = vaer.punkter.filter(function (p) { return p[0] < forste && p[0] >= grense; });
    vaer = { punkter: gamle.concat(nye), kilde: kilde, hentet: Date.now() };
    lagreVaer();
  }

  function naermeste(maal, maksMin) {
    var best = null, avvik = maksMin * 60000 + 1;
    for (var i = 0; i < vaer.punkter.length; i++) {
      var a = Math.abs(vaer.punkter[i][0] - maal);
      if (a < avvik) { avvik = a; best = vaer.punkter[i]; }
    }
    return best;
  }
  function kl(d, time) { return new Date(d.getFullYear(), d.getMonth(), d.getDate(), time).getTime(); }

  function klaerFor(d) {
    var fra = kl(d, 7), til = kl(d, 17), min = null, mm = 0, vaatt = false;
    vaer.punkter.forEach(function (p) {
      if (p[0] < fra || p[0] > til) return;
      if (min === null || p[1] < min) min = p[1];
      mm += p[3] || 0;
      var t = KS.vaerType(p[2]);
      if (t === "regn" || t === "sludd" || t === "torden") vaatt = true;
    });
    if (min === null) { var p8 = naermeste(kl(d, 8), 210); if (!p8) return []; min = p8[1]; }
    if (mm >= S.klaer.regnMm) vaatt = true;
    if (min < S.klaer.veldigKaldt) return ["ull", "vinterdress"];
    if (min < S.klaer.kaldt) return ["lue", "votter"];
    if (vaatt) return ["regnjakke", "stovler"];
    return [];
  }

  function grader(t) { return Math.round(t) + "°"; }

  function tegnVaer(n) {
    var imorgen = vaerModusIMorgen(n), dag = imorgen ? KS.leggTil(n, 1) : n;
    var hoved = imorgen ? naermeste(kl(dag, 8), 210) : naermeste(n.getTime(), 90);
    if (!hoved) { $("vaer").innerHTML = '<div class="ingen-data">Venter på værmeldingen …</div>'; return; }
    var klaer = klaerFor(dag).map(function (k) { return KS.ikon.klaer(k, 1); }).join("");
    var timer = [9, 12, 15, 18].map(function (h) {
      var p = naermeste(kl(dag, h), 90);
      return '<div class="time"><div class="kl">' + KS.pad(h) + "</div>" + (p ? KS.ikon.vaer(p[2], 40) + '<div class="t">' + grader(p[1]) + "</div>" : '<div class="t">–</div>') + "</div>";
    }).join("");
    $("vaer").innerHTML = (imorgen ? '<div class="merke">I morgen</div>' : "") +
      KS.ikon.vaer(hoved[2], 76) +
      '<div class="stor-temp">' + grader(hoved[1]) + "</div>" +
      (klaer ? '<div class="klaer">' + klaer + "</div>" : "") +
      '<div class="timer">' + timer + "</div>";
  }

  function tegnKilde() {
    var tekst = "Vær: " + (vaer.kilde || "MET Norge");
    if (vaer.hentet) {
      var h = new Date(vaer.hentet);
      tekst += "<br>oppdatert " + KS.pad(h.getHours()) + ":" + KS.pad(h.getMinutes());
      if (Date.now() - vaer.hentet > 3 * 3600000) tekst += " (gammel)";
    }
    if (TEST) tekst = "Testvisning (?test=1)";
    $("kilde").innerHTML = tekst;
  }

  function hent(url, ok, feil) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var tid = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch(url, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (j) { clearTimeout(tid); ok(j); })
      .catch(function (e) { clearTimeout(tid); feil(e); });
  }

  function hentVaer() {
    if (TEST) { testVaer(); oppdaterVaer(); return; }
    var url = "https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=" + S.sted.lat + "&lon=" + S.sted.lon;
    hent(url, function (j) {
      try {
        var p = j.properties.timeseries.map(function (x) {
          var d = x.data, n1 = d.next_1_hours, n6 = d.next_6_hours;
          return [new Date(x.time).getTime(), d.instant.details.air_temperature,
            (n1 && n1.summary.symbol_code) || (n6 && n6.summary.symbol_code) || "",
            n1 ? n1.details.precipitation_amount : (n6 ? n6.details.precipitation_amount / 6 : 0)];
        });
        slaaSammen(p, "MET Norge"); oppdaterVaer();
      } catch (e) { hentOpenMeteo(); }
    }, hentOpenMeteo);
  }

  function hentOpenMeteo() {
    var url = "https://api.open-meteo.com/v1/forecast?latitude=" + S.sted.lat + "&longitude=" + S.sted.lon +
      "&hourly=temperature_2m,weather_code,precipitation,is_day&timezone=Europe%2FOslo&forecast_days=9";
    hent(url, function (j) {
      var h = j.hourly, p = [];
      for (var i = 0; i < h.time.length; i++) {
        var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(h.time[i]);
        var t = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime();
        if (t < Date.now() - 3600000) continue;
        p.push([t, h.temperature_2m[i], wmoTilMet(h.weather_code[i], h.is_day[i]), h.precipitation[i] || 0]);
      }
      slaaSammen(p, "Open-Meteo"); oppdaterVaer();
    }, function () { tegnKilde(); });
  }

  function wmoTilMet(c, dag) {
    var s = dag === 0 ? "_night" : "_day";
    if (c === 0) return "clearsky" + s;
    if (c === 1) return "fair" + s;
    if (c === 2) return "partlycloudy" + s;
    if (c === 45 || c === 48 || c === 3) return "cloudy";
    if (c >= 51 && c <= 65) return "rain";
    if (c === 66 || c === 67) return "sleet";
    if ((c >= 71 && c <= 77) || c === 85 || c === 86) return "snow";
    if (c >= 80 && c <= 82) return "rainshowers" + s;
    if (c >= 95) return "rainandthunder";
    return "cloudy";
  }

  function testVaer() {
    var man = visningsMandag(KS.naa()), p = [];
    var base = [4, 7, 8, 5, 6, -3, 1], sym = ["clearsky_day", "cloudy", "rain", "partlycloudy_day", "rain", "snow", "clearsky_day"];
    for (var d = -1; d < 9; d++) {
      var dato = KS.leggTil(man, d), i = ((d % 7) + 7) % 7;
      for (var h = 0; h < 24; h++) {
        var s = sym[i];
        if (d === KS.ukedagIndeks(KS.naa()) && KS.mandag(KS.naa()).getTime() === man.getTime()) s = h < 11 ? "cloudy" : h < 14 ? "partlycloudy_day" : h < 17 ? "rain" : "clearsky_night";
        p.push([kl(dato, h), base[i] + 2 * Math.sin((h - 9) / 24 * Math.PI * 2), s, s === "rain" ? 0.4 : 0]);
      }
    }
    vaer = { punkter: p, kilde: "testdata", hentet: Date.now() };
  }

  function oppdaterVaer() { var n = KS.naa(); tegnVaer(n); tegnUke(n); tegnKilde(); }

  /* ================= Ukeplanen ================= */
  function transport(dd) {
    var hvem = function (p) { return p === "mamma" ? "Mamma" : "Pappa"; };
    if (dd.lever === "ingen" && dd.hent === "ingen") {
      return '<div class="transport rad hjemme">' + KS.ikon.hus(46) + "<span>hjemme</span></div>";
    }
    var linje1 = "", linje2 = "";
    if (dd.lever && dd.lever !== "ingen") linje1 = KS.ikon.husVenstre() + '<span class="fart-v">' + KS.ikon.fart() + "</span>" + KS.ikon.kjoretoy(S.kjoretoy[dd.lever], hvem(dd.lever) + " leverer");
    else if (!dd.lever) linje1 = KS.ikon.husVenstre() + "<span></span>" + KS.ikon.ukjent("Hvem leverer er ikke bestemt");
    if (dd.hent && dd.hent !== "ingen") linje2 = '<span class="fart-h">' + KS.ikon.fart() + "</span>" + KS.ikon.kjoretoy(S.kjoretoy[dd.hent], hvem(dd.hent) + " henter") + KS.ikon.husHoyre();
    else if (!dd.hent) linje2 = "<span></span>" + KS.ikon.ukjent("Hvem henter er ikke bestemt") + KS.ikon.husHoyre();
    return '<div class="transport rad"><div class="linje">' + linje1 + '</div><div class="linje">' + linje2 + "</div></div>";
  }

  function dagvaer(d) {
    var p = naermeste(kl(d, 8), 210);
    if (!p) return '<div class="dagvaer rad"><span class="t" style="font-size:24px;opacity:.5">–</span></div>';
    var klaer = klaerFor(d);
    return '<div class="dagvaer rad">' + KS.ikon.vaer(p[2], klaer.length ? 36 : 44) +
      '<span class="t' + (p[1] < 0 ? " minus" : "") + '">' + grader(p[1]) + "</span>" +
      (klaer.length ? '<span class="sma-klaer">' + klaer.map(function (k) { return KS.ikon.klaer(k, 0.62); }).join("") + "</span>" : "") +
      "</div>";
  }

  function tegnUke(n) {
    var man = visningsMandag(n), dt = data(man), idag = KS.iso(n), html = "";
    tegnRing(dt, man);
    for (var i = 0; i < 7; i++) {
      var d = KS.leggTil(man, i), dd = KS.dag(dt, d), erIdag = KS.iso(d) === idag;
      var hendelser = KS.alleHendelser(dt, d).map(function (h) { return "<div>" + KS.esc(h) + "</div>"; }).join("");
      html += '<div class="dag d' + i + (erIdag ? " idag" : "") + '">' +
        '<div class="vask"></div>' + (erIdag ? '<div class="ytre"></div><div class="lapp">I DAG</div>' : "") +
        '<div class="ramme"></div><div class="innhold">' +
        '<div class="hode"><div class="navn">' + farget(KS.DAGNAVN[i], NAVNFARGER, i) + '</div><div class="dato">' + d.getDate() + ". " + KS.MND_KORT[d.getMonth()] + "</div></div>" +
        dagvaer(d) + transport(dd) +
        '<div class="middag rad"><div class="tekst">' + KS.esc(dd.middag) + "</div></div>" +
        '<div class="hendelser rad">' + hendelser + "</div>" +
        "</div></div>";
    }
    $("uke").innerHTML = html;

    var rop = (dt.heiarop || {})[KS.iso(man)] || "";
    $("heiarop").hidden = !rop;
    $("rop").textContent = rop;
    tilpassTekst();
  }

  // Krymper teksten litt hvis noe likevel blir for langt for feltet (for høyt,
  // eller et langt ord som er bredere enn kolonnen). Først når skriften er så
  // liten som vi tillater, deles ordet midt i.
  function krymp(el, boks, minst) {
    el.style.fontSize = ""; el.className = el.className.replace(/\s*knekk/, "");
    var s = parseFloat(getComputedStyle(el).fontSize);
    var forStor = function () { return el.scrollHeight > boks.clientHeight + 1 || el.scrollWidth > boks.clientWidth + 1; };
    while (forStor() && s > minst) { s -= 1; el.style.fontSize = s + "px"; }
    if (forStor()) el.className += " knekk";
  }
  function tilpassTekst() {
    var bokser = document.querySelectorAll(".middag"), lister = document.querySelectorAll(".hendelser"), i;
    for (i = 0; i < bokser.length; i++) krymp(bokser[i].firstChild, bokser[i], 15);
    for (i = 0; i < lister.length; i++) krymp(lister[i], lister[i], 15);
  }

  /* ================= Ukas småjobber: ringen og panelet ================= */
  var RINGFARGER = ["#2F3FD0", "#D9432B", "#2F6B47", "#B23A6E", "#E0A800", "#7C93D8", "#C2391F", "#3E8E68"];
  var KORTDAG = ["man", "tir", "ons", "tor", "fre", "lør", "søn"];
  var HVEM = { mamma: "Mamma", pappa: "Pappa", begge: "Begge" };
  var STR = { "10": "10 min", "30": "30 min", stor: "stor" };

  // Jobbene som faktisk har tekst, med indeksen de har i lagringen
  function ukasJobber(dt, man) {
    var ut = [];
    KS.jobber(dt, man).forEach(function (j, i) { if (j.tekst && j.tekst.trim()) ut.push({ j: j, i: i }); });
    return ut;
  }

  function bue(i, n) {
    var luke = 10, a0 = (-90 + i * 360 / n + luke / 2) * Math.PI / 180, a1 = (-90 + (i + 1) * 360 / n - luke / 2) * Math.PI / 180;
    var p = function (a) { return (63 + 54 * Math.cos(a)).toFixed(2) + " " + (63 + 54 * Math.sin(a)).toFixed(2); };
    return "M" + p(a0) + " A54 54 0 " + (a1 - a0 > Math.PI ? 1 : 0) + " 1 " + p(a1);
  }

  function tegnRing(dt, man) {
    var liste = ukasJobber(dt, man), n = liste.length, knapp = $("ukestempel");
    var nr = KS.ukenummer(man), fargetNr = farget(String(nr), ["#B23A6E", "#2F3FD0"], 0);
    if (!n) {
      knapp.className = "ukestempel";
      $("ring").innerHTML = "";
      $("stempeltekst").innerHTML = '<span class="ukeord">uke</span><span class="nr">' + fargetNr + "</span>";
      knapp.setAttribute("aria-label", "Uke " + nr + ". Ingen småjobber valgt.");
      return;
    }
    var gjort = liste.filter(function (x) { return x.j.gjort; }).length, deler = "";
    for (var i = 0; i < n; i++) {
      // Ringen fylles med klokka: de første feltene farges etter hvert som jobber blir gjort
      if (n === 1) deler += '<circle cx="63" cy="63" r="54" fill="none" ' + (gjort ? 'stroke="' + RINGFARGER[0] + '" stroke-width="13"' : 'stroke="#2E3B37" stroke-width="3" stroke-dasharray="4 6"') + "/>";
      else if (i < gjort) deler += '<path d="' + bue(i, n) + '" fill="none" stroke="' + RINGFARGER[i % RINGFARGER.length] + '" stroke-width="13" stroke-linecap="round"/>';
      else deler += '<path d="' + bue(i, n) + '" fill="none" stroke="#2E3B37" stroke-width="3" stroke-dasharray="4 6" stroke-linecap="round"/>';
    }
    knapp.className = "ukestempel har-jobber";
    $("ring").innerHTML = '<svg width="126" height="126" viewBox="0 0 126 126" aria-hidden="true">' + deler + "</svg>";
    $("stempeltekst").innerHTML = gjort === n
      ? '<span class="ferdig-stjerne">' + KS.ikon.stjerne(52) + '</span><span class="ferdig-nr">uke ' + nr + "</span>"
      : '<span class="ukeord">uke</span><span class="nr">' + fargetNr + "</span>";
    knapp.setAttribute("aria-label", "Uke " + nr + ". " + gjort + " av " + n + " småjobber gjort. Trykk for å se lista.");
  }

  var panelTimer;
  function tegnPanel() {
    var man = visningsMandag(KS.naa()), dt = data(man), liste = ukasJobber(dt, man);
    var gjort = liste.filter(function (x) { return x.j.gjort; }).length;
    $("panel-status").textContent = !liste.length ? "" : gjort === liste.length ? "Alt gjort – godt jobbet!" : gjort + " av " + liste.length + " gjort · trykk for å krysse av";
    if (!liste.length) { $("panel-liste").innerHTML = '<div class="panel-tom">Ingen småjobber valgt denne uka. De velges på søndagsmøtet under «Endre».</div>'; return; }
    var nrGjort = 0; // hakene får samme farge som feltet de fyller i ringen
    $("panel-liste").innerHTML = liste.map(function (x) {
      var j = x.j, farge = j.gjort ? RINGFARGER[(nrGjort++) % RINGFARGER.length] : "";
      var hake = j.gjort
        ? '<svg class="hake" width="32" height="32" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="13" fill="' + farge + '"/><path d="M9 15 L13.5 19.5 L21 11" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : '<svg class="hake" width="32" height="32" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="12" fill="none" stroke="#2E3B37" stroke-width="2.5" stroke-dasharray="4 4"/></svg>';
      var info = [HVEM[j.hvem] || "", j.dag === "" || j.dag == null ? "" : KORTDAG[+j.dag], STR[j.str] || ""].filter(Boolean).join(" · ");
      return '<button type="button" class="jobb' + (j.gjort ? " gjort" : "") + '" data-i="' + x.i + '" aria-pressed="' + (j.gjort ? "true" : "false") + '">' +
        hake + '<span class="navn">' + KS.esc(j.tekst) + '</span><span class="info">' + (j.barn ? KS.ikon.barn(20, "sammen med barnet") : "") + KS.esc(info) + "</span></button>";
    }).join("");
  }
  function aapnePanel() { tegnPanel(); $("panel").hidden = false; utsettLukking(); }
  function lukkPanel() { $("panel").hidden = true; clearTimeout(panelTimer); }
  function utsettLukking() { clearTimeout(panelTimer); panelTimer = setTimeout(lukkPanel, 60000); }

  function veksleJobb(i) {
    var man = visningsMandag(KS.naa()), dt = TEST ? data(man) : KS.les(), liste = KS.jobber(dt, man);
    if (!liste[i]) return;
    liste[i].gjort = liste[i].gjort ? null : Date.now();
    if (!TEST) KS.skriv(dt);
    tegnPanel(); tegnRing(dt, man); utsettLukking();
  }

  /* ================= Oppstart og oppdatering ================= */
  var forrigeMinutt = -1, forrigeNokkel = "";
  function tikk() {
    var n = KS.naa();
    if (n.getMinutes() === forrigeMinutt) return;
    forrigeMinutt = n.getMinutes();
    tegnKlokke(n);
    var nokkel = KS.iso(n) + "|" + KS.iso(visningsMandag(n)) + "|" + vaerModusIMorgen(n) + "|" + n.getHours();
    if (nokkel !== forrigeNokkel) { forrigeNokkel = nokkel; tegnVaer(n); tegnUke(n); tegnKilde(); }
    if (!TEST && n.getHours() === 3 && n.getMinutes() === 30) location.reload(); // henter eventuelle oppdateringer fra GitHub
  }

  function start() {
    $("heia-stjerne").innerHTML = KS.ikon.stjerne(22);
    $("heia-hjerte").innerHTML = KS.ikon.hjerte(22);
    $("endre").insertAdjacentHTML("afterbegin", KS.ikon.blyant(18));
    if (TEST) $("endre").href = "endre.html?test=1";
    $("ukestempel").addEventListener("click", aapnePanel);
    $("panel-lukk").addEventListener("click", lukkPanel);
    $("panel").addEventListener("click", function (e) { if (e.target === $("panel")) lukkPanel(); });
    $("panel-liste").addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".jobb") : null;
      if (b) veksleJobb(+b.getAttribute("data-i"));
    });
    skaler();
    tikk();
    hentVaer();
    setInterval(tikk, 2000);
    setInterval(hentVaer, 30 * 60000);
    window.addEventListener("resize", skaler);
    window.addEventListener("orientationchange", function () { setTimeout(skaler, 300); });
    window.addEventListener("pageshow", function () { forrigeMinutt = -1; forrigeNokkel = ""; tikk(); });
    document.addEventListener("visibilitychange", function () { if (!document.hidden) { forrigeNokkel = ""; forrigeMinutt = -1; tikk(); } });
  }

  if (document.fonts && document.fonts.ready) {
    var startet = false, go = function () { if (!startet) { startet = true; start(); } };
    document.fonts.ready.then(go); setTimeout(go, 3000);
  } else start();
})();
