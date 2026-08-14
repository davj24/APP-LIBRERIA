import React, { useState } from 'react';
import { Flame, BookmarkPlus, BookmarkCheck } from 'lucide-react';

export const SocialPage: React.FC = () => {
  const [sharedPacts] = useState([
    { id: 1, friend: 'Elena', streak: 12 },
    { id: 2, friend: 'Damiano', streak: 4 }
  ]);

  const [liveReaders] = useState([
    { id: 1, name: 'Tommaso', book: 'Dune', avatarColor: 'bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-200' },
    { id: 2, name: 'Martina', book: '12 Regole per la Vita', avatarColor: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200' },
    { id: 3, name: 'Giorgia', book: "L'Arte della Guerra", avatarColor: 'bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-200' },
  ]);

  const [takeaways, setTakeaways] = useState([
    {
      id: 1,
      bookTitle: 'Atomic Habits',
      author: 'James Clear',
      friend: 'Elena',
      note: 'Il miglioramento dell\'1% quotidiano non è un mito. Ho iniziato ad applicare la regola dei due minuti ed i risultati sulla costanza sono evidenti fin da subito.',
      date: 'Oggi',
      saved: false
    },
    {
      id: 2,
      bookTitle: 'Pensieri Lenti e Veloci',
      author: 'Daniel Kahneman',
      friend: 'Tommaso',
      note: 'Siamo programmati per saltare alle conclusioni. Il Sistema 1 prende il controllo molto più spesso di quanto crediamo, modellando le nostre percezioni quotidiane.',
      date: 'Ieri',
      saved: false
    }
  ]);

  const handleToggleSave = (id: number) => {
    setTakeaways(prev => prev.map(t => t.id === id ? { ...t, saved: !t.saved } : t));
  };

  return (
    <div className="min-h-screen px-5 pt-8 pb-28 max-w-lg mx-auto text-neutral-900 dark:text-neutral-100 font-sans space-y-10">
      
      {/* 1. HEADER */}
      <header className="text-center pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          La mia Cerchia
        </h1>
      </header>

      {/* 2. SEZIONE PATTI DI COSTANZA (Inline Text) */}
      <section className="flex flex-col items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          <Flame size={15} className="text-orange-500" fill="currentColor" />
          <span>Patti Attivi</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium">
          {sharedPacts.map((pact, idx) => (
            <span key={pact.id} className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">{pact.streak} giorni</span> con {pact.friend}
              {idx < sharedPacts.length - 1 && <span className="text-neutral-300 dark:text-neutral-700 ml-2">•</span>}
            </span>
          ))}
        </div>
      </section>

      {/* 3. SEZIONE LIVE NOW (Senza container) */}
      <section className="flex items-center justify-between py-3 border-y border-neutral-200/60 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">In lettura ora:</span>
        </div>

        <div className="flex -space-x-3 overflow-hidden">
          {liveReaders.map(reader => (
            <div
              key={reader.id}
              title={`${reader.name} sta leggendo ${reader.book}`}
              className={`h-8 w-8 rounded-full ring-2 ring-neutral-50 dark:ring-neutral-950 ${reader.avatarColor} flex items-center justify-center text-xs font-bold`}
            >
              {reader.name[0]}
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEED TAKEAWAY (Plain Text Layout) */}
      <section className="space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Spunti Recenti
        </h2>

        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {takeaways.map(takeaway => (
            <article key={takeaway.id} className="py-8 first:pt-0 last:pb-0 space-y-3">
              {/* Riga 1: Avatar minuscolo dell'amico + Nome */}
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-700 dark:text-neutral-300">
                    {takeaway.friend[0]}
                  </div>
                  <span><strong className="font-semibold text-neutral-800 dark:text-neutral-200">{takeaway.friend}</strong> ha evidenziato</span>
                </div>
                <span className="text-[11px] text-neutral-400">{takeaway.date}</span>
              </div>

              {/* Riga 2: Titolo del libro */}
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                {takeaway.bookTitle}
              </h3>

              {/* Riga 3: Testo del takeaway */}
              <p className="text-base text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif italic">
                "{takeaway.note}"
              </p>

              {/* Riga 4: Autore e pulsante testo "Salva" */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                  {takeaway.author}
                </span>
                <button
                  onClick={() => handleToggleSave(takeaway.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors py-1 px-2 -mr-2 cursor-pointer"
                >
                  {takeaway.saved ? (
                    <>
                      <BookmarkCheck size={15} className="text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-400">Salvato</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus size={15} />
                      <span>Salva</span>
                    </>
                  )}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};
