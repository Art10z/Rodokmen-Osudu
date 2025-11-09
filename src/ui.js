// Súbor: /src/ui.js

/**
 * UI.js - Ruky a Oči Hry
 * Tento súbor má na starosti VÝHRADNE manipuláciu s HTML (DOM).
 */

const dom = {
    statusPanel: document.querySelector('.status-panel'),
    inventoryPanel: document.getElementById('inventory-panel'),
    storyPanel: document.querySelector('.story-panel'),
    playerName: document.getElementById('player-name'),
    timeDisplay: document.getElementById('time-display'),
    dateDisplay: document.getElementById('date-display'),
    locationDisplay: document.getElementById('location-display'),
    moodLabel: document.getElementById('mood-label'),
    moodGauge: document.getElementById('mood-gauge'),
    sceneVideo: document.getElementById('scene-video'),
    sceneMedia: document.getElementById('scene-media'),
    sceneAudio: document.getElementById('scene-audio'),
    themeMusic: document.getElementById('theme-music'), // OPRAVENÉ: Pridaná referencia
    storyText: document.getElementById('story-text-content'),
    choicesContainer: document.getElementById('choices-container'),
    introOverlay: document.getElementById('intro-overlay'),
    loadingState: document.getElementById('loading-state'),
    nameEntryState: document.getElementById('name-entry-state'),
    nameInput: document.getElementById('name-input'),
    confirmNameButton: document.getElementById('confirm-name-button'),
    restartButton: document.getElementById('restart-button'),
    restartModal: document.getElementById('restart-modal'),
    restartConfirmButton: document.getElementById('restart-confirm-button'),
    restartCancelButton: document.getElementById('restart-cancel-button'),
    topPanelHandle: document.getElementById('top-panel-handle'),
    bottomPanelHandle: document.getElementById('bottom-panel-handle'),
    introBackgroundImage: document.getElementById('intro-background-image'),
    inventoryItems: document.getElementById('inventory-items-container'),
    transitionOverlay: document.getElementById('transition-overlay'),
};

let zvukOdomknuty = false;
let intervalZmenyHlasitosti = null;

function odomknutZvuk() {
    if (zvukOdomknuty) return;
    zvukOdomknuty = true;
    console.log("Zvuk bol povolený interakciou používateľa.");
}

function zmenitHlasitost(audioElement, novaHlasitost, trvanie = 1000) {
    if (intervalZmenyHlasitosti) clearInterval(intervalZmenyHlasitosti);
    
    const pociatocnaHlasitost = audioElement.volume;
    const zmena = novaHlasitost - pociatocnaHlasitost;
    if (Math.abs(zmena) < 0.01) {
        audioElement.volume = novaHlasitost;
        return;
    }

    const casKroku = 50;
    const pocetKrokov = trvanie / casKroku;
    let aktualnyKrok = 0;

    intervalZmenyHlasitosti = setInterval(() => {
        aktualnyKrok++;
        if (aktualnyKrok > pocetKrokov) {
            clearInterval(intervalZmenyHlasitosti);
            audioElement.volume = novaHlasitost;
            return;
        }
        audioElement.volume = pociatocnaHlasitost + (zmena * (aktualnyKrok / pocetKrokov));
    }, casKroku);
}

export function prehratTematickuHudbu() {
    if (!zvukOdomknuty || dom.themeMusic.src) return;

    dom.themeMusic.src = '/pribeh/zvuky/Theme_music_A.mp3';
    dom.themeMusic.volume = 0;
    
    dom.themeMusic.play().then(() => {
        console.log("Hudba sa začala prehrávať.");
        zmenitHlasitost(dom.themeMusic, 0.2, 2000); 
    }).catch(e => console.error("Chyba pri prehrávaní tematickej hudby:", e));
}

export function zobrazitVolby(volby, onVolbaVybrata) {
    zmenitHlasitost(dom.themeMusic, 0.6, 1500);

    dom.choicesContainer.innerHTML = '';
    dom.choicesContainer.className = 'choices-container';
    if (!volby || volby.length === 0) return;

    dom.choicesContainer.classList.add(`choices-count-${volby.length}`);
    volby.forEach(volba => {
        const tlacitko = document.createElement('button');
        tlacitko.textContent = volba.text;
        tlacitko.onclick = () => onVolbaVybrata(volba);
        tlacitko.addEventListener('mouseenter', () => zobrazitNahladStatistik(volba));
        tlacitko.addEventListener('mouseleave', skrytNahladStatistik);
        dom.choicesContainer.appendChild(tlacitko);
    });

    if (!dom.storyPanel.classList.contains('top-panel-open')) {
        dom.storyPanel.classList.add('top-panel-open');
    }
}

export function vymazatVolby() {
    zmenitHlasitost(dom.themeMusic, 0.2, 1500);

    skrytNahladStatistik();
    dom.choicesContainer.innerHTML = '';
    dom.storyPanel.classList.remove('top-panel-open');
}

export function nastavitListenery(engine) {
    dom.confirmNameButton.addEventListener('click', () => {
        odomknutZvuk();
        engine.potvrditMeno();
    });
    dom.nameInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            odomknutZvuk();
            engine.potvrditMeno();
        }
    });

    dom.choicesContainer.addEventListener('click', odomknutZvuk, { once: true });

    dom.topPanelHandle.addEventListener('click', () => dom.storyPanel.classList.toggle('top-panel-open'));
    dom.bottomPanelHandle.addEventListener('click', () => dom.storyPanel.classList.toggle('bottom-panel-open'));
    dom.restartButton.addEventListener('click', () => dom.restartModal.classList.remove('hidden'));
    dom.restartCancelButton.addEventListener('click', () => dom.restartModal.classList.add('hidden'));
    dom.restartConfirmButton.addEventListener('click', () => engine.restartovatHru());
}

// --- Zvyšok súboru ui.js (bez zmien) ---
export const TRVANIE_ZATMAVENIA = 1200;
export function zatmavitObrazovku() { dom.transitionOverlay.classList.add('visible'); return new Promise(resolve => setTimeout(resolve, TRVANIE_ZATMAVENIA)); }
export function odkrytObrazovku() { if (!dom.transitionOverlay.classList.contains('visible')) { return Promise.resolve(); } dom.transitionOverlay.classList.remove('visible'); return new Promise(resolve => setTimeout(resolve, TRVANIE_ZATMAVENIA)); }
function formatovatNazovPredmetu(idPredmetu) { return idPredmetu.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); }
export function aktualizovatPanelInventara(stavHry) { if (!dom.inventoryItems) return; dom.inventoryItems.innerHTML = ''; if (stavHry.inventar.length === 0) { dom.inventoryItems.innerHTML = '<p class="empty-inventory">Prázdny</p>'; return; } stavHry.inventar.forEach(idPredmetu => { const celyNazov = formatovatNazovPredmetu(idPredmetu); const skratka = celyNazov.split(' ').map(slovo => slovo[0] || '').join(''); const prvok = document.createElement('div'); prvok.className = 'inventory-item'; prvok.textContent = skratka; prvok.title = celyNazov; dom.inventoryItems.appendChild(prvok); }); }
function skrytNahladStatistik() { document.querySelectorAll('.stat .stat-effect-indicator.visible').forEach(indicator => { indicator.classList.remove('visible', 'positive', 'negative'); }); }
function zobrazitNahladStatistik(volba) { skrytNahladStatistik(); if (!volba.efekty) return; if (volba.efekty.statistiky) { for (const stat in volba.efekty.statistiky) { const hodnota = volba.efekty.statistiky[stat]; if (hodnota === 0) continue; const prvokStatu = document.querySelector(`.stat[data-stat="${stat}"]`); if (prvokStatu) { const indikator = prvokStatu.querySelector('.stat-effect-indicator'); if (indikator) { indikator.classList.add(hodnota > 0 ? 'positive' : 'negative', 'visible'); } } } } }
function animovatPercenta(prvok, start, end, trvanie) { return new Promise(resolve => { if (start === end || trvanie <= 0) { prvok.textContent = `${Math.round(end)}%`; resolve(); return; } const rozsah = end - start; let casStartu = null; function krok(timestamp) { if (!casStartu) casStartu = timestamp; const progres = Math.min((timestamp - casStartu) / trvanie, 1); const aktualne = start + rozsah * progres; prvok.textContent = `${Math.round(aktualne)}%`; if (progres < 1) { requestAnimationFrame(krok); } else { prvok.textContent = `${Math.round(end)}%`; resolve(); } } requestAnimationFrame(krok); }); }
export function animovatCas(objektCasu, minutyNaPridanie, trvanie) { return new Promise(resolve => { if (minutyNaPridanie <= 0 || trvanie <= 0) { objektCasu.setMinutes(objektCasu.getMinutes() + minutyNaPridanie); resolve(); return; } const pociatocnyCasMs = objektCasu.getTime(); const konecnyCasMs = pociatocnyCasMs + minutyNaPridanie * 60 * 1000; let startAnimacie = null; function krok(timestamp) { if (!startAnimacie) startAnimacie = timestamp; const progres = Math.min((timestamp - startAnimacie) / trvanie, 1); const aktualnyCas = new Date(pociatocnyCasMs + (konecnyCasMs - pociatocnyCasMs) * progres); dom.timeDisplay.innerHTML = `${String(aktualnyCas.getHours()).padStart(2, '0')}<span class="colon">:</span>${String(aktualnyCas.getMinutes()).padStart(2, '0')}`; dom.dateDisplay.textContent = aktualnyCas.toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); if (progres < 1) { requestAnimationFrame(krok); } else { objektCasu.setTime(konecnyCasMs); dom.timeDisplay.innerHTML = `${String(objektCasu.getHours()).padStart(2, '0')}<span class="colon">:</span>${String(objektCasu.getMinutes()).padStart(2, '0')}`; dom.dateDisplay.textContent = objektCasu.toLocaleDateString('sk-SK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); resolve(); } } requestAnimationFrame(krok); }); }
export async function aktualizovatPanelStavu(novyStav, staryStav, trvanie) { if (!dom.playerName) return; const { hrac, statistiky } = novyStav; dom.playerName.textContent = hrac.meno; dom.locationDisplay.textContent = hrac.miesto; const slubyAnimacii = []; let celkoveStatistiky = 0, pocetStatistik = 0; for (const kluc in statistiky) { const prvokStatu = document.querySelector(`.stat[data-stat="${kluc}"]`); if (prvokStatu) { const hodnota = statistiky[kluc]; const bar = prvokStatu.querySelector('.bar'); const textHodnoty = prvokStatu.querySelector('span'); if (staryStav && trvanie > 0) { bar.style.transitionDuration = `${trvanie}ms`; slubyAnimacii.push(animovatPercenta(textHodnoty, staryStav.statistiky[kluc], hodnota, trvanie)); } else { bar.style.transitionDuration = '0ms'; textHodnoty.textContent = `${Math.round(hodnota)}%`; } bar.style.width = `${hodnota}%`; celkoveStatistiky += hodnota; pocetStatistik++; } } const hodnotaNalady = pocetStatistik > 0 ? celkoveStatistiky / pocetStatistik : 50; dom.moodGauge.style.transitionDuration = trvanie > 0 ? '0.8s' : '0s'; dom.moodGauge.style.left = `${hodnotaNalady}%`; if (hodnotaNalady < 20) dom.moodLabel.textContent = 'Psychicky na dne'; else if (hodnotaNalady < 50) dom.moodLabel.textContent = 'Menšia depresia'; else if (hodnotaNalady < 80) dom.moodLabel.textContent = 'Lepšia nálada'; else dom.moodLabel.textContent = 'Skvelá nálada'; await Promise.all(slubyAnimacii); }
export function vypisatText(text, trvanie) { return new Promise(resolve => { if (text === undefined || text === null) { resolve(); return; } if (text.trim() !== '') { dom.storyPanel.classList.add('bottom-panel-open'); } else { dom.storyPanel.classList.remove('bottom-panel-open'); } dom.storyText.innerHTML = ''; const castiTextu = text.split('|'); const pocetPauz = castiTextu.length - 1; const celkovaDlzkaMs = (trvanie || 5) * 1000; const casPrePauzyMs = pocetPauz * 2000; let casPrePisanieMs = celkovaDlzkaMs - casPrePauzyMs; if (casPrePisanieMs <= 0) casPrePisanieMs = 0; const oneskorenieNaZnak = (casPrePisanieMs > 0 && text.length > 0) ? casPrePisanieMs / text.length : 0; let indexCasti = 0; function vypisatDalsiuCast() { if (indexCasti >= castiTextu.length) { resolve(); return; } const aktualnaCast = castiTextu[indexCasti].trim(); let i = 0; function pis() { if (i < aktualnaCast.length) { dom.storyText.innerHTML += aktualnaCast.charAt(i++); setTimeout(pis, oneskorenieNaZnak); } else { indexCasti++; if (indexCasti < castiTextu.length) { setTimeout(() => { dom.storyText.innerHTML = ''; vypisatDalsiuCast(); }, 2000); } else { resolve(); } } } pis(); } vypisatDalsiuCast(); }); }
export async function spustitPrechodSceny(staryStav, novyStav, reakcia, posunCasu) { await zatmavitObrazovku(); const trvanieReakcie = (reakcia?.dlzka_sceny || 0) * 1000; zmenitMedia(reakcia?.media); const slubAktualizacieStavu = aktualizovatPanelStavu(novyStav, staryStav, trvanieReakcie); const slubAnimacieCasu = animovatCas(novyStav.cas, posunCasu, trvanieReakcie); const slubTextu = reakcia?.text ? vypisatText(reakcia.text, reakcia.dlzka_sceny || 0) : vypisatText('', 0); if (reakcia?.text || reakcia?.media) { await odkrytObrazovku(); } await Promise.all([ new Promise(resolve => setTimeout(resolve, trvanieReakcie)), slubAktualizacieStavu, slubAnimacieCasu, slubTextu ]); await zatmavitObrazovku(); await vypisatText('', 0); }
export function zmenitMedia(media) { dom.sceneVideo.classList.add('hidden'); dom.sceneMedia.classList.add('hidden'); document.getElementById('intro-background-image').classList.add('hidden'); dom.sceneVideo.pause(); dom.sceneVideo.currentTime = 0; let zdrojVidea = null; let jeSlucka = false; if (media?.animacia) { zdrojVidea = media.animacia; jeSlucka = false; dom.sceneVideo.muted = !zvukOdomknuty; } else if (media?.animacia_slucka) { zdrojVidea = media.animacia_slucka; jeSlucka = true; dom.sceneVideo.muted = !zvukOdomknuty; } if (zdrojVidea) { dom.sceneVideo.src = zdrojVidea; dom.sceneVideo.loop = jeSlucka; dom.sceneVideo.volume = 0.5; dom.sceneVideo.play().catch(e => {}); dom.sceneVideo.classList.remove('hidden'); if (media?.zvuk && !zvukOdomknuty) { dom.sceneAudio.src = media.zvuk; dom.sceneAudio.play().catch(e => {}); } return dom.sceneVideo; } else if (media?.hlavne_pozadie) { dom.sceneMedia.src = media.hlavne_pozadie; dom.sceneMedia.classList.remove('hidden'); } else { document.getElementById('intro-background-image').classList.remove('hidden'); } if (media?.zvuk && !zdrojVidea) { dom.sceneAudio.src = media.zvuk; dom.sceneAudio.play().catch(e => {}); } return null; }
export function aktualizovatOvladacePanelov(scena) { const maText = scena?.pribeh?.text && scena.pribeh.text.trim() !== ''; dom.bottomPanelHandle.disabled = !maText; const maVolby = scena?.typ === 'manual' && scena.moznosti && scena.moznosti.length > 0; dom.topPanelHandle.disabled = !maVolby; if (dom.bottomPanelHandle.disabled) { dom.storyPanel.classList.remove('bottom-panel-open'); } if (dom.topPanelHandle.disabled) { dom.storyPanel.classList.remove('top-panel-open'); } }
export function zobrazitZadanieMena(media) { zmenitMedia(media); dom.introOverlay.style.backgroundColor = 'rgba(17, 15, 13, 0.85)'; document.getElementById('loading-state').classList.add('hidden'); dom.nameEntryState.classList.remove('hidden'); dom.nameInput.focus(); }
export function skrytUvodnuObrazovku(stavHry) { return new Promise(async resolve => { dom.introOverlay.classList.add('hidden'); await aktualizovatPanelStavu(stavHry, null, 0); aktualizovatPanelInventara(stavHry); dom.statusPanel.classList.remove('inactive'); dom.inventoryPanel.classList.remove('inactive'); dom.statusPanel.classList.add('active'); dom.inventoryPanel.classList.add('active'); resolve(); }); }
export function ziskatMenoZInputu() { return dom.nameInput.value.trim(); }
export function zobrazitFatalnuChybu(chyba) { document.body.innerHTML = `<div style="color: red; padding: 20px; text-align: center;"><h1>CHYBA NAČÍTANIA PRÍBEHU</h1><p>Skontrolujte konzolu (F12) pre detaily.</p><p><strong>Chyba:</strong> ${chyba.message}</p></div>`; }