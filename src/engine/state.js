// Herný stav, štatistiky, inventár
export const pociatocnyStavHry = {
    hrac: { meno: "Hráč", miesto: "Neznámo" },
    cas: new Date('2042-10-01T08:00:00'),
    statistiky: { energia: 90, nasytenie: 30, dopamin: 25, motivacia: 20, zdravie: 30 },
    inventar: [],
    idAktualnejSceny: 'NAME_ENTRY',
};

export function aplikovatEfekty(stavHry, efekty) {
    if (!efekty) return;
    if (efekty.statistiky) {
        for (const stat in efekty.statistiky) {
            if (stavHry.statistiky.hasOwnProperty(stat)) {
                const zmena = efekty.statistiky[stat];
                stavHry.statistiky[stat] = Math.max(0, Math.min(100, stavHry.statistiky[stat] + zmena));
            }
        }
    }
    if (efekty.inventar) {
        if (efekty.inventar.add && !stavHry.inventar.includes(efekty.inventar.add)) {
            stavHry.inventar.push(efekty.inventar.add);
        }
        if (efekty.inventar.remove) {
            stavHry.inventar = stavHry.inventar.filter(item => item !== efekty.inventar.remove);
        }
    }
}
