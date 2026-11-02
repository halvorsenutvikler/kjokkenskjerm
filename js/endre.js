/* Søndagsskjemaet: fyll inn uka. Alt lagres automatisk mens du skriver. */

(function () {
  "use strict";

  var S = INNSTILLINGER, $ = function (id) { return document.getElementById(id); };
  var PRIKK = ["#9FCFB6", "#DDB98A", "#E9C54E", "#9DB0EC", "#EE9E80", "#E995B0", "#B9A4E0"];

  function startUke() {
    if (KS.param.uke && /^\d{4}-\d{2}-\d{2}$/.test(KS.param.uke)) return KS.mandag(KS.fraIso(KS.param.uke));
    var n = KS.naa();
    return KS.ukedagIndeks(n) === 6 ? KS.leggTil(KS.mandag(n), 7) : KS.mandag(n); // søndag: planlegg neste uke
  }

  var man = startUke(), data = KS.les();

  /* ---------- Hjelpere ---------- */
  function langtOrd(tekst) {
    var ord = tekst.replace(/^\s*\d{1,2}([:.]\d{2})?\s*:/, "").split(/\s+/);
    for (var i = 0; i < ord.length; i++) {
      var o = ord[i].replace(/[.,!?:;]+$/, "");
      if (o.length >= 10 && o.indexOf("-") < 0) return o;
    }
    return null;
  }
  function forslag(o) { var k = Math.ceil(o.length / 2); return o.slice(0, k) + "-" + o.slice(k); }

  function feltHtml(id, verdi, etikett, plassholder) {
    return '<div><div class="felt" id="f-' + id + '"><input type="text" id="' + id + '" maxlength="30" autocomplete="off" autocorrect="on" aria-label="' + KS.esc(etikett) + '"' +
      (plassholder ? ' placeholder="' + KS.esc(plassholder) + '"' : "") + ' value="' + KS.esc(verdi || "") + '"><span class="teller"></span></div>' +
      '<div class="varseltekst" id="v-' + id + '" hidden></div></div>';
  }

  function radio(navn, verdi, valgt, tekst, ekstraKlasse) {
    return '<label' + (ekstraKlasse ? ' class="' + ekstraKlasse + '"' : "") + '><input type="radio" name="' + navn + '" value="' + verdi + '"' + (valgt === verdi ? " checked" : "") + "> " + tekst + "</label>";
  }

  /* ---------- Tegn skjemaet ---------- */
  function tegn() {
    var son = KS.leggTil(man, 6);
    $("uketekst").textContent = "Uke " + KS.ukenummer(man) + " · mandag " + man.getDate() + ". " +
      (man.getMonth() !== son.getMonth() ? KS.MND[man.getMonth()] + " " : "") + "– søndag " + son.getDate() + ". " + KS.MND[son.getMonth()];
    $("heiarop").value = (data.heiarop || {})[KS.iso(man)] || "";

    var html = "";
    for (var i = 0; i < 7; i++) {
      var d = KS.leggTil(man, i), key = KS.iso(d), dd = KS.dag(data, d), navn = KS.DAGNAVN[i];
      var faste = KS.faste(d), ledige = Math.max(0, S.maksHendelser - faste.length);
      var lever = (data.dager[key] || {}).lever || (KS.erHelg(d) ? "ingen" : "");
      var hent = (data.dager[key] || {}).hent || (KS.erHelg(d) ? "ingen" : "");
      var hend = "";
      faste.forEach(function (f) {
        hend += '<div class="fast"><svg aria-hidden="true" width="14" height="16" viewBox="0 0 14 16"><rect x="1" y="7" width="12" height="8" rx="2" fill="#6B7672"/><path d="M4 7 V5 a3 3 0 0 1 6 0 V7" stroke="#6B7672" stroke-width="2" fill="none"/></svg>' + KS.esc(f) + "<small>fast</small></div>";
      });
      for (var h = 0; h < ledige; h++) {
        hend += feltHtml("h-" + key + "-" + h, dd.hendelser[h], "Hendelse " + (h + 1) + " " + navn, h === 0 && !faste.length ? "f.eks. 18: Mamma kurs" : "");
      }
      html += '<div class="rad" data-dato="' + key + '">' +
        '<div class="dagnavn"><div class="prikk" style="background:' + PRIKK[i] + '"></div><div><b>' + navn.charAt(0).toUpperCase() + navn.slice(1) + "</b><span>" + d.getDate() + ". " + KS.MND_KORT[d.getMonth()] + "</span></div></div>" +
        '<fieldset><legend>Leverer ' + navn + "</legend>" + radio("lever-" + key, "mamma", lever, "Mamma") + radio("lever-" + key, "pappa", lever, "Pappa") + radio("lever-" + key, "ingen", lever, "Ingen", "ingen") + "</fieldset>" +
        '<fieldset><legend>Henter ' + navn + "</legend>" + radio("hent-" + key, "mamma", hent, "Mamma") + radio("hent-" + key, "pappa", hent, "Pappa") + radio("hent-" + key, "ingen", hent, "Ingen", "ingen") + "</fieldset>" +
        '<div class="midd">' + feltHtml("m-" + key, dd.middag, "Middag " + navn, i === 0 ? "f.eks. Fiske-grateng" : "") + "</div>" +
        '<div class="hendelser">' + hend + "</div>" +
        "</div>";
    }
    $("dager").innerHTML = html;
    oppdaterAlleTellere();
  }

  /* ---------- Tellere og varsler ---------- */
  function oppdaterTeller(input) {
    var felt = input.parentNode, teller = felt.querySelector(".teller"), v = input.value;
    var varsel = document.getElementById("v-" + input.id), langt = langtOrd(v);
    var forLang = v.length > S.tegnPerFelt;
    teller.textContent = v.length + "/" + S.tegnPerFelt;
    felt.className = "felt" + (forLang || langt ? " varsel" : "");
    if (varsel) {
      if (langt) { varsel.hidden = false; varsel.textContent = "«" + langt + "» er " + langt.length + " tegn. Del med bindestrek, f.eks. " + forslag(langt); }
      else if (forLang) { varsel.hidden = false; varsel.textContent = "Litt langt. Prøv å holde deg under " + S.tegnPerFelt + " tegn."; }
      else { varsel.hidden = true; }
    }
  }
  function oppdaterHeiarop() {
    var v = $("heiarop").value.trim(), ord = v ? v.split(/\s+/).length : 0;
    $("heiarop-teller").textContent = ord + "/" + S.heiaropMaksOrd + " ord";
    $("heiarop").parentNode.className = "felt" + (ord > S.heiaropMaksOrd ? " varsel" : "");
  }
  function oppdaterAlleTellere() {
    var inp = $("dager").querySelectorAll("input[type=text]");
    for (var i = 0; i < inp.length; i++) oppdaterTeller(inp[i]);
    oppdaterHeiarop();
  }

  /* ---------- Lagring ---------- */
  var lagretTimer;
  function lagre() {
    data = KS.les();
    var rader = $("dager").querySelectorAll(".rad");
    for (var i = 0; i < rader.length; i++) {
      var key = rader[i].getAttribute("data-dato");
      var valgt = function (n) { var r = rader[i].querySelector('input[name="' + n + "-" + key + '"]:checked'); return r ? r.value : ""; };
      var hendelser = [], felt = rader[i].querySelectorAll('.hendelser input[type=text]');
      for (var j = 0; j < felt.length; j++) if (felt[j].value.trim()) hendelser.push(felt[j].value.trim());
      var midd = rader[i].querySelector(".midd input").value.trim();
      data.dager[key] = { lever: valgt("lever"), hent: valgt("hent"), middag: midd, hendelser: hendelser };
    }
    data.heiarop = data.heiarop || {};
    var rop = $("heiarop").value.trim();
    if (rop) data.heiarop[KS.iso(man)] = rop; else delete data.heiarop[KS.iso(man)];
    var ok = KS.skriv(data);
    $("lagret").textContent = ok ? "Lagret ✓" : "Kunne ikke lagre!";
    clearTimeout(lagretTimer);
    lagretTimer = setTimeout(function () { $("lagret").textContent = ""; }, 2000);
    return ok;
  }

  function byttUke(dager) {
    lagre();
    man = KS.leggTil(man, dager);
    data = KS.les();
    tegn();
    window.scrollTo(0, 0);
  }

  /* ---------- Hendelser ---------- */
  $("dager").addEventListener("input", function (e) { if (e.target.type === "text") oppdaterTeller(e.target); });
  $("dager").addEventListener("change", lagre);
  $("heiarop").addEventListener("input", oppdaterHeiarop);
  $("heiarop").addEventListener("change", lagre);
  $("forrige").addEventListener("click", function () { byttUke(-7); });
  $("neste").addEventListener("click", function () { byttUke(7); });

  function ferdig() { if (lagre()) location.href = "index.html"; }
  $("lagre").addEventListener("click", ferdig);
  $("lagre2").addEventListener("click", ferdig);
  $("tilbake").addEventListener("click", function () { lagre(); });

  $("tom").addEventListener("click", function () {
    if (!window.confirm("Tømme alt for uke " + KS.ukenummer(man) + "? Faste hendelser blir stående.")) return;
    data = KS.les();
    for (var i = 0; i < 7; i++) delete data.dager[KS.iso(KS.leggTil(man, i))];
    if (data.heiarop) delete data.heiarop[KS.iso(man)];
    KS.skriv(data);
    tegn();
  });

  $("kopi").addEventListener("click", function () {
    lagre();
    var blob = new Blob([JSON.stringify(KS.les(), null, 1)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "kjokkenskjerm-kopi-" + KS.iso(KS.naa()) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
  });

  $("hent-kopi").addEventListener("change", function (e) {
    var fil = e.target.files && e.target.files[0]; if (!fil) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var inn = JSON.parse(r.result);
        if (!inn || !inn.dager) throw new Error("feil format");
        if (!window.confirm("Erstatte alt som er lagret med innholdet i kopien?")) return;
        KS.skriv(inn); data = KS.les(); tegn();
        $("lagret").textContent = "Kopi hentet ✓";
      } catch (err) { window.alert("Fila kunne ikke leses som en sikkerhetskopi."); }
    };
    r.readAsText(fil);
  });

  window.addEventListener("pagehide", lagre);
  tegn();
})();
