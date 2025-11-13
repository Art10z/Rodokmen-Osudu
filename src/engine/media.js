// Správa cache a načítania médií
const MAX_CACHE_SIZE = 50;
let mediaCache = new Map();
let prebiehajucePreklady = new Map();

export function vycistiatStaruCache() {
    if (mediaCache.size <= MAX_CACHE_SIZE) return;
    const entries = Array.from(mediaCache.entries());
    const toRemove = entries.slice(0, Math.floor(MAX_CACHE_SIZE * 0.3));
    toRemove.forEach(([url, blobUrl]) => {
        if (blobUrl && blobUrl.startsWith('blob:')) {
            URL.revokeObjectURL(blobUrl);
        }
        mediaCache.delete(url);
    });
}

export function ziskatAleboNacitatMedium(url) {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
        return Promise.resolve(url);
    }
    if (mediaCache.has(url)) {
        return Promise.resolve(mediaCache.get(url));
    }
    if (prebiehajucePreklady.has(url)) {
        return prebiehajucePreklady.get(url);
    }
    vycistiatStaruCache();
    const promise = fetch(url, { cache: 'force-cache' })
        .then(response => {
            if (!response.ok) throw new Error(`Chyba pri sťahovaní média: ${url}`);
            return response.blob();
        })
        .then(blob => {
            const objectURL = URL.createObjectURL(blob);
            mediaCache.set(url, objectURL);
            prebiehajucePreklady.delete(url);
            return objectURL;
        })
        .catch(err => {
            prebiehajucePreklady.delete(url);
            return url;
        });
    prebiehajucePreklady.set(url, promise);
    return promise;
}

export async function ziskatObjektMediiZCache(mediaObj) {
    if (!mediaObj) return null;
    const cachedMedia = {};
    for (const key in mediaObj) {
        cachedMedia[key] = await ziskatAleboNacitatMedium(mediaObj[key]);
    }
    return cachedMedia;
}
