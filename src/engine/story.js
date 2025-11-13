// Načítanie a cache JSON príbehov
let pribehovaCache = {};

export function ziskatDataSceny(idSceny) {
    for (const subor in pribehovaCache) {
        if (pribehovaCache[subor][idSceny]) {
            const scena = pribehovaCache[subor][idSceny];
            if (!scena.id) scena.id = idSceny;
            return scena;
        }
    }
    return null;
}

export async function nacitatPribehovySubor(nazovSuboru) {
    if (pribehovaCache[nazovSuboru]) return;
    const odpoved = await fetch(`/pribeh/${nazovSuboru}`);
    if (!odpoved.ok) throw new Error(`HTTP chyba! Status: ${odpoved.status} pre súbor ${nazovSuboru}`);
    const data = await odpoved.json();
    pribehovaCache[nazovSuboru] = data;
}
