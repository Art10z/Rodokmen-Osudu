# Rodokmeň Osudu

Interaktívna príbehová hra postavená na Vite, čistej HTML/CSS/JS architektúre s oddelením logiky (engine) a prezentácie (UI).

## Požiadavky
- Node.js 18+

## Lokálny beh
```bash
npm install
npm run dev
```
Aplikácia sa sprístupní na adrese, ktorú vypíše Vite (typicky http://localhost:5173).

## Build a preview
```bash
npm run build
npm run preview
```


## Štruktúra a optimalizácie
- `index.html` – statická kostra UI (panely, audio/video prvky)
- `src/engine.js` – hlavný mozog hry, koordinuje moduly
- `src/engine/media.js` – správa cache médií, načítanie a optimalizácia fetch požiadaviek
- `src/engine/story.js` – načítanie a cache JSON príbehov
- `src/engine/state.js` – herný stav, štatistiky, inventár, aplikácia efektov
- `src/ui.js` – DOM manipulácia, animácie, hudba, výpis textu, panely
- `src/styles/` – štýly UI
- `public/pribeh/` – JSON scény, obrázky a zvuky (načítavané cez fetch)

### Optimalizácie načítania médií
- Dedikovaná cache médií (Blob URL, automatické čistenie najstarších položiek)
- Deduplikácia fetch požiadaviek (žiadne duplicitné načítanie rovnakého média)
- Skryté preloadovanie prechodových animácií (rýchlejšie prechody medzi scénami)
- Možnosť obmedziť počet paralelných fetchov (úprava v media.js)

### Odporúčania pre výkon
- Komprimovať videá a obrázky podľa README (viď sekcia Optimalizácia Médií)
- Pri slabšom hardvéri zmenšiť veľkosť cache v media.js
- Zatvoriť ostatné aplikácie pri hraní na slabšom notebooku

### Príspevky a rozšírenia
- Nové moduly je možné pridávať do `src/engine/` podľa potreby (napr. save/load, štatistiky, galéria)


## JSON príbehy
Príklady súborov: `public/pribeh/A_prolog.json` a ďalšie. Každá scéna má typ (auto/manual/zadanieMena), text, médiá a voľby s efektmi. 

> Projekt je v aktívnom vývoji – špecifikácia formátu a architektúry sa môže meniť podľa optimalizácií a refaktorov.

## Licencia
TBD
