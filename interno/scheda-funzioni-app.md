# SalaFlow — scheda completa delle funzioni

Ricavata aprendo l'app web vera (salaflow-6d0f7.web.app) con l'account demo, schermata per schermata, il 29/09/2026.
Le schermate sono in `schermate/`. Legenda: ✅ visto funzionare con dati · 👁 visto nell'interfaccia, non provato
(l'account demo non ha piatti nel menu, quindi comande e cassa non si possono ancora provare fino in fondo).

Cartella interna: esclusa dal deploy del sito (`.vercelignore`).

---

## 1. Tavoli — la serata a colpo d'occhio ✅ (`01-sala`)
- In alto la **Serata attiva** con data selezionabile e 4 caselle: **Coperti · Arrivati · Prenotati · In arrivo**. Tocchi una casella e vedi il dettaglio.
- **Dettaglio tavoli serata** con filtri: Tutti / Non arrivati / Arrivati / per sala, e filtri per **fascia oraria** (19:45, 20:00…).
- Ogni prenotazione è una scheda: numero tavolo, nome, orario, persone, sala, **timer da quando sono seduti**, etichette (Compleanno, Passeggino, Cane, Occhio di riguardo), badge **PRIORITÀ**, stato **In ritardo**.
- Da ogni scheda: segna arrivato, icone rapide (seggioloni, annulla, modifica) ed elimina.

## 2. Nuova prenotazione / Non prenotato ✅ (`05-nuova-prenotazione`)
- Il **+** in basso apre due scelte: **Prenotazione** oppure **Non prenotato** (walk-in, "Registra ingresso non prenotato").
- Campi: nome, **N° tavolo opzionale — se lo lasci vuoto usa il tavolo suggerito** (es. "Tavolo suggerito: 1"), **tavoli uniti** (es. 12, 13), persone, **seggioloni** (0–5), orario (ogni 15 min o "altro orario"), **priorità**, note/allergie/intolleranze, etichette rapide.
- Se il tavolo è già occupato l'app chiede: **Scambia i tavoli · Aggiungi (doppio turno) · Sostituisci prenotazione esistente**.

## 3. Servizio — la sala in diretta ✅ (`02-servizio`, `03-tavolo-in-servizio`)
- "Stato del servizio" **LIVE**: tessere dei tavoli arrivati con nome e tempo seduti; colore diverso per i prioritari.
- Tocchi un tavolo: **Tavolo liberato**, **Modifica prenotazione**, **Priorità**, **Avvisa**, **Accoglienza**, **Comanda**.
- **Accoglienza/Benvenuto** apre il popup **allergeni** (disattivabile da Personalizza). 👁
- **Pulsanti di servizio personalizzabili**: fino a 5, etichetta ed emoji a scelta, riordinabili (es. aggiungere "Dolci presi"). 👁
- **"Cosa ha preso il tavolo…"**: ricerca rapida di cosa ha ordinato un tavolo. 👁
- Quando un tavolo si libera l'app può chiedere **"Sì, va riordinato"** (tavolo da risistemare). 👁

## 4. Comanda 👁
- Dal tavolo in servizio: scegli piatti per categoria, quantità, **Ingredienti +/-** (aggiunte e rimozioni), **Vedi riepilogo → Invia comanda**.
- **Stampa su stampante comande** (Epson di rete, protocollo ePOS-Print: basta l'IP). Stampa comande per la cucina e preconto, **non scontrini fiscali**.

## 5. Cassa 👁 (`08-cassa`)
- Digiti il numero del tavolo → conto aperto. Viste **Riepilogo** e **Sospesi**.
- **Coperto automatico** (se nel menu c'è una voce "Coperto").
- **Menù concordato** (prezzo fisso), **Abbuono** (riduci il conto), **Preconto** (stampabile).
- **Dividi**: in parti uguali o per piatto, persona per persona.
- Pagamento **Contanti** o **Carta/POS**, **Segna saldato**, **Metti in sospeso** (paga più avanti).
- **Scontrino parlante** (dati aziendali, "Nuova azienda") e **Fattura** — attivabili; **Scontrino fiscale: non attivo** (non è un registratore di cassa).

## 6. Asporto 👁
- Ordini da ritirare senza tavolo: **Nuovo asporto → Crea e componi ordine**, stessa interfaccia della comanda.
- 🚧 **In sviluppo: asporto ordinabile dal sito.** Il cliente richiede l'asporto dalla pagina pubblica del locale e l'ordine arriva direttamente nell'app. Finché non è rilasciato, nelle demo va presentato come "in arrivo".

## 7. Menu / Piatti 👁 (`09-piatti`)
- Categorie, piatti e prezzi. **Aggiunte e rimozioni standard** riutilizzabili.
- **Importa menu da PDF o foto**: carichi il menu e l'app crea le voci.

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
- **Esporta dati serata** in Excel/CSV.

## 12. Staff, profili, cronologia ✅ (`11-staff-profili`, `12-cronologia`)
- **Invita per email** con ruolo: **Sala** (solo prenotazioni) o **Gestione** (accesso completo).
- **Profili** su dispositivo condiviso, senza account separati; **PIN per cambio profilo** opzionale.
- **Cronologia**: chi ha fatto cosa e quando ("Tavolo 5 segnato come arrivato — 25/09, 12:48").

## 13. Personalizzazione e impostazioni ✅ (`10-personalizza`)
- Logo, nome, tagline, **orario di servizio** (apertura/chiusura), orari ogni 15 min o **turni fissi** (separati per app e sito pubblico).
- Notifiche push (arrivi e comande pronte) con **diagnostica notifiche**, durata dei toast.
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
5. **Allergeni all'accoglienza** e pulsanti di servizio personalizzabili.
6. **Piantina diversa solo per oggi**, scambio tavoli / doppio turno, tavoli uniti, seggioloni.
7. **Ruoli staff (Sala / Gestione)**, esportazione Excel/CSV, lingua inglese.

**Frasi del sito da correggere o verificare:**
- "Le prenotazioni arrivano da sole … finiscono già sulla piantina": quelle online vanno **confermate** dal locale. Meglio: "arrivano in app, tu confermi con un tocco".
- "Statistiche … tempo medio ai tavoli": nei Grafici ci sono *andamento coperti* e *picco arrivi*; il tempo medio non l'ho trovato. Da verificare con Luca prima di lasciarlo.
- "Promemoria tavolo intelligente" (tavolate più lunghe): non visibile senza una serata in corso, da verificare.
- Nessuna affermazione su scontrini fiscali: giusto così, l'app non li fa.
