import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Target, BookOpen, Check, ArrowRight, ArrowLeft, User, PenLine, 
  BookCheck, PieChart, Bookmark, Rocket, LayoutGrid, Camera, Image as ImageIcon, Trash2, ShieldCheck, Upload
} from 'lucide-react';
import { useUserProfile } from '../../hooks/useUserProfile';
import type { UserProfile } from '../../hooks/useUserProfile';

interface OnboardingWizardProps {
  onComplete: () => void;
  userEmail?: string;
}

const GENRE_TAGS = [
  '📚 Narrativa',
  '🐉 Fantasy',
  '🔍 Gialli',
  '💡 Saggi',
  '🏛️ Storia',
  '🎨 Manga',
  '🚀 Sci-Fi',
  '💖 Romance'
];

// 10 Colori Minimal in Stile iOS
const IOS_AVATAR_PRESETS = [
  { name: 'Indaco', color: 'bg-gradient-to-tr from-indigo-600 to-violet-500' },
  { name: 'Smeraldo', color: 'bg-gradient-to-tr from-emerald-600 to-teal-500' },
  { name: 'Amber', color: 'bg-gradient-to-tr from-amber-500 to-orange-500' },
  { name: 'Rose', color: 'bg-gradient-to-tr from-rose-500 to-pink-500' },
  { name: 'Oceano', color: 'bg-gradient-to-tr from-sky-500 to-blue-600' },
  { name: 'Antracite', color: 'bg-gradient-to-tr from-neutral-700 to-neutral-900' },
  { name: 'Mezzanotte', color: 'bg-gradient-to-tr from-purple-700 to-indigo-900' },
  { name: 'Menta', color: 'bg-gradient-to-tr from-teal-500 to-emerald-400' },
  { name: 'Corallo', color: 'bg-gradient-to-tr from-orange-400 to-rose-400' },
  { name: 'Moka', color: 'bg-gradient-to-tr from-amber-700 to-yellow-600' }
];

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
    iconColor: 'text-indigo-500'
  },
  {
    id: 'total_pages',
    title: 'Pagine Totali',
    desc: 'Totale pagine lette',
    icon: Bookmark,
    iconColor: 'text-sky-500'
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { completeOnboarding } = useUserProfile();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab per la modalità avatar (iniziale vs foto caricata)
  const [avatarTab, setAvatarTab] = useState<'initial' | 'custom'>('initial');

  // Form State: Il nome parte COMPLETAMENTE VUOTO come richiesto
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: '', // Vuoto! Nessun nome pre-impostato
    bio: 'Lettore appassionato di libri e saggi',
    readingGoal: 24,
    avatarColor: 'bg-gradient-to-tr from-indigo-600 to-violet-500',
    avatarUrl: undefined,
    selectedWidgets: ['read_count', 'reading_count']
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

  // Caricamento Immagine con adattamento e ridimensionamento
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

  const toggleTag = (tag: string) => {
    const cleanTag = tag.replace(/^[^\s]+\s/, '');
    const currentBio = formData.bio || '';
    if (currentBio.includes(cleanTag)) {
      const updated = currentBio.replace(` • ${cleanTag}`, '').replace(cleanTag, '');
      setFormData({ ...formData, bio: updated.trim() });
    } else {
      const updated = currentBio ? `${currentBio} • ${cleanTag}` : cleanTag;
      setFormData({ ...formData, bio: updated });
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
              <Sparkles className="w-4 h-4 text-[#5C6B55] dark:text-[#A0AF99]" />
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

                  {/* Sezione Selettore Colori iOS Minimal */}
                  {avatarTab === 'initial' ? (
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] font-bold text-[#7A756D] dark:text-[#A09A90] block">
                        Palette Colori Minimal iOS:
                      </span>
                      <div className="flex items-center justify-center flex-wrap gap-2 max-w-[280px]">
                        {IOS_AVATAR_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, avatarColor: preset.color, avatarUrl: undefined });
                            }}
                            className={`w-6 h-6 rounded-full ${preset.color} border-2 ${
                              formData.avatarColor === preset.color && !formData.avatarUrl ? 'border-[#31362F] dark:border-white scale-110 shadow-xs' : 'border-transparent'
                            } transition-all cursor-pointer`}
                            title={preset.name}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Sezione Foto Personalizzata con Avviso Sicurezza & Permessi Browser */
                    <div className="flex flex-col items-center gap-2 max-w-[290px] text-center">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 rounded-xl bg-[#5C6B55] hover:bg-[#4A5744] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{formData.avatarUrl ? 'Sostituisci Immagine' : 'Seleziona Immagine'}</span>
                        </button>

                        {formData.avatarUrl && (
                          <button
                            type="button"
                            onClick={removeCustomImage}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                            title="Rimuovi foto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

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

            {/* STEP 2: Bio, Generi Preferiti & Widget Integrazione (STEP 2 + 4 UNIFICATI) */}
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
                  <h2 className="text-lg font-black text-[#31362F] dark:text-[#E0DCD3]">Bio & Widget Profilo 📝</h2>
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Personalizza la tua descrizione ed i 2 widget in evidenza:</p>
                </div>

                {/* Input Bio */}
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

                {/* Tag Generi Preferiti */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] block">
                    Generi preferiti:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {GENRE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] border border-[#EBE5D9] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3] transition-all cursor-pointer active:scale-95"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Widget In Evidenza (Scegli 2) */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-[#7A756D] dark:text-[#A09A90] flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3 text-[#5C6B55]" /> Scegli 2 Widget per il profilo:
                    </span>
                    <span className="text-[10px] font-extrabold text-[#5C6B55] dark:text-[#A0AF99]">
                      {(formData.selectedWidgets || []).length}/2 selezionati
                    </span>
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
                              : 'bg-[#F4F1EA] dark:bg-[#2A2826] border-[#EBE5D9] dark:border-[#4A4743]/60'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl bg-white dark:bg-[#33302D] flex items-center justify-center shrink-0 shadow-xs ${w.iconColor}`}>
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
                </div>
              </motion.div>
            )}

            {/* STEP 3: Obiettivo Annuale Lettura */}
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
                  <p className="text-xs text-[#7A756D] dark:text-[#A09A90]">Quanti libri desideri leggere in un anno?</p>
                </div>

                {/* Target Number Highlight */}
                <div className="bg-[#F4F1EA] dark:bg-[#2A2826] p-4 rounded-3xl border border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-2">
                  <div className="text-4xl font-black text-[#5C6B55] dark:text-[#A0AF99] flex items-center justify-center gap-2">
                    <Target className="w-8 h-8" />
                    <span>{formData.readingGoal || 24}</span>
                    <span className="text-xs font-extrabold text-[#7A756D] dark:text-[#A09A90] uppercase">libri/anno</span>
                  </div>

                  <p className="text-[11px] font-semibold text-[#7A756D] dark:text-[#A09A90]">
                    Circa <span className="text-[#31362F] dark:text-[#E0DCD3] font-bold">{Math.max(1, Math.round((formData.readingGoal || 24) / 12))} libri</span> al mese!
                  </p>
                </div>

                {/* Quick Goal Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[12, 24, 36, 50].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setFormData({ ...formData, readingGoal: goal })}
                      className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                        formData.readingGoal === goal
                          ? 'bg-[#5C6B55] text-white border-[#5C6B55] shadow-xs'
                          : 'bg-[#F4F1EA] dark:bg-[#2A2826] border-[#EBE5D9] dark:border-[#4A4743]/60 text-[#4A4743] dark:text-[#E0DCD3]'
                      }`}
                    >
                      {goal} libri
                    </button>
                  ))}
                </div>
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
