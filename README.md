# Knihovnický skener a osobní knihovna

Mobilní webová aplikace pro knihovníky a čtenáře. Umožňuje skenovat čárové kódy knih, rozpoznávat vytištěná ISBN pomocí fotoaparátu a přidávat knihy ručně. Údaje o knihách lze vyhledat v katalogu Knihovny.cz a doplňkově ve službách Google Books a Open Library.

## Funkce

- Skenování čárových kódů fotoaparátem telefonu.
- Rozpoznávání vytištěného ISBN pomocí OCR a ruční zadání ISBN.
- Ruční přidání knihy bez ISBN.
- Ukládání knih a knihoven v prohlížeči pomocí `localStorage`; aplikace nemá backend.
- Správa knih včetně úprav, duplikování, mazání, filtrování, řazení a evidence množství a stavu čtení.
- Export knih do PDF, Excelu a CSV.
- Český, anglický a španělský jazyk a osm barevných motivů.
- Nasazení na GitHub Pages přes GitHub Actions.

## Spuštění lokálně

1. Nainstalujte závislosti:

   ```bash
   npm ci
   ```

2. Spusťte vývojový server:

   ```bash
   npm run dev
   ```

3. Pro vytvoření produkční verze použijte:

   ```bash
   npm run build
   ```

Testy spustíte příkazem `npm test` a kontrolu kódu příkazem `npm run lint`.

## Nasazení na GitHub Pages

Workflow v `.github/workflows/deploy.yml` sestaví a publikuje aplikaci při pushi do větve `main` nebo `master`. Nasazení lze spustit také ručně z GitHub Actions. V nastavení repozitáře musí být GitHub Pages nastavené na použití GitHub Actions.

Pro skenování na telefonu otevřete publikovanou stránku přes HTTPS a povolte jí přístup ke kameře. Knihy a nastavení se ukládají pouze v prohlížeči daného zařízení.
