# Uka vår – kjøkkenskjermen

En ukeplan for kjøkkenet: klokke, vær for Veitvet, hvem som leverer og henter, middag, hendelser og ukas heiarop. Laget for en iPad Air 2 (iPadOS 15) som står liggende.

- **Skjermen:** `index.html`
- **Søndagsskjemaet:** `endre.html` (knappen «Endre» nede til høyre)
- **Innstillinger du kan endre selv:** `js/innstillinger.js`

Det dere skriver inn, lagres **bare på iPaden**. Koden ligger åpent på GitHub, men innholdet deres gjør ikke det.

---

## Del 1 – Legg siden ut på GitHub (ca. 15 minutter, gjøres på Mac/PC)

### 1. Opprett et repository
1. Logg inn på github.com.
2. Trykk **+** øverst til høyre → **New repository**.
3. *Repository name:* `kjokkenskjerm`
4. Velg **Public**. Gratis GitHub Pages krever det. Det er bare koden som blir synlig, ikke dataene deres.
5. Trykk **Create repository**.

### 2. Last opp filene
1. Pakk ut zip-fila. Du får en mappe `kjokkenskjerm` med `index.html`, `endre.html`, `README.md` og mappene `css`, `js`, `fonts` og `bilder`.
2. På den nye repo-siden trykker du lenken **uploading an existing file**.
3. Åpne den utpakkede mappen i Finder. Marker **alt innholdet** (filene og de fire mappene, ikke selve `kjokkenskjerm`-mappen) og dra det inn i nettleservinduet.
   - Mappestrukturen blir med når du drar mapper inn. Bruker du Safari og mappene ikke blir med, prøv Chrome.
4. Skriv gjerne en melding i *Commit changes*, f.eks. «Versjon 1», og trykk **Commit changes**.
5. Sjekk at du ser `index.html` og mappene `css`, `js`, `fonts` og `bilder` i lista.

### 3. Slå på GitHub Pages
1. I repoet: **Settings** → **Pages** (i menyen til venstre).
2. Under *Build and deployment*: Source = **Deploy from a branch**, Branch = **main** og **/ (root)** → **Save**.
3. Vent 1–2 minutter og last siden på nytt. Øverst står adressen:
   `https://DITT-BRUKERNAVN.github.io/kjokkenskjerm/`

### 4. Test på Macen
- Åpne adressen. Du skal se klokke, vær og en tom uke med «?» der levering og henting ikke er bestemt.
- Legg til `?test=1` bak adressen for å se en ferdig utfylt eksempeluke.

---

## Del 2 – Sett opp iPaden

1. Åpne adressen i **Safari** på iPaden.
2. Trykk **Del**-ikonet → **Legg til på Hjem-skjerm** → navnet blir «Uka vår» → **Legg til**.
3. **Bruk alltid ikonet på Hjem-skjermen**, både til skjermen og til «Endre». Appen på Hjem-skjermen har sin egen lagring, atskilt fra vanlig Safari.
4. *Innstillinger → Skjerm og lysstyrke → Autolås → Aldri.*
5. Koble til lader.
6. Valgfritt: *Innstillinger → Tilgjengelighet → Veiledet tilgang*. Låser iPaden til denne appen (trippelklikk på Hjem-knappen for å starte og stoppe).

---

## Del 3 – Søndagsmøtet

1. Trykk **Endre** nede til høyre.
2. På søndager åpner skjemaet automatisk **neste uke**. Bytt uke med pilene ved uketallet.
3. Fyll inn leverer, henter, middag, hendelser og ukas heiarop. **Alt lagres mens du skriver.** «Lagre uka» tar deg tilbake til skjermen.
4. Fra søndag kl. 16 viser skjermen den nye uka.

**Slik får alt plass:**
- Ca. 10 tegn per linje, maks 2 linjer (ca. 20 tegn) per felt.
- Del ord på 10+ tegn med bindestrek: *Fiske-grateng*, *Foreldre-samtale*. Skjemaet varsler deg.
- Klokkeslett først: *18: Mamma kurs*. Slike hendelser sorteres etter tid.
- Maks 3 hendelser per dag. Faste hendelser teller med.
- Blir noe likevel for langt, krymper skjermen skriften litt i stedet for å gå utenfor rammen.

**Sikkerhetskopi:** «Sikkerhetskopi» laster ned en liten fil med alt dere har skrevet. «Hent kopi» legger den inn igjen.

---

## Del 4 – Endre noe senere

### Faste hendelser, klærregler og sted
Åpne `js/innstillinger.js` på GitHub → blyant-ikonet (**Edit this file**) → endre → **Commit changes**. Eksempel på en ny fast hendelse:

```js
{ ukedag: 2, tekst: "Svømming 17" },
```

(ukedag 1 = mandag … 7 = søndag). Behold kommaene mellom linjene.

### Når kommer endringen fram på iPaden?
- Automatisk hver natt kl. 03:30, da laster skjermen seg selv på nytt.
- Med en gang: lukk appen (sveip den bort) og åpne den igjen.

---

## Feilsøking

| Det du ser | Hva det betyr |
|---|---|
| «Venter på værmeldingen …» | iPaden får ikke kontakt med værtjenesten. Sjekk wifi. |
| «(gammel)» nederst til venstre | Været er mer enn 3 timer gammelt. Skjermen prøver igjen hver halvtime. |
| Stiplet «?» i en dag | Hvem som leverer eller henter er ikke satt for den dagen. |
| Det dere skrev er borte | Skjermen ble kanskje åpnet i Safari i stedet for fra Hjem-skjermen. Bruk sikkerhetskopien. |

Vil du teste en bestemt tid: legg til `?test=1&dato=2026-10-30T19:10` bak adressen.

---

## Filene

```
index.html            Skjermen
endre.html            Søndagsskjemaet
js/innstillinger.js   ← det du kan endre selv
js/felles.js          Datoer, lagring, ikoner
js/skjerm.js          Tegner skjermen, henter været
js/endre.js           Skjemaet
css/                  Utseende
fonts/                Londrina Solid og Fredoka (SIL Open Font License)
bilder/               Vannfarge, papir og app-ikon
```

Vær: MET Norge / Yr (CC BY 4.0), med Open-Meteo som reserve.
