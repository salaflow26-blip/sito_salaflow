import type { FeatureProps } from "./scenes/FeatureScene";

// Real screenshots of the app (demo account "Trattoria Demo"), crops and taps in screenshot pixels.
export const F = {
  serata: { kicker: "Servizio", index: "01", title: "La serata, *dal vivo*.", sub: "A tavola, attesi e coperti totali, aggiornati in tempo reale.", src: "shots/serata.jpg", zoom: { crop: [30, 195, 800, 495], scale: 1.05 } },
  mappa: { kicker: "Servizio", index: "02", title: "La sala, *tavolo per tavolo*.", sub: "Libero, prenotato o arrivato: lo vedi a colpo d'occhio.", src: "shots/mappa.jpg", zoom: { crop: [70, 680, 720, 520], scale: 1.1 } },
  comanda: { kicker: "Servizio", index: "03", title: "La comanda, *dal tavolo*.", sub: "Un tocco per piatto, divisi per uscita: arriva subito in cucina.", src: "shots/comanda_prima.jpg", tap: { at: [774, 566], frame: 32, next: "shots/comanda.jpg" }, zoom: { crop: [36, 505, 790, 248], scale: 1.12, delay: 52 } },
  cucina: { kicker: "Servizio", index: "04", title: "In cucina, *in tempo reale*.", sub: "Le comande in fila sul tablet, con le allergie in evidenza.", src: "shots/cucina.jpg", kind: "tablet", zoom: { crop: [618, 290, 556, 330], scale: 1.45 } },
  cassa: { kicker: "Servizio", index: "05", title: "Il conto è *già pronto*.", sub: "Piatti e coperti sono già nel conto. Dividi e incassi.", src: "shots/cassa.jpg", zoom: { crop: [28, 1000, 804, 320], scale: 1.08 } },
  andamento: { kicker: "Gestione", index: "01", title: "Come va il locale, *davvero*.", sub: "Coperti, incasso medio e piatti più venduti: dati già pronti.", src: "shots/andamento.jpg", zoom: { crop: [30, 610, 800, 482], scale: 1.08 } },
  fattura: { kicker: "Gestione", index: "02", title: "La fattura *si legge da sola*.", sub: "Carichi la fattura elettronica: righe e prezzi letti in automatico.", src: "shots/fattura_full.jpg", scroll: [12, 60, 0, 760], zoom: { crop: [30, 1280, 800, 390], scale: 1.08, delay: 64 } },
  magazzino: { kicker: "Gestione", index: "03", title: "Il magazzino *ti avvisa*.", sub: "Ti dice cosa sta finendo e prepara la lista per i fornitori.", src: "shots/magazzino.jpg", zoom: { crop: [30, 960, 800, 500], scale: 1.05 } },
  utile: { kicker: "Gestione", index: "04", title: "Quanto ti resta, *ogni mese*.", sub: "Incasso meno merce, personale e spese fisse, prima delle tasse.", src: "shots/utile.jpg", zoom: { crop: [30, 610, 800, 482], scale: 1.08 } },
  cameriere: { kicker: "Gestione", index: "05", title: "Un cameriere in più? *Fai due conti*.", sub: "Quanto costa e quanti coperti servono per ripagarlo.", src: "shots/cameriere_full.jpg", titleSize: 84, scroll: [12, 56, 0, 760], zoom: { crop: [30, 1440, 800, 220], scale: 1.12, delay: 60 } },
} satisfies Record<string, FeatureProps>;
