# Knihovnický Skener & Osobní Knihovna

Aplikace pro mobilní telefony (Android / iOS) a webové prohlížeče určená pro knihovníky a čtenáře. Umožňuje skenovat čárové kódy knih a ISBN čísla pomocí fotoaparátu mobilu nebo ručního zadání, automaticky dohledává informace o knihách a ukládá je do osobní knihovny.

## Funkce
- 📱 **Mobilní skener čárových kódů** (přímý přístup k fotoaparátu telefonu v prohlížeči)
- ⌨️ **Ruční zadání ISBN**
- 🔍 **Vícezdrojové vyhledaávání:** Knihovny.cz ➔ Google Books API ➔ Open Library API
- 📚 **Přehledná knihovna:** Seznam uložených knih s názvem, autorem, rokem vydání a nakladatelstvím
- 🗑️ **Správa knihovny:** Možnost mazání a vyhledávání v knihovně
- 🌙 **Moderní dark minimalistické UI** v tmavě modrých tónech
- ⚡ **Běh bez databáze:** Všechna data jsou uložena přímo v prohlížeči zařízením uživatele (`localStorage`)
- 🌐 **Připraveno pro GitHub Pages**

---

## Jak spustit lokálně

1. Nainstalujte závislosti:
   ```bash
   npm install
   ```

2. Spusťte vývojový server:
   ```bash
   npm run dev
   ```

3. Spusťte testy:
   ```bash
   npm test
   ```

---

## Nastavení na GitHubu (GitHub Pages)

Aplikace je navržena k přímému hostování na **GitHub Pages**:

1. Vložte kód do svého GitHub repozitáře.
2. V nastavení repozitáře (**Settings ➔ Pages**):
   - V sekci **Build and deployment** nastavte **Source** na **GitHub Actions**.
3. Při každém pushnutí do větve `main` (nebo `master`) automatická workflow v `.github/workflows/deploy.yml` sestaví aplikaci a publikuje ji na vašem GitHub Pages webu.
4. Stránku otevřete na svém mobilním telefonu (Android/iOS) přes HTTPS v prohlížeči Chrome nebo Firefox a můžete ihned skenovat knížky fotoaparátem!
