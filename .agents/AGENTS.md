# Rules & Guidelines - AMBIENTE DEV (SVILUPPO ESCLUSIVO)

- **Direttiva di Sviluppo Esclusiva (DEV ONLY)**:
  - Questa cartella (`APP LIBRERIA DEV`) è l'ambiente ufficiale di SVILUPPO.
  - Tutte le modifiche, nuove feature, refactoring e test devono essere eseguiti tassativamente qui.
  - Il branch di lavoro è ESCLUSIVAMENTE `dev`.
  - È severamente vietato toccare la cartella `APP LIBRERIA` (versione stabile/main) o effettuare push su `origin main` finché l'utente non dice esplicitamente: "rilascia su main" o "fai il merge su main".

- **GitHub Synchronization**:
  - Dopo ogni modifica e completamento dei task, effettua sempre il commit e il push dei cambiamenti su GitHub esclusivamente sul branch `dev`:
    `git add .`
    `git commit -m "..."`
    `git push origin dev`
