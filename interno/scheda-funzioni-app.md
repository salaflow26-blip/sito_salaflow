# SalaFlow — scheda completa delle funzioni

Ricavata aprendo l'app web vera (salaflow-6d0f7.web.app) con l'account demo, schermata per schermata, il 29/09/2026.
Le schermate sono in `schermate/`. Legenda: ✅ provato con dati veri nell'account demo · 🔎 verificato nel codice dell'app · 👁 visto nell'interfaccia, non provato.
Per comanda e cassa ho creato un menu e un tavolo di prova, poi li ho cancellati (resta solo la loro traccia in Cronologia).

Cartella interna: esclusa dal deploy del sito (`.vercelignore`).

---

## 1. Tavoli — la serata a colpo d'occhio ✅ (`01-sala`)
- In alto la **Serata attiva** con data selezionabile e 4 caselle: **Coperti · Arrivati · Prenotati · In arrivo**. Tocchi una casella e vedi il dettaglio.
- **Dettaglio tavoli serata** con filtri: Tutti / Non arrivati / Arrivati / per sala, e filtri per **fascia oraria** (19:45, 20:00…).
- Ogni prenotazione è una scheda: numero tavolo, nome, orario, persone, sala, **timer da quando sono seduti**, etichette (Compleanno, Passeggino, Cane, Occhio di riguardo), badge **PRIORITÀ**, stato **In ritardo**.
- Ogni scheda si **trascina**: verso destra = **Arrivato**, verso sinistra = **Elimina**. Icone rapide: **Tavolo liberato · No show · Modifica**.

## 2. Nuova prenotazione / Non prenotato ✅ (`05-nuova-prenotazione`)
- Il **+** in basso apre due scelte: **Prenotazione** oppure **Non prenotato** (walk-in, "Registra ingresso non prenotato").
- Campi: nome, **N° tavolo opzionale — se lo lasci vuoto usa il tavolo suggerito**, **tavoli uniti** (es. 12, 13), persone, **seggioloni** (0–5), orario (ogni 15 min o "altro orario"), **priorità**, note/allergie/intolleranze, etichette rapide.
- **Come sceglie il tavolo suggerito** 🔎 (provato: 2 persone → tavolo 1, 3 persone → tavolo 3):
  - scarta i tavoli troppo piccoli e quelli impegnati entro **1h30** dall'orario richiesto (un pasto dura almeno tanto);
  - tra i validi prende **il più piccolo che basta**;
  - preferisce i tavoli **non ancora usati stasera**; solo se non ce ne sono propone un **doppio turno**.
- Le richieste online accettate diventano prenotazioni con lo stesso modulo; se il cliente ha lasciato l'email riceve la **conferma via email**. 🔎
- Se il tavolo è già occupato l'app chiede: **Scambia i tavoli · Aggiungi (doppio turno) · Sostituisci prenotazione esistente**.

## 3. Servizio — la sala in diretta ✅ (`02-servizio`, `03-tavolo-in-servizio`)
- "Stato del servizio" **LIVE**: tessere dei tavoli arrivati con nome e tempo seduti; colore diverso per i prioritari.
- Tocchi un tavolo: **Tavolo liberato**, **Modifica prenotazione**, **Priorità**, **Avvisa**, **Accoglienza**, **Comanda**.
- **Accoglienza** apre il popup **allergeni** ✅ (`15-accoglienza-allergeni`): i 14 allergeni di legge + "Personalizzato", oppure "Nessuno". Il tavolo poi mostra "Allergeni: Glutine" e l'icona 🌾 sulla tessera. Disattivabile da Personalizza.
- **Pulsanti di servizio personalizzabili**: fino a 5, etichetta ed emoji a scelta, riordinabili (es. aggiungere "Dolci presi"). 👁
- **Avvisa** → il tavolo è **pronto per ordinare**: tutto lo staff riceve l'avviso "🛎️ Tavolo 3 è pronto per ordinare!". 🔎
- **"Cosa ha preso il tavolo…"**: ricerca rapida di cosa ha ordinato un tavolo. 👁
- **Tavolo liberato** → l'app chiede se va **riordinato** (un tavolo che ha preso solo un caffè non sporca come una cena). Finché nessuno lo riordina resta in Servizio come promemoria e non viene proposto ai walk-in. 🔎
- **Promemoria "il tavolo si è alzato?"** 🔎: dopo **90 minuti** da "arrivato" l'app chiede conferma. Risposte: *Sì* (liberato), *No* (richiede fra 20 minuti), *Non lo so* (salta solo per quel cameriere, gli altri lo vedono ancora). Le **tavolate da 7 o più** vengono escluse, perché restano sedute più a lungo.

## 4. Comanda ✅ (`16-comanda-allergene-evidenziato`, `17-comanda-riepilogo`)
- Nella lista piatti: **tocco = +1**, **pressione lunga = quantità esatta e ingredienti ±**, **scorrere a sinistra = −1**.
- Dal tavolo in Servizio: **tocco breve su "Comanda"** = segna solo "comanda presa" (per chi scrive ancora a mano); **tenendo premuto** si apre la comanda vera.
- Scegli **coperti**, **uscita** (1, 2, 3, 4, + — primi e secondi in uscite diverse), categoria, piatti con **+**; **Ingredienti +/-** per aggiunte/rimozioni.
- **Se il tavolo ha dichiarato un allergene, i piatti che lo contengono sono evidenziati in rosso con ⚠** (es. "Tagliatelle al ragù · Glutine").
- **Vedi riepilogo**: righe per categoria con quantità, uscita e prezzo, **totale** → **Invia comanda**. Si può riaprire per aggiungere piatti (riordini).
- **Destinazioni** (es. Cucina, Bar): ogni categoria manda la comanda alla sua destinazione, con eccezioni per singolo piatto (es. il caffè tra i dolci → Bar).
- I **pulsanti di servizio personalizzati** possono essere collegati a una categoria: "Dolci" apre la comanda già filtrata sui dolci. 🔎
- **Stampa su stampante comande** (Epson di rete, protocollo ePOS-Print: basta l'IP). Stampa comande per la cucina e preconto, **non scontrini fiscali**.

## 4-bis. Schermo cucina ✅ (nuovo, 01/10)
- Vista **Cucina** dal menu, pensata per un tablet fisso in cucina e uno al bar.
- Una colonna per comanda, dalla più vecchia, con tavolo, persone, piatti divisi per uscita, aggiunte/rimozioni.
- **Tempo** su ogni comanda: gialla dopo 9 minuti, rossa dopo 15. Orologio in alto.
- **"Da preparare ora"**: il totale dei piatti ancora da fare (es. Tagliatelle ×4).
- **Allergie** del tavolo in una barra rossa in testa alla comanda.
- Schede per **reparto** (Cucina, Bar…) con il numero di comande; i piatti degli altri reparti compaiono in piccolo (si può nascondere, per ogni tablet).
- Si **spunta** ogni piatto pronto. Se il mio reparto ha finito e un altro no: "Fatto — in attesa di Bar" e un avviso.
- Quando tutti i reparti hanno finito: **Manda in sala** e la comanda esce dallo schermo.
- Le comande nuove compaiono subito, in fondo alla fila.

## 5. Cassa ✅ (`08-cassa`, `18-conto-cassa`, `19-dividi-conto`)
- Elenco **tavoli aperti** ("1 da pagare") oppure digiti il numero del tavolo → conto con tutte le righe della comanda. Viste **Riepilogo** e **Sospesi**.
- **Coperto automatico** ✅: se nel menu c'è una voce "Coperto", viene aggiunta una per persona (3 × €2,50), modificabile con un tocco.
- **Menù concordato** (prezzo fisso), **Abbuono** (riduci il conto), **Preconto** (stampabile).
- **Dividi** ✅: **in parti uguali** (es. €55,50 in 2 = €27,75 a persona) o **per piatto**.
- Pagamento **Contanti** o **Carta/POS**, **Segna saldato**, **Metti in sospeso** (paga più avanti).
- **Scontrino parlante** (dati aziendali, "Nuova azienda") e **Fattura** — attivabili; **Scontrino fiscale: non attivo** (non è un registratore di cassa).

## 6. Asporto ✅
- Ordini da ritirare senza tavolo: **Nuovo asporto → Crea e componi ordine**, stessa interfaccia della comanda. Stati: in preparazione → **Segna pronto** → **Segna ritirato**.
- **Asporto ordinabile dal sito** (online dal 29/09):
  - sulla pagina pubblica del locale compare lo switch **Prenota un tavolo / Ordina da asporto**, solo se almeno un piatto è segnato "Disponibile per l'asporto" (spunta sulla scheda del piatto);
  - il cliente vede il menu asporto con prezzi e **allergeni**, può segnare le sue allergie e i piatti che le contengono si **evidenziano**; per alcuni piatti può chiedere aggiunte/rimozioni;
  - nome, telefono o email, **orario di ritiro**, note → la richiesta arriva in **Richieste prenotazione** con piatti, totale e orario;
  - **Accetta** crea l'asporto e apre la comanda già compilata: lo staff controlla e la invia in cucina;
  - **Limiti di capacità** (Impostazioni › Asporto): ogni 15/30/60 minuti, un massimo di piatti per categoria; se è pieno il sito propone al cliente un altro orario.

## 7. Menu / Piatti ✅ (`09-piatti`, `20-scheda-piatto`, `21-categoria-destinazione`)
- **Categorie** con destinazione (Cucina, Bar…), aggiunte a pagamento (es. "Mozzarella extra +€1") e rimozioni (es. "Cipolla") per categoria; **aggiunte/rimozioni standard** valide per tutto il menu.
- **Piatto**: nome, prezzo, descrizione, eccezione di destinazione, **14 allergeni** da spuntare, aggiunte personalizzate per quel piatto.
- **Importa menu da PDF o foto** 🔎: il file viene letto da una funzione cloud (`extractMenuFromPdf`) che crea categorie e piatti da rivedere.

## 8. Mappa — piantina ✅ (`04-piantina`)
- Piantina per sala con colori **Libero / Prenotato / Arrivato** e il numero di persone sul tavolo.
- Editor: aggiungi tavoli **Piccolo (2) / Medio (4) / Grande (8)** o con posti a scelta, trascini, **Ruota 90°**, elimini, più sale.
- **Piantina diversa solo per oggi**: disposizione speciale per una data (es. tavolata) senza toccare quella di sempre.

## 9. Cerca ✅
- Ricerca istantanea per numero tavolo o nome, su prenotazioni passate e future.

## 10. Prenotazioni online ✅ (`06-richieste-online`, `07-pagina-pubblica`)
- Ogni locale ha un **link pubblico** (`…/prenota.html?r=…`) da mettere su Instagram, Google, sito.
- Il cliente compila: nome, telefono **o** email (almeno uno), data, orario, persone, note/allergie → **Invia richiesta**.
- La richiesta arriva in **Richieste prenotazione**: il locale **conferma o rifiuta** (non entra da sola in piantina).
- Avviso allo staff: **solo app / solo email / entrambe**. Orari del modulo pubblico impostabili a parte (ogni 15 minuti o turni fissi).

## 11. Storico e Grafici ✅ (`13-grafici`, `14-storico`)
- **Storico serate**: ogni giorno con tavoli prenotati, arrivati e coperti; tocchi e riapri la serata.
- **Grafici**: *Andamento coperti* (storico serate) e *Picco arrivi per fascia oraria*; riepilogo per sala.
- **Tempo medio di occupazione** della serata (da "arrivato" a "liberato"), nella schermata Grafici. ✅
- **Esporta dati serata** in Excel/CSV.

## 12. Staff, profili, cronologia ✅ (`11-staff-profili`, `12-cronologia`)
- **Invita per email** con ruolo: **Sala** (solo prenotazioni) o **Gestione** (accesso completo).
- **Profili** su dispositivo condiviso, senza account separati; **PIN per cambio profilo** opzionale. 👁
- **Cronologia**: chi ha fatto cosa e quando ("Tavolo 5 segnato come arrivato — 25/09, 12:48").

## 13. Personalizzazione e impostazioni ✅ (`10-personalizza`)
- Logo, nome, tagline, **orario di servizio** (apertura/chiusura), orari ogni 15 min o **turni fissi** (separati per app e sito pubblico).
- Notifiche push (arrivi, tavolo pronto per ordinare, priorità, nuove richieste) con **diagnostica notifiche** e invio di prova, durata dei toast.
- **Modalità chiara/scura**, **Migliora prestazioni** (per tablet vecchi), feedback aptico, **lingua IT/EN**, tour guidato rivedibile.
- Eliminazione account dall'app.
- Piano attuale: **Beta gratuito**.

---

## Differenze con il sito salaflow.com

**Cose che il sito non dice e che l'app fa (sottovendute):**
1. **Comande con stampante cucina** — il sito le cita solo di passaggio.
2. **Cassa**: conto, preconto, dividi, abbuono, menù concordato, sospesi, contanti/POS, scontrino parlante/fattura. Assente dal sito.
3. **Asporto** (e presto ordinabile dal sito, direttamente in app). Assente.
4. **Importa menu da PDF/foto**. Assente.
5. **Allergeni all'accoglienza con piatti evidenziati in comanda**: è la funzione più forte da mostrare, e il sito non la cita. Poi i pulsanti di servizio personalizzabili, le uscite e le destinazioni Cucina/Bar.
6. **Piantina diversa solo per oggi**, scambio tavoli / doppio turno, tavoli uniti, seggioloni.
7. **Ruoli staff (Sala / Gestione)**, esportazione Excel/CSV, lingua inglese.

**Frasi del sito da correggere o verificare:**
- "Le prenotazioni arrivano da sole … finiscono già sulla piantina": quelle online vanno **confermate** dal locale. Meglio: "arrivano in app, tu confermi con un tocco".
- "Statistiche … tempo medio ai tavoli": ✔ esiste, nella schermata Grafici. La frase può restare.
- "Promemoria tavolo intelligente" (tavolate più lunghe): ✔ confermato nel codice, 90 minuti con le tavolate da 7+ escluse. Si può essere più precisi: "dopo un'ora e mezza ti chiede se il tavolo si è alzato".
- "Tavolo consigliato … sempre un tavolo libero, prima di proporti un doppio turno": ✔ esatto, anzi sceglie anche il più piccolo che basta.
- Nessuna affermazione su scontrini fiscali: giusto così, l'app non li fa.
