import type { Mode } from "./style";

// The story, one line per shot. `dur` is in seconds and is a first guess at a natural speaking pace:
// once the team records the voice, these get replaced by the real timings.
export type Line = {
  readonly id: string;
  readonly mode: Mode;
  readonly who: "OSTE" | "RAGAZZO" | "NARRATORE";
  readonly text: string;
  readonly dur: number;
  readonly iris?: "in" | "out";
};

export const TITLE = "HAI TUTTO SOTTO CONTROLLO";
export const SUBTITLE = "(lo credi tu)";

export const SCRIPT: readonly Line[] = [
  { id: "c1", mode: "color", who: "OSTE", text: "Sabato sera, tutto esaurito.", dur: 2.4 },
  { id: "c2", mode: "color", who: "OSTE", text: "E qui dentro c'è tutto.", dur: 2.2 },
  { id: "c3", mode: "color", who: "RAGAZZO", text: "Tutto?", dur: 1.4 },
  { id: "c4", mode: "color", who: "OSTE", text: "Prenotazioni, tavoli, allergie. Trent'anni così, e mai un problema.", dur: 4.4 },
  { id: "c5", mode: "color", who: "RAGAZZO", text: "Mai?", dur: 1.2 },
  { id: "c6", mode: "color", who: "OSTE", text: "…Quasi mai.", dur: 1.9, iris: "out" },
  { id: "c7", mode: "bw", who: "NARRATORE", text: "Per generazioni, nei ristoranti, è andata così.", dur: 3.2, iris: "in" },
  { id: "c8", mode: "bw", who: "NARRATORE", text: "Il telefono squilla nel pieno del servizio.", dur: 2.8 },
  { id: "c9", mode: "bw", who: "NARRATORE", text: "Rispondi con le mani occupate.", dur: 2.4 },
  { id: "c10", mode: "bw", who: "NARRATORE", text: "Scrivi un nome sul quaderno. Forse.", dur: 2.8 },
  { id: "c11", mode: "bw", who: "NARRATORE", text: "Il tavolo da quattro diventa da sei.", dur: 2.6 },
  { id: "c12", mode: "bw", who: "NARRATORE", text: "L'allergia finisce su un post-it.", dur: 2.4 },
  { id: "c13", mode: "bw", who: "NARRATORE", text: "E il post-it finisce chissà dove.", dur: 2.4 },
  { id: "c14", mode: "bw", who: "NARRATORE", text: "La comanda arriva in cucina a voce.", dur: 2.6 },
  { id: "c15", mode: "bw", who: "NARRATORE", text: "In cucina capiscono «senza glutine». O forse no.", dur: 3.2 },
  { id: "c16", mode: "bw", who: "NARRATORE", text: "A fine serata, il conto lo rifai a mano.", dur: 2.8 },
  { id: "c17", mode: "bw", who: "NARRATORE", text: "E il giorno dopo, nessuno sa com'è andata davvero.", dur: 3.2 },
  { id: "c18", mode: "bw", who: "NARRATORE", text: "Quanto hai incassato? Quanto hai speso? Quanto ti resta?", dur: 4.0 },
  { id: "c19", mode: "bw", who: "NARRATORE", text: "Il quaderno non lo sa.", dur: 2.0 },
  { id: "c20", mode: "bw", who: "NARRATORE", text: "Ti hanno detto che è normale.", dur: 2.4 },
  { id: "c21", mode: "bw", who: "NARRATORE", text: "Che si è sempre fatto così.", dur: 2.2 },
  { id: "c22", mode: "bw", who: "NARRATORE", text: "Che il caos fa parte del mestiere.", dur: 2.6 },
  { id: "c23", mode: "bw", who: "NARRATORE", text: "E tu ci hai creduto.", dur: 2.3, iris: "out" },
  { id: "c24", mode: "color", who: "RAGAZZO", text: "Guarda qui.", dur: 2.0, iris: "in" },
  { id: "c25", mode: "color", who: "RAGAZZO", text: "Prenotazioni, sala, comande, cucina e conto. In un'app sola.", dur: 5.0 },
  { id: "c26", mode: "color", who: "RAGAZZO", text: "E per te: incassi, fatture, magazzino e turni.", dur: 4.2 },
  { id: "c27", mode: "color", who: "OSTE", text: "E il quaderno?", dur: 1.8 },
  { id: "c28", mode: "color", who: "RAGAZZO", text: "Tienilo.", dur: 1.3 },
  { id: "c28b", mode: "color", who: "RAGAZZO", text: "Per le ricette.", dur: 2.0 },
  { id: "c29", mode: "color", who: "NARRATORE", text: "SalaFlow. Prenota una visita.", dur: 3.6, iris: "out" },
];

export const END_CARD = 3.0; // seconds of logo after the last line
