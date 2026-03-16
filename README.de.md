# Faaahhh

Faaahhh ist eine VS Code-Erweiterung, die einen Ton abspielt, wenn Testläufe fehlschlagen.

## Funktionen

- Erkennt fehlgeschlagene Testläufe von integrierten Terminal-Testbefehlen.
- Erkennt fehlgeschlagene testorientierte Tasks aus VS Code Task-Prozessende-Ereignissen.
- Verwendet Testing-API-Ergebnisereignisse, wenn sie in der Runtime-API-Oberfläche verfügbar sind.
- Wendet Cooldown- und Deduplizierungslogik an, um wiederholtes Spam zu vermeiden.
- Unterstützt gebündelte Audio- und benutzerdefinierte Audiodateipfade.
- Bietet den Befehl `Faaahhh: Test Sound` für eine schnelle Validierung.
- Schreibt Erkennungs- und Wiedergabeprotokolle in den Ausgabekanal `Faaahhh`.

## Konfiguration

- `faaahhh.enabled`: Aktiviert oder deaktiviert die Wiedergabe.
- `faaahhh.cooldownMs`: Minimale Zeit zwischen abgespielten Tönen.
- `faaahhh.audioSource`: `bundled` oder `custom`.
- `faaahhh.customAudioPath`: Absoluter Pfad für benutzerdefinierte Audiodatei.
- `faaahhh.terminalCommandPatterns`: Befehlsfragmente, die als Tests erkannt werden.
- `faaahhh.dedupeWindowMs`: Duplikatunterdrückungsfenster für überlappende Detektoren.

## Hinweise

- Die gebündelte Datei `media/faaahhh.mp3` ist als Platzhalter-Asset in diesem Repository enthalten. Ersetzen Sie sie vor der Veröffentlichung durch Ihren bevorzugten finalen Ton.
- Unter Linux und macOS verwendet die Erweiterung System-Audioplayer (`paplay`, `aplay`, `ffplay`, `afplay`), wenn verfügbar.
- Unter Windows verwendet die Wiedergabe derzeit PowerShell `Media.SoundPlayer`, das am zuverlässigsten mit WAV-Dateien funktioniert.
- Die Abdeckung der Testing-API hängt von der Runtime-API-Unterstützung und der Testanbieter-Integration ab.

## Entwicklung

- Abhängigkeiten installieren: `npm install`
- Erstellen: `npm run build`
- Testen: `npm test`

## Befehl

- `Faaahhh: Test Sound` (`faaahhh.testSound`)
