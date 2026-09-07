# Larasser public-site source audit

Purpose: make sure the demo does not silently lose useful information from the existing public website and does not invent missing facts.

Audit date: 2026-09-07

## Rule

The redesign should be better in navigation, readability, responsiveness and conversion while preserving the useful public information and project breadth of the current Larasser site. Conflicting or inaccessible claims are not guessed.

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
Verified project groups found in the public archive:
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
Verified project groups:
- 2019 Klassisches Schmiedetor
- 2025 Gartenzaunanlage/Tore
- 2022 Gartentor & Zaun
- 2023 Moderne Toranlage
- 2021 Geschmiedetes Gartentor / Restauration
- 2019 Friedhofstor & Zaunanlage

### Balkone & Terrassen
Verified project groups:
- 2024 Balkon mit Solarkraftwerk
- 2024 Edelstahl-Balkongeländer mit Solarkraftwerk
- 2022 Glas & Edelstahl
- 2020 Stahlbalkon
- 2022 Terrasse mit Geländer
- 2016 Geschmiedeter Balkon
- 2002 Mehrstöckiger Stahlbalkon

### Carports, Dächer & Stahlbau
Verified project groups:
- 2023 Fahrradhaus
- 2021 Pergola aus Stahlprofilen
- 2024 Pyramidendach mit Staubdeckenkonstruktion
- 2024 Carport mit Trapezblechdach
- 2024 Carport für drei Fahrzeuge

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

### Legal pages
Verified:
- Impressum exists and lists `info@larasser-metallbau.de`, fax +49 8092 709152, the two mobile numbers, EN 1090-2 EXC2 and Schweißfachmann EWS
- Datenschutz page exists; production replacement must be reviewed with the client rather than silently copied/changed

## Important source contradictions

Do not turn these into claims without client confirmation:
- start page text says currently three employees, but another start-page counter says four employees
- experience wording/numbers are not consistent across pages and time
- contact page uses `stephan.larasser@t-online.de`, while the legal imprint lists `info@larasser-metallbau.de`

Current demo therefore keeps `seit 1996`, `2 Meister` and `EN 1090-2 EXC2` as the safer prominent facts and uses `info@larasser-metallbau.de` as the central demo mail target.

## Sections not fully retrievable by the audit tooling

The navigation confirms separate public sections for:
- Interior
- Medallions

Their pages could not be reliably extracted by the web parser during this audit. The demo must not invent project names, specifications or descriptions for them. Until their contents can be verified directly, the demo preserves discoverability by linking to the existing official sections.

## Current demo parity status

Verified on the current redesign branch:
- mobile navigation is a full-screen layer with background scroll locking/restoration for iOS/Android
- mobile header is opaque so scrolling content cannot visually bleed through it
- mobile typography has relaxed headline sizing, line-height and letter-spacing to avoid cramped/overlapping text
- reference and machine images are clipped to explicit frames/aspect ratios instead of protruding outside cards
- all verified Treppen/Tore/Balkone/Stahlbau project groups above are represented either as detailed cards or in the filterable archive
- several Treppen/Tore projects now have multi-image lightbox galleries using images from the public Larasser site
- Lohnbiegen/Lohnschneiden contains both Baykal machines, images and the verified specifications above
- contact section includes central phone, opening hours and the two verified mobile numbers; footer retains the verified fax
- public Impressum and Datenschutz remain directly reachable
- Interior and Medallions remain explicitly linked to the official public sections rather than being fabricated
- demo remains `noindex,nofollow` and has no server-side form storage

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
- filter and lightbox interactions
- Lohnfertigung prefill into inquiry form
- console/page errors
- screenshots reviewed visually after the automated run

## Remaining content work before a production replacement

- obtain/confirm full Interior project content and images
- obtain/confirm full Medallions project content and images
- choose the final subset/order of project photos with Larasser
- host approved images locally instead of hotlinking the existing website
- confirm which public email address should be primary
- confirm current employee count and any experience counter before displaying either
- client review of legal pages and real form processing before production launch
