# OSI-CHESS
Progetto Ingegneria del sw 2023-24 realizzato attraverso un un processo Agile / Scrum-like


## Membri del team

- Marco Coppola             RUOLO: Developer, Backend, Sysadmin
- Valerio Pio De Nicola     RUOLO: Product Owner, Frontend, Backend
- Chiara Tosadori           RUOLO: Developer, Frontend, Scrum Master
- Bogdan Chirila            RUOLO: Analista delle prestazioni
- Ahmed Niouer              RUOLO: Designer, UI/UX

## Descrizione del prodotto

L'obiettivo principale del nostro prodotto è la realizzazione di un'applicazione web dedicata al coinvolgente gioco di scacchi chiamato "Really Bad Chess". Con la nostra piattaforma, gli utenti potranno sfidare un avanzato bot con diversi livelli di difficoltà o giocare contro altri appassionati di scacchi. La creazione di partite è semplice e intuitiva, consentendo agli utenti di invitare gli avversari tramite un link generato o un codice specifico.

I creatori di partite avranno la libertà di personalizzare l'esperienza, inclusa la possibilità di determinare la durata massima della partita. I risultati delle partite verranno registrati in una classifica globale, permettendo ai giocatori di confrontarsi con i migliori e monitorare la propria posizione basata sul punteggio ELO.

Oltre alla classifica generale, ogni giocatore avrà accesso a una sezione privata in cui potrà monitorare le proprie statistiche personali. Queste includono il numero di vittorie e sconfitte, le mosse impiegate per ottenere uno scacco matto e il tempo impiegato per vincere. Questa funzionalità consentirà ai giocatori di valutare il proprio miglioramento nel tempo e affinare le proprie abilità.

Inoltre, offriamo un'entusiasmante sfida giornaliera basata su una configurazione specifica, con una classifica dedicata basata sul minor numero di mosse per vincere. La nostra piattaforma mira a offrire un'esperienza coinvolgente, competitiva e personalizzabile per tutti gli amanti degli scacchi, sia principianti che giocatori esperti.

L'ultima versione dell'app stabile, presa dal branch main é disponibile su https://osichess.murkrowdev.org/

### Tech Stack
- Linguaggi di programmazione:
  - Front-end:
    - HTML
    - CSS
    - Javascript
  - Back-end:
    - PHP
- Librerie/Framework:
  - Front-end:
    - Framework:
      - React
    - Librerie:
      - chess.js:
        - https://github.com/jhlywa/chess.js/tree/master
      - chessboard.jsx:
        - https://github.com/willb335/chessboardjsx
      - React bootstrap:
        - 
  - Back-end:
    - Laravel
    - StockFish (chess bot)
      - https://stockfishchess.org
- DBMS:
  - MariaDB
- Utility:
  - Docker
    - Utilizzato per containerizzare tutti i servizi necessari per il progetto
  - draw.io
    - Utilizzato per realizzare lo schema architetturale del progetto
  - Figma
    - Utilizzato per realizzare il mockup dell'interfaccia grafica

## Installazione
Guardare il file README situato in code/osi-chess-app/README.md
