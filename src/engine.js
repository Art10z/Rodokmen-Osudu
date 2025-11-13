// Súbor: /src/engine.js

/**
 * engine.js - Mozog Hry
 * Tento súbor riadi herný stav, spracováva logiku príbehu a rozhodnutí.
 */

import * as ui from './ui.js';
import { ziskatAleboNacitatMedium, vycistiatStaruCache, ziskatObjektMediiZCache } from './engine/media.js';
import { ziskatDataSceny, nacitatPribehovySubor } from './engine/story.js';
import { pociatocnyStavHry, aplikovatEfekty } from './engine/state.js';

let stavHry = {};
let prebiehaPrechod = false;

    
// ...existing code...
// ...existing code...

/**
 * Získa médium z cache alebo ho načíta.
 * Vráti Promise, ktorý sa vyrieši s Blob URL.
 * Ak načítanie zlyhá, vráti pôvodnú URL.
 * @param {string} url - URL média na načítanie.
 * @returns {Promise<string>} Promise, ktorý vráti URL (ideálne Blob URL).
 */
// ...existing code...
// ...existing code...
// ...existing code...
// Odstránené: vycistiatStaruCache a ziskatAleboNacitatMedium (používaj importované z media.js)

/**
 * Pripraví všetky médiá pre danú scénu (načíta ich do cache).
 * @param {object} scena - Objekt scény s kľúčom 'media'.
 */
async function pripravitMediaPreScenu(scena) {
    const mediaUrls = new Set();
    if (scena?.media) {
        Object.values(scena.media).forEach(url => mediaUrls.add(url));
    }
    if (scena?.moznosti) {
        scena.moznosti.forEach(volba => {
            if (volba.reakcia?.media) {
                Object.values(volba.reakcia.media).forEach(url => mediaUrls.add(url));
            }
        });
    }
    const promises = Array.from(mediaUrls).map(url => ziskatAleboNacitatMedium(url));
    await Promise.all(promises);
}


/**
 * Vytvorí nový objekt médií s URL adresami z cache.
 * @param {object} mediaObj - Pôvodný objekt s URL adresami.
 * @returns {Promise<object|null>} Nový objekt s Blob URL alebo null.
 */
// Presunuté do media.js
// --- KONIEC NOVÉHO SYSTÉMU PRE MÉDIÁ ---

function parsovatOdkazNaScenu(odkaz) {
    const separator = '.json_';
    const indexSeparatoru = odkaz.indexOf(separator);
    if (indexSeparatoru !== -1) {
        const nazovSuboru = odkaz.substring(0, indexSeparatoru + 5);
        const idSceny = odkaz.substring(indexSeparatoru + 6);
        return { nazovSuboru, idSceny };
    }
    return { nazovSuboru: null, idSceny: odkaz };
}

async function preloadNextScenesMedia(currentScene) {
    if (!currentScene.moznosti) return;

    const urlsToPreload = new Set();

    for (const volba of currentScene.moznosti) {
        if (volba.reakcia?.media) {
            Object.values(volba.reakcia.media).forEach(url => urlsToPreload.add(url));
        }

        const odkazNaScenu = volba.dalsia_scena;
        if (!odkazNaScenu || odkazNaScenu.startsWith('END_')) continue;
        
        const { nazovSuboru, idSceny } = parsovatOdkazNaScenu(odkazNaScenu);
        if (nazovSuboru) {
            await nacitatPribehovySubor(nazovSuboru);
        }
        
        const nextSceneData = ziskatDataSceny(idSceny);
        if (nextSceneData?.media) {
            Object.values(nextSceneData.media).forEach(url => urlsToPreload.add(url));
        }
        
        // Preload prechodového videa pre túto voľbu
        if (currentScene.id && idSceny) {
            const prechodUrl = `/pribeh/prechod-${currentScene.id}-${idSceny}.mp4`;
            urlsToPreload.add(prechodUrl);
        }
    }
    
    // Spustí prednačítanie na pozadí bez čakania
    urlsToPreload.forEach(url => ziskatAleboNacitatMedium(url).catch(() => {}));
}

// Presunuté do story.js

// Presunuté do story.js

async function spracovatPrechod(odkazNaScenu) {
    const { nazovSuboru, idSceny } = parsovatOdkazNaScenu(odkazNaScenu);
    if (nazovSuboru) {
        await nacitatPribehovySubor(nazovSuboru);
    }
    vykreslitScenu(idSceny);
}

// Presunuté do state.js

// Presunuté do state.js

function jeVolbaDostupna(volba) {
    // --- ZAČIATOK KĽÚČOVEJ ZMENY ---
    if (volba.nesmieMat) {
        const { inventar } = volba.nesmieMat;
        if (inventar && stavHry.inventar.includes(inventar)) {
            return false; // Skryje voľbu, ak hráč už má daný predmet
        }
    }
    // --- KONIEC KĽÚČOVEJ ZMENY ---

    if (!volba.vyzaduje) return true;
    const { inventar, statistiky } = volba.vyzaduje;
    if (inventar && !stavHry.inventar.includes(inventar)) return false;
    if (statistiky) {
        for (const stat in statistiky) {
            const podmienka = String(statistiky[stat]);
            const operator = podmienka.charAt(0);
            const hodnota = parseInt(podmienka.substring(1), 10);
            const statHraca = stavHry.statistiky[stat];
            if (operator === '>' && statHraca <= hodnota) return false;
            if (operator === '<' && statHraca >= hodnota) return false;
        }
    }
    return true;
}

async function vykreslitScenu(idSceny) {
    const scena = ziskatDataSceny(idSceny);
    if (!scena) return;

    await pripravitMediaPreScenu(scena);
    const mediaZCache = await ziskatObjektMediiZCache(scena.media);

    // --- SKRYTÉ PRELOADOVANIE PRECHODOVÝCH ANIMÁCIÍ ---
    if (scena.moznosti && Array.isArray(scena.moznosti)) {
        scena.moznosti.forEach(volba => {
            if (volba.dalsia_scena) {
                const { nazovSuboru, idSceny: dalsiaId } = parsovatOdkazNaScenu(volba.dalsia_scena);
                if (idSceny && dalsiaId) {
                    const prechodUrl = `/pribeh/prechod-${idSceny}-${dalsiaId}.mp4`;
                    // Preload do cache, bez zobrazenia
                    ziskatAleboNacitatMedium(prechodUrl).catch(() => {});
                }
            }
        });
    }
    
    const predoslIdSceny = stavHry.idAktualnejSceny;
    stavHry.idAktualnejSceny = idSceny;

    if (scena.typ === 'zadanieMena') {
        ui.zobrazitZadanieMena(mediaZCache);
        await ui.aktualizovatPanelStavu(stavHry, null, 0);
        ui.aktualizovatPanelInventara(stavHry);
        return;
    }

    if (scena.lokacia) {
        stavHry.hrac.miesto = scena.lokacia;
    }

    // === POKUS O PRECHODOVÉ VIDEO (ak prichádzame z inej scény) ===
    if (predoslIdSceny && predoslIdSceny !== 'NAME_ENTRY' && predoslIdSceny !== idSceny) {
        const prechodUrl = `/pribeh/prechod-${predoslIdSceny}-${idSceny}.mp4`;
        const prechodBlobUrl = await ziskatAleboNacitatMedium(prechodUrl);
        
        if (prechodBlobUrl && prechodBlobUrl.startsWith('blob:')) {
            console.log(`🔄 Prehrávam prechodové video: prechod-${predoslIdSceny}-${idSceny}.mp4`);
            
            // Zobraz prechodové video ako médium (funkcia v ui.js ho musí prehrať jednorazovo)
            const prechodMedia = { animacia: prechodBlobUrl };
            ui.zmenitMedia(prechodMedia);
            
            // Počkaj na dokončenie prechodového videa (približne 2-3 sekundy)
            await new Promise(resolve => setTimeout(resolve, 2500));
        }
    }

    ui.zmenitMedia(mediaZCache);
    ui.aktualizovatOvladacePanelov(scena);
    await ui.aktualizovatPanelStavu(stavHry, null, 0);
    ui.aktualizovatPanelInventara(stavHry);

    await ui.odkrytObrazovku();

    const dlzkaScenyMs = (scena.dlzka_sceny || scena.pribeh?.dlzka_sceny || 5) * 1000;
    const posunCasu = scena.posun_casu || 0;
    if (posunCasu > 0) {
        ui.animovatCas(stavHry.cas, posunCasu, dlzkaScenyMs);
    }

    if (scena.pribeh?.text) {
        const VYROVNANIE_CITANIA_MS = 2000;
        const dlzkaPisania = Math.max(0, dlzkaScenyMs - VYROVNANIE_CITANIA_MS);
        await ui.vypisatText(scena.pribeh.text, dlzkaPisania / 1000);
        await new Promise(resolve => setTimeout(resolve, VYROVNANIE_CITANIA_MS));
    } else {
        await new Promise(resolve => setTimeout(resolve, dlzkaScenyMs));
    }

    if (scena.typ === 'auto') {
        prebiehaPrechod = true;
        await ui.zatmavitObrazovku();
        await ui.vypisatText('', 0); 
        prebiehaPrechod = false;
        if (stavHry.idAktualnejSceny === idSceny) {
            spracovatPrechod(scena.dalsia_scena);
        }
    } else if (scena.typ === 'manual') {
        prebiehaPrechod = false;
        const dostupneVolby = scena.moznosti.filter(jeVolbaDostupna);
        ui.zobrazitVolby(dostupneVolby, vybratVolbu);
        preloadNextScenesMedia(scena);
    }
}

async function vybratVolbu(volba) {
    if (prebiehaPrechod) return;
    prebiehaPrechod = true;
    ui.vymazatVolby();
    const staryStav = JSON.parse(JSON.stringify(stavHry));
    aplikovatEfekty(stavHry, volba.efekty);
    ui.aktualizovatPanelInventara(stavHry);
    const casNaPosun = volba.posun_casu || 0;
    
    const reakcia = volba.reakcia;
    if (reakcia) {
        await pripravitMediaPreScenu({ media: reakcia.media });
    }
    const reakciaZCache = reakcia ? { ...reakcia, media: await ziskatObjektMediiZCache(reakcia.media) } : undefined;

    await ui.spustitPrechodSceny(staryStav, stavHry, reakciaZCache, casNaPosun);
    
    spracovatPrechod(volba.dalsia_scena);
}

async function potvrditMeno() {
    const meno = ui.ziskatMenoZInputu();
    stavHry.hrac.meno = meno || pociatocnyStavHry.hrac.meno;
    await ui.skrytUvodnuObrazovku(stavHry);
    vykreslitScenu('PROLOGUE_ANIMATION');
}

function restartovatHru() {
    location.reload();
}

async function hlavnaFunkcia() {
    ui.nastavitListenery({ potvrditMeno, restartovatHru });
    try {
        await nacitatPribehovySubor('A_prolog.json');
        
        await pripravitMediaPreScenu(ziskatDataSceny('NAME_ENTRY'));
        await pripravitMediaPreScenu(ziskatDataSceny('PROLOGUE_ANIMATION'));
        await pripravitMediaPreScenu(ziskatDataSceny('uvod_prebudenie'));

        stavHry = JSON.parse(JSON.stringify(pociatocnyStavHry));
        stavHry.cas = new Date(stavHry.cas);
        vykreslitScenu(stavHry.idAktualnejSceny);
    } catch (chyba) {
        console.error("Kritická chyba počas inicializácie hry.", chyba);
    }
}

document.addEventListener('DOMContentLoaded', hlavnaFunkcia);

