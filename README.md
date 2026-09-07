# Metallbau Larasser – Website-Demo

Unverbindlicher, vollständig getrennt entwickelter Demo-Auftritt für Metallbau & Metallgestaltung Larasser in Grafing bei München.

## Ziel

Die Demo zeigt, wie der bestehende Webauftritt moderner, klarer und anfrageorientierter werden könnte, ohne das aktuelle Produktivsystem anzufassen.

Schwerpunkte:
- klarer mobiler Einstieg und moderne Leistungsdarstellung
- prominente Referenzen aus dem bestehenden öffentlichen Webauftritt
- eigener Bereich für Lohnbiegen & Lohnschneiden mit vorhandenen Maschinendaten
- strukturierte Projektanfrage mit Projektart, Material, Maßen, Stückzahl, Ort und Dateien
- lokale Demo-Funktion: Aus den Angaben wird nur eine E-Mail vorbereitet; es gibt noch kein Backend und keine Speicherung
- zentrale Kontaktadresse `info@larasser-metallbau.de` entsprechend dem öffentlichen Impressum
- `noindex,nofollow`, damit die Demo nicht als echte Unternehmensseite indexiert werden soll

## Quellenbasis

Inhalte und Projektdaten wurden ausschließlich aus dem öffentlich erreichbaren bestehenden Webauftritt von `larasser-metallbau.de` übernommen bzw. daraus vorsichtig neu formuliert. Wo die aktuelle Website widersprüchliche Angaben enthält (z. B. Mitarbeiterzahl / Erfahrungsjahre), vermeidet die Demo diese Zahlen und verwendet stattdessen belastbare Angaben wie `seit 1996`, `2 Meister` und `EN 1090-2 EXC2`.

Die Projektbilder werden in dieser frühen Demo direkt von der bestehenden öffentlichen Website geladen. Vor einem echten Produktivstart sollten Bilder, Logo/Branding und Texte mit Larasser abgestimmt und lokal bzw. datenschutzgerecht eingebunden werden.

## Technik

Reine statische Demo ohne Build-Schritt:
- `index.html`
- `styles.css`
- `script.js`

Damit kann die Seite später unkompliziert über einen separaten Preview-Host veröffentlicht werden.

Netlify-Preview ist ausschließlich mit diesem separaten Larasser-Repository verbunden.

## Wichtig vor Produktion

Vor einer echten Veröffentlichung:
1. Inhalte, Ansprechpartner und Kontaktadresse final bestätigen.
2. Bildrechte und gewünschte Projektauswahl bestätigen.
3. Formularzustellung mit Backup/Testempfänger einrichten und testen.
4. Datenschutz/Impressum und externe Ressourcen prüfen.
5. Erst danach die bestehende Live-Seite ändern oder ersetzen.
