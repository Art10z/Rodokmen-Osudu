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

## Štruktúra
- `index.html` – statická kostra UI (panely, audio/video prvky)
- `src/engine.js` – herná logika, načítanie JSON príbehov, prechody, cache médií
- `src/ui.js` – DOM manipulácia, animácie, hudba, výpis textu, panely
- `src/styles/` – štýly UI
- `public/pribeh/` – JSON scény, obrázky a zvuky (načítavané cez fetch)

## JSON príbehy
Príklady súborov: `public/pribeh/A_prolog.json` a ďalšie. Každá scéna má typ (auto/manual/zadanieMena), text, médiá a voľby s efektmi. 

> Projekt je v ranom štádiu – špecifikácia formátu sa môže meniť.

## Licencia
TBD
