# Le voci del cartone con ElevenLabs

Tre voci, tre modi diversi:

| Voce | Come si fa | Perché |
| --- | --- | --- |
| **NARRATORE** | Tutta con ElevenLabs, dal testo (*Text to Speech*) | È la parte più lunga e quella che vuole una voce matura e un ritmo da professionista |
| **OSTE** | La recitate voi, poi ElevenLabs cambia la voce (*Voice Changer*) | Restano le vostre pause e i tempi comici, ma la voce diventa quella di un signore di sessant'anni |
| **RAGAZZO** | La vostra voce vera | Il ragazzo è giovane come voi: suona autentico |

Spesa: piano **Starter**, 1 $ il primo mese (offerta fino al 18 ottobre), poi 6 $/mese. Basta e avanza.
Il piano gratuito non va bene: non ha la licenza commerciale. **Segnatevi di disdire dopo il primo mese.**

Per ogni battuta fate più tentativi e tenete il migliore. Non serve rinominare i file: mandatemeli divisi per voce,
li riconosco io. Taglio, pulisco, metto l'effetto vecchia radio al narratore nella parte in bianco e nero,
sincronizzo sottotitoli e scene e abbasso la musica sotto le voci.

---

## 1. NARRATORE (dal testo)

### Creare la voce

Nella sezione **Voices** create una voce nuova con **Voice Design** (la voce si crea da una descrizione).
Incollate questa descrizione (in inglese funziona meglio):

```
A male Italian newsreel announcer from the 1930s, in his forties. Deep, warm, resonant voice with a slightly solemn, theatrical and ironic delivery, like the narrator of an old Italian cinegiornale. Native Italian speaker, standard Italian accent, very clear diction, measured pace.
```

Come testo di prova usate: *Per generazioni, nei ristoranti, è andata così. Ti hanno detto che è normale.*
ElevenLabs propone tre voci: sceglietene una e salvatela come **Narratore SalaFlow**.

In alternativa cercate nella **Voice Library** (filtro lingua: italiano) con parole come *narratore*, *documentario*,
*radio*, *annunciatore*. Va bene qualsiasi voce maschile matura, calda, un po' solenne.

### Generare le battute

In **Text to Speech**:
- **Voce:** Narratore SalaFlow.
- **Modello:** **Eleven v3** (è il più espressivo e capisce le indicazioni tra parentesi quadre).
- **Stability:** **Natural**. Se viene piatta provate **Creative**; se sbaglia o inventa, **Robust**.
- Una battuta alla volta. Le indicazioni tra parentesi quadre (in inglese) dicono come leggerla: ElevenLabs non le pronuncia.

| # | Da incollare |
| --- | --- |
| 7 | `[solemn] Per generazioni, nei ristoranti... è andata così.` |
| 8 | `[dramatic] Il telefono squilla nel pieno del servizio.` |
| 9 | `[ironic] Rispondi con le mani occupate.` |
| 10 | `Scrivi un nome sul quaderno... [ironic] Forse.` |
| 11 | `[amused] Il tavolo da quattro diventa da sei.` |
| 12 | `L'allergia finisce su un post-it.` |
| 13 | `[ironic] E il post-it finisce... chissà dove.` |
| 14 | `La comanda arriva in cucina a voce.` |
| 15 | `In cucina capiscono «senza glutine». [ironic] O forse no.` |
| 16 | `[tired] A fine serata, il conto lo rifai a mano.` |
| 17 | `E il giorno dopo, nessuno sa com'è andata davvero.` |
| 18 | `[questioning] Quanto hai incassato? Quanto hai speso? Quanto ti resta?` |
| 19 | `[deadpan] Il quaderno non lo sa.` |
| 20 | `[solemn] Ti hanno detto che è normale.` |
| 21 | `Che si è sempre fatto così.` |
| 22 | `[dramatic] Che il caos fa parte del mestiere.` |
| 23 | `[softly] E tu ci hai creduto.` |
| 29 | `[warm] SalaFlow. Prenota una visita.` |

- **"SalaFlow":** se lo legge male ("Sala-flov"), scrivete `Sala Flou`.
- **Le pause:** si allungano con i puntini (`...`).
- **Gli scarti:** se una battuta suona strana, rigeneratela. Ogni tentativo costa pochissimo.

---

## 2. OSTE (recitato da voi, voce cambiata)

### Creare la voce dell'oste

Sempre con **Voice Design**:

```
A jovial Italian trattoria owner in his sixties, chubby, with a big mustache. Deep, warm, slightly raspy voice, proud and theatrical, very expressive, like a character in an old cartoon. Native Italian speaker.
```

Testo di prova: *Sabato sera, tutto esaurito. E qui dentro c'è tutto.* Salvatela come **Oste SalaFlow**.

### Registrare

Registra chi di voi ha la voce più bassa o recita meglio. Le battute, con l'intenzione:

| # | Battuta | Come dirla |
| --- | --- | --- |
| 1 | Sabato sera, tutto esaurito. | Fiero, petto in fuori, contento |
| 2 | E qui dentro c'è tutto. | Sicurissimo, come se battesse la mano sul quaderno |
| 4 | Prenotazioni, tavoli, allergie. Trent'anni così, e mai un problema. | Elenca contando con le dita, sempre più orgoglioso; "mai un problema" scandito |
| 6 | …Quasi mai. | Pausa lunga prima, poi la voce si sgonfia: imbarazzato, piccolo piccolo |
| 27 | E il quaderno? | Un po' triste, quasi offeso, come un bambino a cui tolgono il giocattolo |

### Cambiare la voce

In **Voice Changer** caricate la registrazione di una battuta:
- **Voce:** Oste SalaFlow.
- **Remove background noise:** acceso.
- **Stability:** circa 50%.
- **Similarity:** circa 75-80%.
- **Style:** 0% (la recitazione ce la mettete voi).
- Se la voce dell'oste "trema" o cambia da una battuta all'altra, alzate la Stability.

Il Voice Changer copia **intonazione, pause ed emozione**: più esagerate, meglio viene. Recitate da cartone animato.

---

## 3. RAGAZZO (la vostra voce)

Registrate e mandatemi i file così come sono, la voce non si cambia.

| # | Battuta | Come dirla |
| --- | --- | --- |
| 3 | Tutto? | Scettico, sopracciglio alzato, cortissimo |
| 5 | Mai? | Provocatorio, con un mezzo sorriso |
| 24 | Guarda qui. | Sicuro, complice, come chi ha un asso nella manica |
| 25 | Prenotazioni, sala, comande, cucina e conto. In un'app sola. | Ritmato, ogni parola un colpo; "in un'app sola" più lento e soddisfatto |
| 26 | E per te: incassi, fatture, magazzino e turni. | Complice, rivolto all'oste, come un regalo |
| 28 | Tienilo. Per le ricette. | Simpatico, con le spalle alzate e il sorriso nella voce |

Se poi la vostra voce non vi convince, si può passare anche questa nel Voice Changer con una voce giovane.

---

## Come registrare (oste e ragazzo)

1. **Dove:** in una stanza piccola con tende, tappeti o armadi pieni. Non in bagno né in cucina: rimbombano.
2. **Con cosa:** basta il telefono (Memo vocali / Registratore), a 20-30 cm dalla bocca, un po' di lato perché le "p" non soffino.
3. **Come:** un file per battuta, con un secondo di silenzio prima e dopo. Due prese per ciascuna, e se una vi piace di più ditemelo.
4. **Ritmo:** non correte, il video si adatta alla vostra voce. Sorridete quando la battuta è allegra: si sente.
5. **Silenzio:** niente musica o TV accese.
