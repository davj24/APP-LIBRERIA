# Rules & Guidelines - AMBIENTE MAIN (PRODUZIONE STABILE)

- **Protezione Versione Stabile (MAIN PROTECTED)**:
  - Questa cartella (`APP LIBRERIA`) contiene la versione STABILE rilasciata e utilizzata dagli amici dell'utente.
  - **NON toccare né modificare i file in questa cartella** durante le normali sessioni di sviluppo. Tutte le novità devono essere sviluppate nella cartella `APP LIBRERIA DEV`.
  - Questa cartella e il branch `main` devono essere aggiornati solo ed esclusivamente quando l'utente dà l'istruzione esplicita: "aggiorna la versione stabile" o "effettua il merge da dev a main".

- **GitHub Synchronization (Solo in caso di rilascio esplicitamente autorizzato)**:
  - Solo quando l'utente ordina espressamente un rilascio su produzione:
    `git merge dev` (oppure `git pull origin dev`)
    `git push origin main`
