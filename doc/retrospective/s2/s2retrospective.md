## Retrospettiva Sprint 2

### Pianificazione

Abbiamo sfruttato il primo giorno dello sprint per occuparci della pianificazione, innanzitutto abbiamo
guardato indietro allo sprint precedente per ripescare una task che non era stata completata, abbiamo poi 
riorganizzato i ruoli all'interno del team e siamo passati a definire le task per lo sprint 2.

Abbiamo cercato sempre di scrivere task chiare e di assegnarle al membro adatto del team, in modo da poter 
lavorare in parallelo e in modo da poter avere sempre qualcosa da fare.


### Sprint Goal

Per questo sprint ci eravamo inizialmente posti l'obiettivo di stilare le pagine già costruite e di rendere
l'esperienza di gioco degli utenti più piacevole inserendo delle features come quella di poter vedere i pezzi
catturati. Inoltre ci eravamo prefissati di correggere alcuni errori che avvenivano durante la partita contro il bot.

In seguito ci è stata rivelata la checklist dello sprint 2 che ci ha costretto a cambiare i nostri obiettivi, siamo
passati quindi ad avere come obiettivo principale quello di avere una partita giocabile sia in pvb che in pvp, e di
implementare le funzionalità dei timer di gioco.


### Definition of Ready

- Come utente vorrei poter accedere al mio profilo e modificare la password

È necessario che sia pronto il backend per la gestione degli utenti e che sia pronta la pagina di login e di registrazione.

- Come giocatore, voglio poter leggere il tempo a disposizione per me ed il tempo a disposizione per il mio avversario durante la partita

È necessario che sia pronta la pagina di gioco

- Come giocatore, voglio poter selezionare la modalità di gioco (PvB o PvP) durante la creazione di una partita.

È necessario che sia pronta la pagina di creazione partita

- Come giocatore vorrei potermi unire ad una partita inserendo il suo codice

È necessario che sia pronta la pagina di creazione partita e che sia pronto il backend per la gestione delle partite

- Come giocatore voglio poter annullare la mia mossa

È necessario che sia pronta la pagina di gioco e che sia pronto il backend per la gestione dell'undo della mossa

### Definition of Done (per task)

- Come utente vorrei poter accedere al mio profilo e modificare la password

L'utente loggato deve poter accedere al suo profilo e poter modificare la password

- Come giocatore, voglio poter leggere il tempo a disposizione per me ed il tempo a disposizione per il mio avversario durante la partita

Nella pagina di gioco devono essere presenti due timer che indicano il tempo a disposizione per il giocatore e per il suo avversario,
il timer deve essere sincronizzato con il backend e deve essere possibile mettere in pausa il timer quando è il turno dell'avversario

- Come giocatore, voglio poter selezionare la modalità di gioco (PvB o PvP) durante la creazione di una partita.

Nella pagina di creazione partita deve essere possibile selezionare la modalità di gioco (PvB o PvP), 
deve essere possibile giocare con l'altro giocatore utilizzando i websocket

- Come giocatore vorrei potermi unire ad una partita inserendo il suo codice

Nella pagina di creazione partita deve essere possibile inserire il codice della partita a cui si vuole unire,
deve essere possibile giocare con l'altro giocatore utilizzando i websocket

- Come giocatore voglio poter annullare la mia mossa

Nella pagina di gioco deve essere presente un pulsante che permette di annullare la mossa,
deve essere possibile annullare la mossa solo se è il proprio turno e si gioca contro il bot

## Retrospective

Nella stesura della retrospettiva abbiamo deciso come per lo sprint 1 di 
fare il diagramma a stella perchè ci eravamo troavti bene con questo metodo.

Inlotre abbiamo anche fatto la tabella di valutazione dei ruoli e delle performance
e abbiamo compilato la tabella delle carte essence.

Tutti i file relativi si trovano nella cartella `doc/retrospective/s2`.

### VELOCITY
Velocity Sprint 1: 164 SP
Velocity Sprint 2: 98 SP

Media Velocity: 131 SP