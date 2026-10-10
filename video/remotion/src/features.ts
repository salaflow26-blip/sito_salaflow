import type { FeatureProps } from "./scenes/FeatureScene";

// Real screenshots of the app (demo account "Trattoria Demo"), crops in screenshot pixels.
export const F = {
  serata: { kicker: "Servizio", index: "01", title: "La serata, *dal vivo*.", src: "shots/serata.jpg", zoom: { crop: [30, 195, 800, 495], scale: 1.05 } },
  mappa: { kicker: "Servizio", index: "02", title: "La sala, *tavolo per tavolo*.", src: "shots/mappa.jpg", zoom: { crop: [70, 680, 720, 520], scale: 1.1 } },
  comanda: { kicker: "Servizio", index: "03", title: "La comanda, *dal tavolo*.", src: "shots/comanda.jpg", zoom: { crop: [36, 505, 790, 248], scale: 1.12 } },
  cucina: { kicker: "Servizio", index: "04", title: "In cucina, *in tempo reale*.", src: "shots/cucina.jpg", kind: "tablet", zoom: { crop: [618, 290, 556, 330], scale: 1.45 } },
  cassa: { kicker: "Servizio", index: "05", title: "Il conto è *già pronto*.", src: "shots/cassa.jpg", zoom: { crop: [28, 1000, 804, 320], scale: 1.08 } },
  andamento: { kicker: "Gestione", index: "01", title: "Come va il locale, *davvero*.", src: "shots/andamento.jpg", zoom: { crop: [30, 610, 800, 482], scale: 1.08, delay: 18 } },
  fattura: { kicker: "Gestione", index: "02", title: "La fattura *si legge da sola*.", src: "shots/fattura_full.jpg", scroll: [8, 60, 0, 760], zoom: { crop: [30, 1280, 800, 390], scale: 1.08, delay: 40 } },
  magazzino: { kicker: "Gestione", index: "03", title: "Il magazzino *ti avvisa*.", src: "shots/magazzino.jpg", zoom: { crop: [30, 960, 800, 500], scale: 1.05, delay: 18 } },
  utile: { kicker: "Gestione", index: "04", title: "Quanto ti resta, *ogni mese*.", src: "shots/utile.jpg", zoom: { crop: [30, 610, 800, 482], scale: 1.08, delay: 18 } },
  cameriere: { kicker: "Gestione", index: "05", title: "Un cameriere in più? *Fai due conti*.", src: "shots/cameriere_full.jpg", titleSize: 84, scroll: [8, 50, 0, 760], zoom: { crop: [30, 1440, 800, 220], scale: 1.12, delay: 34 } },
} satisfies Record<string, FeatureProps>;
