# Larasser public-site source audit

Purpose: make sure the demo does not silently lose useful information, projects or imagery from the existing public website and does not invent missing facts.

Audit date: 2026-09-07

## Rule

The redesign should be better in navigation, readability, responsiveness and conversion while preserving the useful public information and project breadth of the current Larasser site. Conflicting claims are not guessed.

## Public sections reviewed

### Start page
Verified public topics:
- founded 1996
- Meisterbetrieb in Grafing b. München
- Schlosserarbeiten
- Metall-, Stahl- und Glasbau
- Edelstahl
- Reparaturen & Service
- Blechverarbeitung
- certified welding / EN 1090-2 EXC2
- categories: Interior, Balkone & Terrassen, Tore & Zäune, Treppen & Geländer, Carports/Dächer/Stahlbau, Medallions, Lohnbiegen & Lohnschneiden

### Treppen & Geländer
Verified project groups and their public image groups are stored in `data/treppen.json`:
- 2025 Geschmiedete Geländer für den Garten
- 2024 Doppelwangige Stahltreppe
- 2024 Schlichtes Harfengeländer
- 2015 Geschwungene Stahltreppe
- 2023 Außentreppe mit Natursteinstufen
- 2022 Treppengeländer im Treppenauge
- 2020 Stahltreppe mit Messinghandlauf
- 2016 Treppengeländer im Handwerkerhaus
- 2025 Absturzsicherung im schmalen Treppenauge

### Tore & Zäune
Verified project groups and image groups are stored in `data/tore.json`:
- 2019 Klassisches Schmiedetor
- 2025 Gartenzaunanlage/Tore
- 2022 Gartentor & Zaun
- 2023 Moderne Toranlage
- 2021 Geschmiedetes Gartentor / Restauration
- 2019 Friedhofstor & Zaunanlage

### Balkone & Terrassen
Verified project groups and image groups are stored in `data/balkone.json`:
- 2024 Balkon mit Solarkraftwerk
- 2024 Edelstahl-Balkongeländer mit Solarkraftwerk
- 2022 Glas & Edelstahl
- 2020 Stahlbalkon
- 2022 Terrasse mit Geländer
- 2016 Geschmiedeter Balkon
- 2002 Mehrstöckiger Stahlbalkon

### Carports, Dächer & Stahlbau
Verified project groups and image groups are stored in `data/stahlbau.json`:
- 2023 Fahrradhaus
- 2021 Pergola aus Stahlprofilen
- 2024 Pyramidendach mit Staubdeckenkonstruktion
- 2024 Carport mit Trapezblechdach
- 2024 Carport für drei Fahrzeuge

### Interior & Metallgestaltung
The public page was verified both from the supplied real iPhone Safari screenshots and from the successful direct source crawl. The exact page introduction is preserved in `data/interior.json`.

Verified Interior project groups, text and image groups:
- 2023 Schachtisch — hidden chessboard concept, forged pieces; public page states it received the Meisterpreis
- 2023 Feuerschale — project from Martin Larasser's Meisterschule 2022/23; customer-specific planning is emphasized
- 2021 Stehleuchte — Gesellenstück by Martin Larasser; public page states first prize in “Gute Form”; source also names Philipp Schumann and Peter Michael Reich
- 2018 Holzlege — wood storage and floor plate in oxidised/scaled steel, matched to the stove
- 2022 Gastronomieeinrichtung — individual solutions for commercial customers
- 2020 Schale / “The Space Between Us” — two curved metal surfaces, made during Martin Larasser's training in the Schmiede Peter Michael Reich
- 2020 Grafinger Bär — bronze bear with chiselled contours, coloured and waxed
- 2002 Badeinrichtung — gas-pressure-adjustable mirror, stainless-steel frame/structure and wooden shelf
- 2004 Sisyphus — forged from old carriage axles and a local boulder; located by the Heimatmuseum in Grafing according to the page

### Medallions
The public page was verified from the supplied Safari screenshots and by direct source crawl. `data/medallions.json` preserves the verified text plus 44 actual Medallion example images from the public gallery.

Verified:
- medallions are made from bronze
- hand-made stamps are used under glowing heat
- finishes include gilded, coloured, tin-plated and untreated, including combinations
- Larasser offers individually designed medallions and stamps for unique motifs
- the public page contains a broad gallery of different forms, motifs, hole patterns and surface treatments
- customers can bring their own ideas and have a personalised stamp and medallion made

### Lohnbiegen & Lohnschneiden
Verified machine facts:
- Baykal APHS 31160: 3100 mm Biegelänge, 160 t Presskraft, CNC-Steuerung, Stahl/Edelstahl/Aluminium/weitere Metalle, breite Werkzeugpalette, Falzen möglich
- Baykal HGL 3108: 3100 mm Schneidlänge, maximal 8 mm bei Stahl, verstellbarer Schnittwinkel, Stahl/Edelstahl/Aluminium/weitere Metalle

### Über uns
Verified:
- site describes Larasser as a Metallverarbeitungs-/Meisterbetrieb
- two masters and one journeyman are stated on this page
- founded in 1996

### Kontakt
Verified:
- opening hours: Mo–Do 07:30–16:00, Fr 07:30–12:00
- Stephan Larasser: Geschäftsführer, Planung und Kundenbetreuung; Mobil +49 171 5248966
- Martin Larasser: 3D Zeichner, Planung und Umsetzung; Mobil +49 177 3248147
- central phone +49 8092 709151
- address Ebersberger Straße 10 A, 85567 Grafing b. München
- contact page uses `stephan.larasser@t-online.de`

### Legal pages
Verified:
- Impressum exists and lists `info@larasser-metallbau.de`, fax +49 8092 709152, the two mobile numbers, EN 1090-2 EXC2 and Schweißfachmann EWS
- Datenschutz page exists; production replacement must be reviewed with the client rather than silently copied/changed

## Important source contradictions

Do not turn these into claims without client confirmation:
- start page text says currently three employees, but another start-page counter says four employees
- experience wording/numbers are not consistent across pages and time
- contact page uses `stephan.larasser@t-online.de`, while the legal imprint lists `info@larasser-metallbau.de`

Current demo therefore keeps `seit 1996`, `2 Meister` and `EN 1090-2 EXC2` as the safer prominent facts and uses `info@larasser-metallbau.de` as the central demo mail target. The public contact-page address is also exposed as a contact option rather than silently choosing one source over the other.

## Current demo parity status

Implemented on the redesign branch:
- mobile navigation is a full-screen opaque layer with background scroll locking/restoration for iOS/Android
- mobile typography uses controlled headline sizing, line-height and letter-spacing to avoid cramped/overlapping text
- reference and machine images are clipped to explicit frames/aspect ratios instead of protruding outside cards
- all verified Treppen, Tore, Balkone and Stahlbau project groups are rendered as actual project cards with their public image galleries, not empty filter results
- all nine verified Interior project groups are a first-class image-led section
- Medallions has its verified source text and a 44-image gallery with progressive disclosure
- project image galleries open in a navigable lightbox
- reference discovery includes category filters, counts, search and a progressively disclosed project archive
- Lohnbiegen/Lohnschneiden contains both Baykal machines, images and the verified specifications above
- contact section includes central phone, opening hours, both mobile numbers and the public contact-page email; footer retains the verified fax
- public Impressum and Datenschutz remain directly reachable
- demo remains `noindex,nofollow` and has no server-side form storage

The category/project source records and public hotlink URLs are kept separately in `data/*.json` so content parity can be tested and maintained without hiding source data inside presentation code.

## Visual / technical parity requirements

A change is not considered ready just because static checks pass. Before merge, QA must cover:
- desktop Chromium
- Android-sized Chromium with touch/mobile context
- iPhone-sized WebKit with touch/mobile context
- mobile menu opened after scrolling, not only at page top
- no horizontal overflow
- no content visible through/behind the open mobile menu
- reference and machine images contained by their frames
- heading/label spacing not overlapping
- fixed header not covering anchor targets
- filter, search, archive disclosure and lightbox interactions
- non-empty Balkone and Stahlbau filters with project images
- Interior and Medallions discoverability/content coverage
- Lohnfertigung prefill into inquiry form
- console/page errors
- generated screenshots reviewed visually after the automated run

## Remaining production work

These are production/handoff items, not reasons to invent content in the demo:
- obtain explicit client approval for final text, branding and image usage
- obtain approved original/local image files rather than permanently hotlinking the existing website
- choose final ordering/selection of project photos with Larasser
- host all approved images locally and privacy-safely
- confirm which public email address should be primary
- confirm current employee count and any experience counter before displaying either
- client/legal review of Impressum, Datenschutz and real form processing before production launch
