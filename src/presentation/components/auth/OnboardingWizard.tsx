import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SlidersHorizontal, Target, BookOpen, Check, ArrowRight, ArrowLeft, User, PenLine, 
  BookCheck, PieChart, Bookmark, Rocket, LayoutGrid, Camera, Image as ImageIcon, Trash2, ShieldCheck, ChevronDown,
  Flame, Trophy, Clock, Library, Brain
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { UserProfile } from '../../hooks/useUserProfile';

interface OnboardingWizardProps {
  onComplete: () => void;
  userEmail?: string;
}

// 24 Generi Letterari Principali
const GENRE_TAGS = [
  '📚 Narrativa',
  '🐉 Fantasy',
  '🔍 Gialli & Thriller',
  '💡 Saggistica',
  '🏛️ Romanzi Storici',
  '🎨 Manga & Fumetti',
  '🚀 Fantascienza',
  '💖 Romance',
  '📜 Classici',
  '🧠 Filosofia',
  '🎭 Poesia & Teatro',
  '👻 Horror',
  '👤 Biografie',
  '📈 Economia & Business',
  '🌿 Natura & Scienza',
  '🧘 Crescita Personale',
  '🎨 Arte & Design',
  '🧭 Avventura & Viaggi',
  '✨ Young Adult',
  '🔬 Tech & Informatica',
  '🍿 Pop Culture',
  '🧙 Realismo Magico',
  '🍿 Cinema & Serie',
  '🙏 Spiritualità'
];

// 10 Colori Minimal in Stile iOS con Nomi Corrispondenti 100% al Colore Reale
const IOS_AVATAR_PRESETS = [
  { name: 'Viola Indaco', color: 'bg-gradient-to-tr from-indigo-600 to-violet-600' },
  { name: 'Verde Smeraldo', color: 'bg-gradient-to-tr from-emerald-600 to-green-500' },
  { name: 'Arancio Caldo', color: 'bg-gradient-to-tr from-amber-500 to-orange-500' },
  { name: 'Rosa Pastello', color: 'bg-gradient-to-tr from-rose-500 to-pink-500' },
  { name: 'Azzurro Cielo', color: 'bg-gradient-to-tr from-sky-400 to-blue-500' },
  { name: 'Nero Antracite', color: 'bg-gradient-to-tr from-neutral-800 to-neutral-950' },
  { name: 'Viola Scuro', color: 'bg-gradient-to-tr from-purple-800 to-indigo-950' },
  { name: 'Verde Menta', color: 'bg-gradient-to-tr from-teal-400 to-emerald-400' },
  { name: 'Rosso Corallo', color: 'bg-gradient-to-tr from-rose-500 to-red-500' },
  { name: 'Marrone Moka', color: 'bg-gradient-to-tr from-stone-700 to-amber-900' }
];

// 10 Widget di Profilo Selezionabili
const WIDGET_OPTIONS = [
  {
    id: 'read_count',
    title: 'Totale Letti',
    desc: 'Conteggio libri letti',
    icon: BookCheck,
    iconColor: 'text-emerald-500'
  },
  {
    id: 'reading_count',
    title: 'In Lettura',
    desc: 'Libri sul comodino',
    icon: BookOpen,
    iconColor: 'text-amber-500'
  },
  {
    id: 'current_progress',
    title: '% Avanzamento',
    desc: '% ultimo libro aperto',
    icon: PieChart,
    iconColor: 'text-emerald-500'
  },
  {
    id: 'total_pages',
    title: 'Pagine Totali',
    desc: 'Totale pagine lette',
    icon: Bookmark,
    iconColor: 'text-sky-500'
  },
  {
    id: 'annual_goal',
    title: 'Obiettivo Annuale',
    desc: 'Avanzamento target 2026',
    icon: Target,
    iconColor: 'text-rose-500'
  },
  {
    id: 'reading_streak',
    title: 'Streak Lettura',
    desc: 'Giorni consecutivi',
    icon: Flame,
    iconColor: 'text-orange-500'
  },
  {
    id: 'top_genre',
    title: 'Genere Dominante',
    desc: 'Categoria più letta',
    icon: Brain,
    iconColor: 'text-teal-500'
  },
  {
    id: 'average_pace',
    title: 'Ritmo Medio',
    desc: 'Pagine al giorno',
    icon: Clock,
    iconColor: 'text-purple-500'
  },
  {
    id: 'to_read_backlog',
    title: 'Da Iniziare / Backlog',
    desc: 'Libri nello scaffale',
    icon: Library,
    iconColor: 'text-amber-600'
  },
  {
    id: 'max_streak',
    title: 'Record Assoluto',
    desc: 'Striscia di giorni max',
    icon: Trophy,
    iconColor: 'text-amber-400'
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { completeOnboarding } = useUserProfile();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab per la modalità avatar (iniziale vs foto caricata)
  const [avatarTab, setAvatarTab] = useState<'initial' | 'custom'>('initial');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  // Stato per le pillole espandibili nel Passo 2
  const [isGenresOpen, setIsGenresOpen] = useState(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  // Form State: I generi preferiti sono entità separate rispetto alla bio testuale
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '',
    bio: 'Lettore appassionato di libri e saggi',
    readingGoal: 24,
    avatarColor: 'bg-gradient-to-tr from-indigo-600 to-violet-600',
    avatarUrl: undefined,
    selectedWidgets: ['read_count', 'reading_count'],
    favoriteGenres: ['🐉 Fantasy', '📚 Narrativa']
  });

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    } else {
      completeOnboarding(formData);
      onComplete();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
        setAvatarTab('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCustomImage = () => {
    setFormData(prev => ({ ...prev, avatarUrl: undefined }));
    setAvatarTab('initial');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Toggle dei generi preferiti come entità separate nell'array
  const toggleGenre = (genre: string) => {
    const current = formData.favoriteGenres || [];
    if (current.includes(genre)) {
      setFormData({ ...formData, favoriteGenres: current.filter(g => g !== genre) });
    } else {
      setFormData({ ...formData, favoriteGenres: [...current, genre] });
    }
  };

  const toggleWidget = (wId: string) => {
    const current = formData.selectedWidgets || [];
    if (current.includes(wId)) {
      setFormData({ ...formData, selectedWidgets: current.filter(id => id !== wId) });
    } else {
      if (current.length < 2) {
        setFormData({ ...formData, selectedWidgets: [...current, wId] });
      } else {
        setFormData({ ...formData, selectedWidgets: [current[0], wId] });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] dark:bg-[#2A2826] text-[#4A4743] dark:text-[#E0DCD3] flex flex-col items-center justify-center p-4 antialiased selection:bg-[#B0BEA9]/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#FCFBF8] dark:bg-[#33302D] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 relative overflow-hidden space-y-5"
      >
        {/* Glow di Sfondo */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#5C6B55]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Progress Wizard (4 Passi) */}
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center justify-between text-xs font-bold text-[#7A756D] dark:text-[#A09A90]">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#5C6B55] dark:text-[#A0AF99]" />
              Configurazione Iniziale Profilo
            </span>
            <span>Passo {step} di 4</span>
          </div>

          {/* Barra di Progresso */}
          <div className="w-full h-2 rounded-full bg-[#EBE5D9] dark:bg-[#4A4743]/60 overflow-hidden">
            <motion.div
              className="h-full bg-[#5C6B55] dark:bg-[#A0AF99] rounded-full"
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Contenuto Dinamico per Step */}
        <div className="relative z-10 min-h-[320px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STEP 1: Nome e Icona Avatar (iOS Minimal & Caricamento Foto) */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-xl font-black text-[#31362F] dark:text-[#E0DCD3]">Benvenuto su BiblioDesk! 👋</h2>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Crea il tuo profilo inserendo il nome e la foto o colore preferito:</p>
                </div>

                {/* Anteprima Avatar con Ridimensionamento Adattato */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative group">
                    <div className={`w-22 h-22 rounded-3xl ${formData.avatarUrl ? 'bg-neutral-200 dark:bg-neutral-800' : formData.avatarColor} text-white font-black text-3xl flex items-center justify-center shadow-lg border-4 border-white dark:border-[#2A2826] overflow-hidden`}>
                      {formData.avatarUrl ? (
                        <img 
                          src={formData.avatarUrl} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span>{formData.name ? formData.name.trim().charAt(0).toUpperCase() : '?'}</span>
                      )}
                    </div>

                    {/* Bottone rapido fotocamera su avatar */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#31362F] dark:bg-white text-white dark:text-[#31362F] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white dark:border-[#33302D]"
                      title="Carica o cambia immagine"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tab di selezione modalità: Iniziale vs Carica Immagine */}
                  <div className="flex bg-[#F4F1EA] dark:bg-[#2A2826] p-1 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60">
                    <button
                      type="button"
                      onClick={() => setAvatarTab('initial')}
                      className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all ${
                        avatarTab === 'initial'
                          ? 'bg-[#5C6B55] text-white shadow-xs'
                          : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
                      }`}
                    >
                      Iniziale & Colore
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarTab('custom');
                        if (!formData.avatarUrl) {
                          fileInputRef.current?.click();
                        }
                      }}
                      className={`px-3 py-1 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 ${
                        avatarTab === 'custom'
                          ? 'bg-[#5C6B55] text-white shadow-xs'
                          : 'text-[#7A756D] dark:text-[#A09A90] hover:text-[#31362F] dark:hover:text-[#E0DCD3]'
                      }`}
                    >
                      <ImageIcon className="w-3 h-3" />
                      <span>Carica Foto</span>
                    </button>
                  </div>

                  {/* Input File Nascosto */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* Pillola per i Colori che si espande */}
                  {avatarTab === 'initial' ? (
                    <div className="flex flex-col items-center space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                        className="px-3.5 py-1.5 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                      >
                        <div className={`w-3.5 h-3.5 rounded-full ${IOS_AVATAR_PRESETS.find(p => p.color === formData.avatarColor)?.color || IOS_AVATAR_PRESETS[0].color}`} />
                        <span>Colore Avatar ({IOS_AVATAR_PRESETS.find(p => p.color === formData.avatarColor)?.name || 'Viola Indaco'})</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-[#7A756D] dark:text-[#A09A90] transition-transform duration-200 ${isColorPickerOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Griglia Colori Espandibile con Animazione */}
                      <AnimatePresence>
                        {isColorPickerOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: 'auto', scale: 1 }}
                            exit={{ opacity: 0, height: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-w-[280px]"
                          >
                            <div className="flex items-center justify-center flex-wrap gap-2">
                              {IOS_AVATAR_PRESETS.map((preset) => (
                                <button
                                  key={preset.name}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, avatarColor: preset.color, avatarUrl: undefined });
                                    setIsColorPickerOpen(false);
                                  }}
                                  className={`w-7 h-7 rounded-full ${preset.color} border-2 ${
                                    formData.avatarColor === preset.color && !formData.avatarUrl ? 'border-[#31362F] dark:border-white scale-110 shadow-md' : 'border-transparent opacity-85 hover:opacity-100'
                                  } transition-all cursor-pointer`}
                                  title={preset.name}
                                />
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    /* Sezione Foto Personalizzata: Cliccando su Carica Foto o sull'avatar si apre direttamente il selettore nativo */
                    <div className="flex flex-col items-center gap-2 max-w-[290px] text-center">
                      {formData.avatarUrl && (
                        <button
                          type="button"
                          onClick={removeCustomImage}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Rimuovi Foto Caricata</span>
                        </button>
                      )}

                      {/* Avviso sicurezza sui permessi del browser */}
                      <div className="flex items-start gap-1.5 text-[10px] text-[#7A756D] dark:text-[#A09A90] bg-[#F4F1EA] dark:bg-[#2A2826] p-2.5 rounded-xl border border-[#EBE5D9] dark:border-[#4A4743]/50 text-left">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">
                          I permessi di accesso ai file sono gestiti direttamente dal tuo browser. La Web App non ha alcun accesso diretto alla tua galleria.
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo Nome (VUOTO di default) */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3]">Nome Profilo *</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A756D] dark:text-[#A09A90]" />
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Inserisci il tuo nome..."
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs sm:text-sm text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#5C6B55]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Bio, Generi Preferiti Espandibili & Widget Espandibili */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-black text-[#31362F] dark:text-[#E0DCD3]">Bio, Generi & Widget Profilo 📝</h2>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Personalizza la tua bio, seleziona i generi preferiti ed i widget:</p>
                </div>

                {/* Input Bio Testuale */}
                <div className="relative">
                  <PenLine className="w-4 h-4 absolute left-3.5 top-2.5 text-[#7A756D] dark:text-[#A09A90]" />
                  <textarea
                    rows={2}
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Es. Lettore appassionato di libri e saggi"
                    className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs text-[#4A4743] dark:text-[#E0DCD3] focus:outline-none focus:border-[#5C6B55] resize-none"
                  />
                </div>

                {/* Pillola Espandibile: Generi Preferiti (Entità Separate) */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsGenresOpen(!isGenresOpen)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-all flex items-center justify-between cursor-pointer shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="text-base">📚</span>
                      <span>Generi Preferiti</span>
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                      <span className="font-extrabold text-[#5C6B55] dark:text-[#A0AF99]">
                        {(formData.favoriteGenres || []).length} selezionati
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isGenresOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isGenresOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-48 overflow-y-auto custom-scrollbar"
                      >
                        <span className="text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90] block mb-2">
                          Seleziona i generi letterari da mostrare sul tuo profilo:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {GENRE_TAGS.map((genre) => {
                            const isSelected = (formData.favoriteGenres || []).includes(genre);

                            return (
                              <button
                                key={genre}
                                type="button"
                                onClick={() => toggleGenre(genre)}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#5C6B55] text-white border-[#5C6B55] shadow-xs'
                                    : 'bg-[#FCFBF8] dark:bg-[#33302D] border-[#EBE5D9] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3]'
                                }`}
                              >
                                <span>{genre}</span>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Pillola Espandibile: Widget di Profilo */}
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setIsWidgetsOpen(!isWidgetsOpen)}
                    className="w-full px-3.5 py-2 rounded-2xl bg-[#F4F1EA] dark:bg-[#2A2826] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-all flex items-center justify-between cursor-pointer shadow-xs"
                  >
                    <span className="flex items-center gap-1.5">
                      <LayoutGrid className="w-4 h-4 text-[#5C6B55]" />
                      <span>Widget in Evidenza</span>
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                      <span className="font-extrabold text-[#5C6B55] dark:text-[#A0AF99]">
                        {(formData.selectedWidgets || []).length}/2 selezionati
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isWidgetsOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isWidgetsOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden bg-[#F4F1EA] dark:bg-[#2A2826] p-3 rounded-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 max-h-56 overflow-y-auto custom-scrollbar"
                      >
                        <span className="text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90] block mb-2">
                          Scegli fino a 2 widget da evidenziare in alto sul tuo profilo:
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                          {WIDGET_OPTIONS.map((w) => {
                            const isSelected = (formData.selectedWidgets || []).includes(w.id);
                            const IconComp = w.icon;

                            return (
                              <button
                                key={w.id}
                                type="button"
                                onClick={() => toggleWidget(w.id)}
                                className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 border-[#5C6B55] shadow-xs'
                                    : 'bg-[#FCFBF8] dark:bg-[#33302D] border-[#EBE5D9] dark:border-[#4A4743]/60'
                                }`}
                              >
                                <div className={`w-7 h-7 rounded-xl bg-white dark:bg-[#2A2826] flex items-center justify-center shrink-0 shadow-xs ${w.iconColor}`}>
                                  <IconComp className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-[#31362F] dark:text-[#E0DCD3] truncate">{w.title}</span>
                                    {isSelected && (
                                      <span className="w-4 h-4 rounded-full bg-[#5C6B55] text-white flex items-center justify-center shrink-0 ml-1">
                                        <Check className="w-2.5 h-2.5" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-[#7A756D] dark:text-[#A09A90] truncate">{w.desc}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Obiettivo Annuale Lettura con Slider interattivo fino a 100 libri */}
            {step === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5 text-center"
              >
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-[#31362F] dark:text-[#E0DCD3]">Obiettivo di Lettura 🎯</h2>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Quanti libri desideri leggere quest'anno?</p>
                </div>

                {/* Target Number Highlight */}
                <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-4 sm:p-5 rounded-3xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4">
                  <div className="text-4xl font-black text-[#5C6B55] dark:text-[#A0AF99] flex items-center justify-center gap-2">
                    <Target className="w-8 h-8" />
                    <span>{formData.readingGoal || 24}</span>
                    <span className="text-xs font-extrabold text-[#7A756D] dark:text-[#A09A90] uppercase">libri/anno</span>
                  </div>

                  {/* Slider Interattivo da 1 a 100 libri */}
                  <div className="space-y-2 px-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      step="1"
                      value={formData.readingGoal || 24}
                      onChange={(e) => setFormData({ ...formData, readingGoal: parseInt(e.target.value, 10) })}
                      className="w-full h-2 bg-[#EBE5D9] dark:bg-[#4A4743] rounded-lg appearance-none cursor-pointer accent-[#5C6B55]"
                    />
                    <div className="flex items-center justify-between text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90]">
                      <span>1 libro</span>
                      <span>50 libri</span>
                      <span>100 libri</span>
                    </div>
                  </div>

                  <p className="text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                    Circa <span className="text-[#31362F] dark:text-[#E0DCD3] font-bold">{Math.max(1, Math.round((formData.readingGoal || 24) / 12))} libri</span> al mese!
                  </p>
                </div>

                {/* Quick Goal Preset Chips */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {[12, 24, 36, 50, 75, 100].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData({ ...formData, readingGoal: goal })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        formData.readingGoal === goal
                          ? 'bg-[#5C6B55] text-white border-[#5C6B55] shadow-xs scale-105'
                          : 'bg-[#F4F1EA] dark:bg-[#2A2826] border-[#EBE5D9] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9]'
                      }`}
                    >
                      {goal} libri
                    </button>
                  ))}
                </div>

                {/* Nota rassicurante che obiettivi e statistiche sono modificabili in seguito */}
                <p className="text-[10px] text-[#7A756D] dark:text-[#A09A90] italic max-w-xs mx-auto leading-tight">
                  💡 È solo il primo traguardo! Potrai sempre modificare il tuo obiettivo e le statistiche nelle Impostazioni in qualsiasi momento.
                </p>
              </motion.div>
            )}

            {/* STEP 4: Completamento (TUTTO PRONTO) */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-center py-4"
              >
                <div className="w-16 h-16 mx-auto rounded-3xl bg-[#5C6B55] text-white flex items-center justify-center shadow-lg animate-bounce">
                  <Rocket className="w-8 h-8 text-amber-300" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-[#31362F] dark:text-[#E0DCD3]">Tutto Pronto! 🎉</h2>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90] max-w-xs mx-auto">
                    Il tuo profilo BiblioDesk è configurato. Ora puoi esplorare la libreria, aggiungere i tuoi libri e collegarti con altri lettori!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigazione Wizard */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EBE5D9] dark:border-[#4A4743]/50 relative z-10">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2.5 rounded-xl border border-[#EBE5D9] dark:border-[#4A4743]/60 text-xs font-bold text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNextStep}
            disabled={step === 1 && !formData.name?.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#5C6B55] hover:bg-[#4A5744] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer ml-auto active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{step === 4 ? 'Inizia ad usare BiblioDesk' : 'Continua'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
