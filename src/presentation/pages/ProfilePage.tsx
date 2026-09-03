import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { 
  Settings2, Camera, PenLine, BookCheck, BookOpen, X, Check, LayoutGrid, Heart, 
  Plus, Flame, BookmarkPlus, Library, Sparkles, Image as ImageIcon, Trash2, 
  Palette, Bookmark, Target, Clock, Brain, Lightbulb, FastForward, CheckCircle2,
  GripVertical, Minus, SlidersHorizontal, ArrowLeftRight, PieChart, Moon, Book,
  Trophy, Repeat, FolderPlus, ChevronDown, ChevronUp, Tag,
  BookMarked, ArrowLeft, Search, ChevronRight, Star, Crown, Compass, GraduationCap,
  Coffee, Rocket, Zap, Glasses
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useBooks } from '../hooks/useBooks';
import { useRegisterModal } from '../context/ModalContext';
import { GENRES_MAP } from '../../domain/constants/genres';
import { 
  useCollections, 
  type WishlistItem, 
  type CollectionIconName, 
  type UserCollection 
} from '../hooks/useCollections';

export const COLLECTION_ICONS: { name: CollectionIconName; label: string }[] = [
  { name: 'Heart', label: 'Cuore' },
  { name: 'Flame', label: 'Fiamma' },
  { name: 'Trophy', label: 'Trofeo' },
  { name: 'Sparkles', label: 'Stelle' },
  { name: 'Bookmark', label: 'Segnalibro' },
  { name: 'Library', label: 'Libreria' },
  { name: 'Star', label: 'Stella' },
  { name: 'Crown', label: 'Corona' },
  { name: 'Compass', label: 'Bussola' },
  { name: 'GraduationCap', label: 'Laurea' },
  { name: 'Coffee', label: 'Caffè' },
  { name: 'Moon', label: 'Luna' },
  { name: 'Rocket', label: 'Razzo' },
  { name: 'Zap', label: 'Fulmine' },
  { name: 'Glasses', label: 'Occhiali' },
  { name: 'BookMarked', label: 'Libro' }
];

export const COVER_PRESETS = [
  { name: 'Rosa Tramonto', class: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { name: 'Verde Salvia', class: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  { name: 'Notte Stellata', class: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { name: 'Oro Caldo', class: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { name: 'Azzurro Oceano', class: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
  { name: 'Viola Magico', class: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { name: 'Arancio Ardente', class: 'text-orange-500 bg-orange-500/10 border-orange-500/20' }
];

function compressImage(file: File, maxDimension = 600, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}



const BANNER_PRESETS = [
  { name: 'Neutro', class: 'bg-neutral-200 dark:bg-neutral-800' },
  { name: 'Verde Salvia', class: 'bg-[#5C6B55]' },
  { name: 'Tramonto', class: 'bg-gradient-to-r from-amber-500 to-rose-500' },
  { name: 'Notte Stellata', class: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' }
];

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

export type WidgetCategory = 'statistiche' | 'abitudini' | 'libreria' | 'note';

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: WidgetCategory;
  categoryName: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  getValue: (data: {
    readCount: number;
    readingCount: number;
    totalPages: number;
    readingGoal: number;
    streakDays: number;
    averagePace: number;
    dominantGenre: string;
    notesCount: number;
    nextBookTitle: string;
    currentProgressPercent: number;
    timeSlotText: string;
    primaryFormatText: string;
    toReadCount: number;
    maxStreakDays: number;
    reReadsCount: number;
  }) => string;
}

export const WIDGET_CATEGORIES: { id: WidgetCategory | 'tutti'; label: string; icon: any }[] = [
  { id: 'tutti', label: 'Tutti i Widget', icon: LayoutGrid },
  { id: 'statistiche', label: '📊 Avanzamento', icon: PieChart },
  { id: 'abitudini', label: '🔥 Abitudini', icon: Flame },
  { id: 'libreria', label: '📚 Libreria', icon: Library },
  { id: 'note', label: '💡 Appunti', icon: Lightbulb }
];

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  {
    id: 'read_count',
    title: 'Totale Letti',
    description: 'Mostra il numero complessivo dei libri completati. Indicatore base per il tuo storico.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: BookCheck,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    getValue: ({ readCount }) => `${readCount} ${readCount === 1 ? 'Letto' : 'Letti'}`
  },
  {
    id: 'reading_count',
    title: 'In Lettura',
    description: 'Indica il numero di titoli attualmente "sul comodino" da tenere traccia.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: BookOpen,
    iconColor: 'text-amber-500 dark:text-amber-400',
    getValue: ({ readingCount }) => `${readingCount} In Lettura`
  },
  {
    id: 'current_progress',
    title: 'Completamento Attuale',
    description: 'Si aggiorna in tempo reale in base all\'ultimo libro aperto mostrando la percentuale di avanzamento.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: PieChart,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    getValue: ({ currentProgressPercent }) => `${currentProgressPercent}% Completato`
  },
  {
    id: 'total_pages',
    title: 'Pagine Totali',
    description: 'Il conteggio totale delle pagine sfogliate nel tempo. Percezione concreta della lettura.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: Bookmark,
    iconColor: 'text-sky-500 dark:text-sky-400',
    getValue: ({ totalPages }) => `${totalPages.toLocaleString('it-IT')} Pagine`
  },
  {
    id: 'annual_goal',
    title: 'Obiettivo Annuale',
    description: 'Confronta i libri letti con la meta personale prefissata per l\'anno in corso.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: Target,
    iconColor: 'text-rose-500 dark:text-rose-400',
    getValue: ({ readCount, readingGoal }) => `${readCount}/${readingGoal || 24} nel ${new Date().getFullYear()}`
  },
  {
    id: 'average_pace',
    title: 'Ritmo Medio',
    description: 'Calcola la velocità o frequenza media di lettura per stimare i tempi dei libri.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: Clock,
    iconColor: 'text-purple-500 dark:text-purple-400',
    getValue: ({ averagePace }) => `${averagePace} pag/giorno`
  },
  {
    id: 'reading_streak',
    title: 'Streak Lettura',
    description: 'Traccia i giorni consecutivi in cui hai letto, incoraggiando la costanza quotidiana.',
    category: 'abitudini',
    categoryName: '🔥 Abitudini & Costanza',
    icon: Flame,
    iconColor: 'text-orange-500 dark:text-orange-400',
    getValue: ({ streakDays }) => `${streakDays} ${streakDays === 1 ? 'Giorno' : 'Giorni'} di fila`
  },
  {
    id: 'max_streak',
    title: 'Record Assoluto',
    description: 'Mostra la tua striscia di costanza più lunga di sempre. Un trofeo personale che non scompare.',
    category: 'abitudini',
    categoryName: '🔥 Abitudini & Costanza',
    icon: Trophy,
    iconColor: 'text-amber-400 dark:text-amber-300',
    getValue: ({ maxStreakDays }) => `Record: ${maxStreakDays} ${maxStreakDays === 1 ? 'giorno' : 'giorni'}`
  },
  {
    id: 'time_slot',
    title: 'Fascia Oraria Preferita',
    description: 'Tag calcolato in base a quando registri le tue sessioni (es. la sera tardi o la mattina).',
    category: 'abitudini',
    categoryName: '🔥 Abitudini & Costanza',
    icon: Moon,
    iconColor: 'text-indigo-400 dark:text-indigo-300',
    getValue: ({ timeSlotText }) => timeSlotText || 'Nessuna sessione'
  },
  {
    id: 'top_genre',
    title: 'Genere Dominante',
    description: 'Mostra la categoria o il genere più frequente tra le tue letture recenti.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Brain,
    iconColor: 'text-teal-500 dark:text-teal-400',
    getValue: ({ dominantGenre }) => dominantGenre || 'Nessun genere'
  },
  {
    id: 'primary_format',
    title: 'Supporto Dominante',
    description: 'Mostra come preferisci consumare i libri (carta, ebook o audiolibri).',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Book,
    iconColor: 'text-blue-500 dark:text-blue-400',
    getValue: ({ primaryFormatText }) => primaryFormatText || 'Cartaceo'
  },
  {
    id: 'to_read_backlog',
    title: 'Da Iniziare / Backlog',
    description: 'Traccia quanti libri possiedi già o hai acquistato ma che stanno ancora attendendo sullo scaffale.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Library,
    iconColor: 'text-amber-600 dark:text-amber-400',
    getValue: ({ toReadCount }) => `${toReadCount || 0} In Coda`
  },
  {
    id: 'next_up',
    title: 'Il Prossimo',
    description: 'Un reminder rapido che pesca il primo titolo in cima alla tua wishlist.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: FastForward,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    getValue: ({ nextBookTitle }) => nextBookTitle || 'In coda'
  },
  {
    id: 're_reads',
    title: 'Riletture',
    description: 'Traccia quante volte sei tornato su un libro già letto per ripassare o approfondire.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Repeat,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    getValue: ({ reReadsCount }) => `${reReadsCount || 0} Riletture`
  },
  {
    id: 'notes_count',
    title: 'Appunti Salienti',
    description: 'Traccia il numero di concetti, highlight o appunti salvati dai libri.',
    category: 'note',
    categoryName: '💡 Interazione & Note',
    icon: Lightbulb,
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    getValue: ({ notesCount }) => `${notesCount} Note`
  }
];

const cardSpring = { type: 'spring' as const, damping: 30, stiffness: 300, mass: 0.8 };

export const ProfilePage: React.FC = () => {
  const { profile: userProfile, updateProfile } = useUserProfile();
  const { books, addBook } = useBooks();

  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetLibraryModal, setShowWidgetLibraryModal] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<WidgetCategory | 'tutti'>('tutti');
  const [imagePickerType, setImagePickerType] = useState<'avatar' | 'banner' | null>(null);

  // GESTIONE RACCOLTE UTENTE PERSISTENTI (LocalStorage + Supabase Cloud)
  const {
    collections,
    addCollection,
    updateCollection,
    deleteCollection,
    removeItemFromCollection
  } = useCollections();
  const [openedCollection, setOpenedCollection] = useState<UserCollection | null>(null);
  const [editingCollection, setEditingCollection] = useState<UserCollection | null>(null);

  // Modale "Vedi tutte le raccolte" con Ricerca
  const [isAllCollectionsModalOpen, setIsAllCollectionsModalOpen] = useState(false);
  const [searchCollectionQuery, setSearchCollectionQuery] = useState('');

  // Modale Nuova Raccolta State
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollName, setNewCollName] = useState('');
  const [newCollDesc, setNewCollDesc] = useState('');
  const [newCollIcon, setNewCollIcon] = useState<CollectionIconName>('Heart');
  const [newCollCover, setNewCollCover] = useState<string>(COVER_PRESETS[0].class);

  // Registra l'apertura di qualsiasi overlay per disabilitare lo swipe dei tab in App.tsx
  const isAnyOverlayOpen = isEditing || showWidgetLibraryModal || showCreateCollectionModal || isAllCollectionsModalOpen || openedCollection !== null || editingCollection !== null || imagePickerType !== null;
  useRegisterModal(isAnyOverlayOpen);

  const [openSubgenreMap, setOpenSubgenreMap] = useState<Record<string, boolean>>({});

  const toggleSubgenreDropdown = (genreName: string) => {
    setOpenSubgenreMap(prev => ({
      ...prev,
      [genreName]: !prev[genreName]
    }));
  };

  const [expandedGenre, setExpandedGenre] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: userProfile.name ?? 'Nuovo Lettore',
    bio: userProfile.bio ?? '',
    bannerColor: userProfile.bannerUrl ? '' : 'bg-neutral-200 dark:bg-neutral-800',
    avatarUrl: userProfile.avatarUrl || '',
    avatarColor: userProfile.avatarColor || 'from-indigo-600 to-violet-500',
    bannerUrl: userProfile.bannerUrl || '',
    selectedWidgets: Array.isArray(userProfile.selectedWidgets) ? userProfile.selectedWidgets : ['read_count', 'reading_count'],
    favoriteGenres: Array.isArray(userProfile.favoriteGenres) ? userProfile.favoriteGenres : ['Fantasy & Magia', 'Narrativa & Classici'],
    favoriteSubgenres: (userProfile.favoriteSubgenres && typeof userProfile.favoriteSubgenres === 'object') ? userProfile.favoriteSubgenres : {}
  });

  const [draftProfile, setDraftProfile] = useState(profile);

  useEffect(() => {
    setProfile({
      name: userProfile.name ?? 'Nuovo Lettore',
      bio: userProfile.bio ?? '',
      bannerColor: userProfile.bannerUrl ? '' : 'bg-neutral-200 dark:bg-neutral-800',
      avatarUrl: userProfile.avatarUrl || '',
      avatarColor: userProfile.avatarColor || 'from-indigo-600 to-violet-500',
      bannerUrl: userProfile.bannerUrl || '',
      selectedWidgets: Array.isArray(userProfile.selectedWidgets) ? userProfile.selectedWidgets : ['read_count', 'reading_count'],
      favoriteGenres: Array.isArray(userProfile.favoriteGenres) ? userProfile.favoriteGenres : ['Fantasy & Magia', 'Narrativa & Classici'],
      favoriteSubgenres: (userProfile.favoriteSubgenres && typeof userProfile.favoriteSubgenres === 'object') ? userProfile.favoriteSubgenres : {}
    });
  }, [userProfile]);

  // Input file hidden per Fotocamera e Galleria
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);
  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);
  const bannerCameraInputRef = useRef<HTMLInputElement>(null);
  const bannerGalleryInputRef = useRef<HTMLInputElement>(null);

  const readCount = books.filter(b => b.status === 'Letto').length;
  const readingCount = books.filter(b => b.status === 'In lettura').length;
  const toReadCount = books.filter(b => b.status === 'Da leggere').length;

  const currentReadingBook = books.find(b => b.status === 'In lettura');
  const currentProgressPercent = currentReadingBook && currentReadingBook.totalPages
    ? Math.min(100, Math.round(((currentReadingBook.pagesRead || 0) / currentReadingBook.totalPages) * 100))
    : 0;

  const calculatedTotalPages = books.reduce((acc, b) => acc + (b.pagesRead || (b.status === 'Letto' ? b.totalPages || 0 : 0)), 0);
  const getDominantGenre = () => {
    if (books.length === 0) return 'Nessun genere';
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.genre) counts[b.genre] = (counts[b.genre] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Nessun genere';
  };

  const widgetData = {
    readCount,
    readingCount,
    totalPages: calculatedTotalPages,
    readingGoal: userProfile.readingGoal || 24,
    streakDays: 0,
    averagePace: 0,
    dominantGenre: getDominantGenre(),
    notesCount: 0,
    nextBookTitle: collections[0]?.items[0]?.title || 'Nessun libro in wishlist',
    currentProgressPercent,
    timeSlotText: 'Nessuna sessione',
    primaryFormatText: 'Cartaceo',
    toReadCount: toReadCount,
    maxStreakDays: 0,
    reReadsCount: 0
  };

  const handleOpenEdit = () => {
    setDraftProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(draftProfile);
    updateProfile({
      name: draftProfile.name,
      bio: draftProfile.bio,
      avatarUrl: draftProfile.avatarUrl,
      avatarColor: draftProfile.avatarColor,
      bannerUrl: draftProfile.bannerUrl,
      selectedWidgets: draftProfile.selectedWidgets,
      favoriteGenres: draftProfile.favoriteGenres,
      favoriteSubgenres: draftProfile.favoriteSubgenres
    });
    setIsEditing(false);
  };

  const handleToggleGenre = (genreName: string) => {
    setDraftProfile(prev => {
      const current = prev.favoriteGenres || [];
      if (current.includes(genreName)) {
        const nextSubMap = { ...(prev.favoriteSubgenres || {}) };
        delete nextSubMap[genreName];
        return {
          ...prev,
          favoriteGenres: current.filter(g => g !== genreName),
          favoriteSubgenres: nextSubMap
        };
      } else {
        return {
          ...prev,
          favoriteGenres: [...current, genreName]
        };
      }
    });
  };

  const handleToggleSubgenre = (genreName: string, subName: string) => {
    setDraftProfile(prev => {
      const currentSubMap = prev.favoriteSubgenres || {};
      const currentSubs = currentSubMap[genreName] || [];
      const updatedSubs = currentSubs.includes(subName)
        ? currentSubs.filter(s => s !== subName)
        : [...currentSubs, subName];

      return {
        ...prev,
        favoriteSubgenres: {
          ...currentSubMap,
          [genreName]: updatedSubs
        }
      };
    });
  };

  const handleToggleWidget = (id: string) => {
    setDraftProfile(prev => {
      const current = prev.selectedWidgets || [];
      if (current.includes(id)) {
        return { ...prev, selectedWidgets: current.filter(wId => wId !== id) };
      } else {
        if (current.length >= 2) {
          return { ...prev, selectedWidgets: [current[1], id] };
        } else {
          return { ...prev, selectedWidgets: [...current, id] };
        }
      }
    });
  };

  const handleRemoveWidget = (id: string) => {
    setDraftProfile(prev => ({
      ...prev,
      selectedWidgets: (prev.selectedWidgets || []).filter(wId => wId !== id)
    }));
  };

  const handleSwapWidgets = () => {
    setDraftProfile(prev => {
      const current = prev.selectedWidgets || [];
      if (current.length < 2) return prev;
      return { ...prev, selectedWidgets: [current[1], current[0]] };
    });
  };

  const handleWidgetDragEnd = (_: any, info: PanInfo) => {
    if (draftProfile.selectedWidgets.length < 2) return;
    const threshold = 12;
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.offset.y) > threshold) {
      handleSwapWidgets();
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, target === 'avatar' ? 400 : 800, 0.75);
      if (compressedDataUrl) {
        if (target === 'avatar') {
          setDraftProfile(prev => ({ ...prev, avatarUrl: compressedDataUrl }));
        } else {
          setDraftProfile(prev => ({ ...prev, bannerUrl: compressedDataUrl, bannerColor: '' }));
        }
      }
    } catch (err) {
      console.warn('Errore compressione immagine:', err);
    }
    setImagePickerType(null);
    e.target.value = '';
  };

  const handleRemoveImage = (target: 'avatar' | 'banner') => {
    if (target === 'avatar') {
      setDraftProfile(prev => ({ ...prev, avatarUrl: '' }));
    } else {
      setDraftProfile(prev => ({ ...prev, bannerUrl: '', bannerColor: 'bg-neutral-200 dark:bg-neutral-800' }));
    }
    setImagePickerType(null);
  };

  const handleSelectBannerPreset = (presetClass: string) => {
    setDraftProfile(prev => ({ ...prev, bannerUrl: '', bannerColor: presetClass }));
    setImagePickerType(null);
  };


  // CREAZIONE NUOVA RACCOLTA
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollName.trim()) return;

    await addCollection({
      name: newCollName.trim(),
      description: newCollDesc.trim() || 'Raccolta personalizzata',
      iconName: newCollIcon,
      accentColor: newCollCover,
    });

    setNewCollName('');
    setNewCollDesc('');
    setShowCreateCollectionModal(false);
  };

  // SALVA MODIFICHE RACCOLTA ESISTENTE
  const handleSaveEditedCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;

    await updateCollection(editingCollection);
    if (openedCollection && openedCollection.id === editingCollection.id) {
      setOpenedCollection(editingCollection);
    }
    setEditingCollection(null);
  };

  // ELIMINA RACCOLTA
  const handleDeleteCollection = async (id: string) => {
    await deleteCollection(id);
    if (openedCollection?.id === id) setOpenedCollection(null);
    setEditingCollection(null);
  };

  // SPOSTA LIBRO DA RACCOLTA A LIBRERIA PRINCIPALE
  const handleMoveCollectionItemToLibrary = async (item: WishlistItem) => {
    addBook({
      title: item.title,
      author: item.author,
      coverUrl: item.coverUrl,
      startDate: '',
      endDate: '',
      status: 'Da leggere',
      totalPages: 300,
      pagesRead: 0,
      genre: 'Raccolta'
    });

    if (openedCollection) {
      await removeItemFromCollection(openedCollection.id, item.id);
      setOpenedCollection(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== item.id) } : null);
    }
  };

  const getCollectionIcon = (iconName: CollectionIconName, className?: string) => {
    const cls = className || "w-4 h-4";
    switch (iconName) {
      case 'Heart': return <Heart className={cls} />;
      case 'Flame': return <Flame className={cls} />;
      case 'Trophy': return <Trophy className={cls} />;
      case 'Sparkles': return <Sparkles className={cls} />;
      case 'Bookmark': return <Bookmark className={cls} />;
      case 'Library': return <Library className={cls} />;
      case 'Star': return <Star className={cls} />;
      case 'Crown': return <Crown className={cls} />;
      case 'Compass': return <Compass className={cls} />;
      case 'GraduationCap': return <GraduationCap className={cls} />;
      case 'Coffee': return <Coffee className={cls} />;
      case 'Moon': return <Moon className={cls} />;
      case 'Rocket': return <Rocket className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      case 'Glasses': return <Glasses className={cls} />;
      case 'BookMarked': return <BookMarked className={cls} />;
      default: return <Heart className={cls} />;
    }
  };

  const renderWidgetBadge = (widgetId: string) => {
    const def = WIDGET_DEFINITIONS.find(w => w.id === widgetId);
    if (!def) return null;
    const IconComp = def.icon;
    const valueText = def.getValue(widgetData);

    return (
      <div 
        key={def.id}
        className="flex items-center gap-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-3 py-2 text-sm font-semibold text-neutral-900 dark:text-white border border-neutral-200/60 dark:border-neutral-700/60 shadow-xs"
      >
        <IconComp size={16} className={def.iconColor} />
        <span>{valueText}</span>
      </div>
    );
  };

  const filteredWidgets = activeCategoryFilter === 'tutti'
    ? WIDGET_DEFINITIONS
    : WIDGET_DEFINITIONS.filter(w => w.category === activeCategoryFilter);

  const filteredCollectionsForModal = collections.filter(c =>
    c.name.toLowerCase().includes(searchCollectionQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchCollectionQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen px-4 pt-4 pb-24 space-y-6 overflow-hidden">
      
      {/* Input File Nascosti per Fotocamera e Galleria */}
      <input
        type="file"
        ref={avatarCameraInputRef}
        accept="image/*"
        capture="user"
        onChange={(e) => handleImageFileChange(e, 'avatar')}
        className="hidden"
      />
      <input
        type="file"
        ref={avatarGalleryInputRef}
        accept="image/*"
        onChange={(e) => handleImageFileChange(e, 'avatar')}
        className="hidden"
      />
      <input
        type="file"
        ref={bannerCameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={(e) => handleImageFileChange(e, 'banner')}
        className="hidden"
      />
      <input
        type="file"
        ref={bannerGalleryInputRef}
        accept="image/*"
        onChange={(e) => handleImageFileChange(e, 'banner')}
        className="hidden"
      />

      {/* Targhetta Profilo (In alto) */}
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col rounded-[2rem] bg-white dark:bg-neutral-900 shadow-xl overflow-hidden ring-1 ring-neutral-100 dark:ring-neutral-800">
         <div className="h-32 w-full overflow-hidden relative">
           {profile.bannerUrl ? (
             <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
           ) : (
             <div className={`h-full w-full ${profile.bannerColor}`} />
           )}
         </div>
         
         <div className="px-6 pb-6">
           <div className="flex justify-between items-end -mt-12 mb-4">
             <div className={`relative h-24 w-24 rounded-full border-4 border-white dark:border-neutral-900 ${profile.avatarUrl ? 'bg-neutral-300 dark:bg-neutral-700' : (profile.avatarColor?.startsWith('bg-') ? profile.avatarColor : `bg-gradient-to-tr ${profile.avatarColor || 'from-indigo-600 to-violet-500'}`)} flex items-center justify-center font-black text-2xl text-white shadow-sm overflow-hidden`}>
               {profile.avatarUrl ? (
                 <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
               ) : (
                 <span>{profile.name ? profile.name.trim().charAt(0).toUpperCase() : 'D'}</span>
               )}
             </div>
             
             <button 
               onClick={handleOpenEdit} 
               className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-transform active:scale-90 cursor-pointer hover:bg-neutral-200 dark:hover:bg-neutral-700"
               title="Modifica Profilo"
             >
               <Settings2 size={20} />
             </button>
           </div>
           
           <h2 className="text-2xl font-black text-neutral-900 dark:text-white flex items-center gap-2">
             <span>{profile.name}</span>
           </h2>
           <p className="text-sm text-neutral-500 mt-1">
             {profile.bio}
           </p>

           {/* Generi Preferiti con Sottogeneri Cliccabili */}
           {profile.favoriteGenres && profile.favoriteGenres.length > 0 && (
             <div className="mt-4 space-y-2">
               <div className="flex items-center justify-between">
                 <span className="text-[11px] font-extrabold text-[#7A756D] dark:text-[#9A9488] uppercase tracking-wider flex items-center gap-1">
                   <Tag size={12} className="text-[#5C6B55] dark:text-[#A0AF99]" />
                   <span>Generi Preferiti ({profile.favoriteGenres.length})</span>
                 </span>
               </div>
               
               <div className="flex flex-wrap gap-1.5">
                 {profile.favoriteGenres.map((genre) => {
                   const isExpanded = expandedGenre === genre;
                   const subs = profile.favoriteSubgenres?.[genre] || [];

                   return (
                     <button
                       key={genre}
                       type="button"
                       onClick={() => setExpandedGenre(isExpanded ? null : genre)}
                       className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                         isExpanded
                           ? 'bg-[#5C6B55] text-white border-[#5C6B55] shadow-xs'
                           : 'bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 text-[#5C6B55] dark:text-[#A0AF99] border-[#5C6B55]/20 hover:bg-[#5C6B55]/20'
                       }`}
                     >
                       <span>{genre}</span>
                       {subs.length > 0 && (
                         <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${isExpanded ? 'bg-white/20 text-white' : 'bg-[#5C6B55]/20 text-[#5C6B55] dark:text-[#A0AF99]'}`}>
                           {subs.length}
                         </span>
                       )}
                       {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                     </button>
                   );
                 })}
               </div>

               {/* Sottogeneri Espansi */}
               <AnimatePresence>
                 {expandedGenre && profile.favoriteGenres.includes(expandedGenre) && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="p-3.5 rounded-2xl bg-[#F4F1EA] dark:bg-neutral-800/80 border border-[#EBE5D9] dark:border-neutral-700/60 space-y-2 overflow-hidden mt-1"
                   >
                     <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-200">
                       <span className="flex items-center gap-1">
                         <span>Sottogeneri di {expandedGenre}</span>
                       </span>
                       <button onClick={() => setExpandedGenre(null)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white p-0.5 cursor-pointer">
                         <X size={14} />
                       </button>
                     </div>

                     {profile.favoriteSubgenres?.[expandedGenre] && profile.favoriteSubgenres[expandedGenre].length > 0 ? (
                       <div className="flex flex-wrap gap-1.5 pt-1">
                         {profile.favoriteSubgenres[expandedGenre].map(sub => (
                           <span
                             key={sub}
                             className="px-2.5 py-1 rounded-xl text-xs font-medium bg-white dark:bg-neutral-700 text-[#4A4743] dark:text-[#E0DCD3] border border-[#EBE5D9] dark:border-neutral-600 shadow-2xs"
                           >
                             {sub}
                           </span>
                         ))}
                       </div>
                     ) : (
                       <p className="text-xs text-neutral-400 font-medium italic">
                         Nessun sottogenere specifico selezionato. Puoi selezionarne dal pulsante Modifica Profilo.
                       </p>
                     )}
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           )}
           
           {/* Widget Selezionati (Max 2) */}
           <div className="flex flex-wrap gap-2 mt-4">
             {profile.selectedWidgets.map(wId => renderWidgetBadge(wId))}
           </div>
         </div>
      </div>

      {/* SCHERMATA MODIFICA / EDITOR (MODALE) */}
      <AnimatePresence>
        {isEditing && (
          <div key="profile-editor-modal" className="fixed inset-0 z-[100] flex justify-center items-start pt-6 px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3, ease: 'easeInOut' }} 
              className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl" 
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={cardSpring}
              className="relative z-10 flex h-[80vh] w-full max-w-md flex-col rounded-[2rem] bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800"
            >
               <div className="flex-1 overflow-y-auto">
                 <div className="relative group shrink-0">
                   <div className="h-40 w-full overflow-hidden relative">
                     {draftProfile.bannerUrl ? (
                       <img src={draftProfile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                     ) : (
                       <div className={`h-full w-full ${draftProfile.bannerColor}`} />
                     )}
                   </div>
                   <div 
                     onClick={() => setImagePickerType('banner')}
                     className="absolute right-4 bottom-4 rounded-full bg-black/50 hover:bg-black/70 p-2.5 text-white backdrop-blur-md cursor-pointer transition-colors flex items-center gap-1.5 shadow-md"
                     title="Cambia Banner"
                   >
                     <Camera size={18} />
                   </div>
                 </div>
                 
                 <div className="px-6 flex flex-col pb-6">
                   <div className="-mt-14 mb-4 flex items-end justify-between">
                     <div className="relative inline-block self-start">
                       <div className={`h-28 w-28 rounded-full border-4 border-white dark:border-neutral-900 ${draftProfile.avatarUrl ? 'bg-neutral-300 dark:bg-neutral-700' : (draftProfile.avatarColor?.startsWith('bg-') ? draftProfile.avatarColor : `bg-gradient-to-tr ${draftProfile.avatarColor || 'from-indigo-600 to-violet-500'}`)} flex items-center justify-center font-black text-3xl text-white shadow-sm overflow-hidden`}>
                         {draftProfile.avatarUrl ? (
                           <img src={draftProfile.avatarUrl} alt={draftProfile.name} className="w-full h-full object-cover" />
                         ) : (
                           <span>{draftProfile.name ? draftProfile.name.trim().charAt(0).toUpperCase() : 'D'}</span>
                         )}
                       </div>
                       <div 
                         onClick={() => setImagePickerType('avatar')}
                         className="absolute bottom-0 right-0 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white border-2 border-white dark:border-neutral-900 backdrop-blur-md cursor-pointer transition-colors shadow-md"
                         title="Carica Foto Profilo"
                       >
                         <Camera size={14} />
                       </div>
                     </div>

                     {draftProfile.avatarUrl && (
                       <button
                         type="button"
                         onClick={() => setDraftProfile(prev => ({ ...prev, avatarUrl: '' }))}
                         className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                       >
                         <Trash2 size={13} />
                         <span>Rimuovi Foto</span>
                       </button>
                     )}
                   </div>

                   {/* Palette Colori Avatar iOS */}
                   <div className="mb-5 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                         Colore Avatar:
                       </span>
                       {draftProfile.avatarUrl && (
                         <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                           (Foto attiva - tocca un colore per reimpostarlo)
                         </span>
                       )}
                     </div>
                     <div className="flex flex-wrap gap-2">
                       {IOS_AVATAR_PRESETS.map((preset) => {
                         const isSelected = draftProfile.avatarColor === preset.color && !draftProfile.avatarUrl;
                         return (
                           <button
                             key={preset.name}
                             type="button"
                             onClick={() => {
                               setDraftProfile(prev => ({
                                 ...prev,
                                 avatarColor: preset.color,
                                 avatarUrl: ''
                               }));
                             }}
                             title={preset.name}
                             className={`w-7 h-7 rounded-full ${preset.color} transition-all transform cursor-pointer ${
                               isSelected
                                 ? 'ring-2 ring-offset-2 ring-[#31362F] dark:ring-white scale-110 shadow-sm'
                                 : 'opacity-80 hover:opacity-100 hover:scale-105'
                             }`}
                           />
                         );
                       })}
                     </div>
                   </div>

                   <div className="space-y-4 shrink-0">
                     <div className="relative group">
                       <input 
                         value={draftProfile.name} 
                         onChange={(e) => setDraftProfile({...draftProfile, name: e.target.value})}
                         placeholder="Il tuo nome..."
                         className="w-full bg-transparent text-2xl font-black text-neutral-900 dark:text-white outline-none border-b border-transparent focus:border-neutral-400 dark:focus:border-neutral-500 pb-1 pr-8" 
                       />
                       <PenLine className="absolute right-2 top-2 text-neutral-300 dark:text-neutral-600 opacity-50 pointer-events-none" size={16} />
                     </div>
                     <div className="relative group">
                       <textarea 
                         value={draftProfile.bio} 
                         onChange={(e) => setDraftProfile({...draftProfile, bio: e.target.value})}
                         placeholder="La tua bio..."
                         className="w-full bg-transparent text-sm text-neutral-500 dark:text-neutral-400 outline-none border-b border-transparent focus:border-neutral-400 dark:focus:border-neutral-500 min-h-[60px] resize-none pb-1 pr-8" 
                       />
                       <PenLine className="absolute right-2 top-0 text-neutral-300 dark:text-neutral-600 opacity-50 pointer-events-none" size={16} />
                     </div>
                   </div>

                   {/* GESTIONE GENERI & SOTTOGENERI PREFERITI */}
                   <div className="mt-5 space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                         <Tag size={14} />
                         <span>Generi & Sottogeneri Preferiti:</span>
                       </span>
                       <span className="text-[11px] text-neutral-400 font-medium">
                         {draftProfile.favoriteGenres?.length || 0} selezionati
                       </span>
                     </div>

                     {/* Generi Già Selezionati (Panoramica per visualizzarli e rimuoverli rapidamente) */}
                     {draftProfile.favoriteGenres && draftProfile.favoriteGenres.length > 0 && (
                       <div className="p-3 rounded-2xl bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 border border-[#5C6B55]/30 space-y-1.5">
                         <span className="text-[10px] font-extrabold text-[#5C6B55] dark:text-[#A0AF99] uppercase tracking-wider block">
                           Generi Attualmente Selezionati:
                         </span>
                         <div className="flex flex-wrap gap-1.5">
                           {draftProfile.favoriteGenres.map((gName) => {
                             const subs = draftProfile.favoriteSubgenres?.[gName] || [];
                             return (
                               <div
                                 key={gName}
                                 className="px-2.5 py-1 rounded-full text-xs font-bold bg-white dark:bg-neutral-800 text-[#31362F] dark:text-[#E0DCD3] border border-[#5C6B55]/30 flex items-center gap-1.5 shadow-2xs"
                               >
                                 <span>{gName}</span>
                                 {subs.length > 0 && (
                                   <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#5C6B55] text-white">
                                     {subs.length}
                                   </span>
                                 )}
                                 <button
                                   type="button"
                                   onClick={() => handleToggleGenre(gName)}
                                   className="w-4 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-rose-500 hover:text-white text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer"
                                   title={`Rimuovi ${gName}`}
                                 >
                                   <X size={10} strokeWidth={3} />
                                 </button>
                               </div>
                             );
                           })}
                         </div>
                       </div>
                     )}

                     {/* Lista Completa dei Generi con Pallino + Freccia Tendina Sottogeneri */}
                     <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                       {Object.keys(GENRES_MAP).map((genreName) => {
                         const isSelected = draftProfile.favoriteGenres?.includes(genreName);
                         const subgenresAvailable = GENRES_MAP[genreName] || [];
                         const selectedSubgenres = draftProfile.favoriteSubgenres?.[genreName] || [];
                         const isDropdownOpen = !!openSubgenreMap[genreName];

                         return (
                           <div
                             key={genreName}
                             className={`rounded-2xl p-3 border transition-all ${
                               isSelected
                                 ? 'bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 border-[#5C6B55]/40'
                                 : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/60'
                             }`}
                           >
                             <div className="flex items-center justify-between">
                               <span className={`text-xs font-bold ${isSelected ? 'text-[#5C6B55] dark:text-[#A0AF99]' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                 {genreName}
                               </span>

                               <div className="flex items-center gap-2">
                                 {/* Tasto Freccia Tendina Sottogeneri */}
                                 {subgenresAvailable.length > 0 && (
                                   <button
                                     type="button"
                                     onClick={() => toggleSubgenreDropdown(genreName)}
                                     className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                       isDropdownOpen
                                         ? 'bg-[#5C6B55] text-white border-[#5C6B55]'
                                         : 'bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-600 hover:bg-neutral-200'
                                     }`}
                                     title="Apri/chiudi sottogeneri"
                                   >
                                     <span className="text-[10px]">Sottogeneri</span>
                                     {selectedSubgenres.length > 0 && (
                                       <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white/20 text-current">
                                         {selectedSubgenres.length}
                                       </span>
                                     )}
                                     {isDropdownOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                   </button>
                                 )}

                                 {/* Pallino di Selezione Genere (Solo selezione genere senza aprire la tendina) */}
                                 <button
                                   type="button"
                                   onClick={() => handleToggleGenre(genreName)}
                                   className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                     isSelected
                                       ? 'bg-[#5C6B55] border-[#5C6B55] text-white shadow-xs'
                                       : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 bg-white dark:bg-neutral-800'
                                   }`}
                                   title={isSelected ? `Deseleziona ${genreName}` : `Seleziona ${genreName}`}
                                 >
                                   {isSelected && <Check size={14} strokeWidth={3} />}
                                 </button>
                               </div>
                             </div>

                             {/* Sottogeneri Opzionali in Tendina (Si aprono SOLO al click sulla freccia tendina) */}
                             {isDropdownOpen && subgenresAvailable.length > 0 && (
                               <div className="mt-2.5 pt-2 border-t border-[#5C6B55]/20 space-y-1.5">
                                 <div className="flex items-center justify-between">
                                   <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider block">
                                     Seleziona Sottogeneri Preferiti (Opzionali):
                                   </span>
                                   {!isSelected && (
                                     <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                       (Seleziona anche il genere per salvarli)
                                     </span>
                                   )}
                                 </div>
                                 <div className="flex flex-wrap gap-1">
                                   {subgenresAvailable.map((subName) => {
                                     const isSubSelected = selectedSubgenres.includes(subName);
                                     return (
                                       <button
                                         key={subName}
                                         type="button"
                                         onClick={() => {
                                           if (!isSelected) {
                                             handleToggleGenre(genreName);
                                           }
                                           handleToggleSubgenre(genreName, subName);
                                         }}
                                         className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                                           isSubSelected
                                             ? 'bg-[#5C6B55] text-white border-[#5C6B55]'
                                             : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                                         }`}
                                       >
                                         {subName}
                                       </button>
                                     );
                                   })}
                                 </div>
                               </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   </div>

                   {/* GESTIONE WIDGET INSERITI */}
                   <div className="mt-5 space-y-2.5">
                     <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-1.5">
                         <LayoutGrid size={14} />
                         <span>Widget Attivi ({draftProfile.selectedWidgets.length}/2):</span>
                       </span>
                       {draftProfile.selectedWidgets.length === 2 && (
                         <button
                           type="button"
                           onClick={handleSwapWidgets}
                           className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-xl border border-neutral-200 dark:border-neutral-700 shadow-xs"
                           title="Inverti ordine widget"
                         >
                           <ArrowLeftRight size={12} />
                           <span>Inverti Ordine</span>
                         </button>
                       )}
                     </div>

                     {draftProfile.selectedWidgets.length > 0 ? (
                       <div className="flex flex-wrap gap-2.5 items-center">
                         {draftProfile.selectedWidgets.map((wId) => {
                           const def = WIDGET_DEFINITIONS.find(w => w.id === wId);
                           if (!def) return null;
                           const IconComp = def.icon;
                           const valueText = def.getValue(widgetData);

                           return (
                             <motion.div
                               key={wId}
                               layout
                               drag={draftProfile.selectedWidgets.length > 1 ? true : false}
                               dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                               dragElastic={0.3}
                               onDragEnd={handleWidgetDragEnd}
                               whileDrag={{ scale: 1.08, zIndex: 40, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2)" }}
                               transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                               className="flex items-center gap-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 px-3.5 py-2 text-sm font-semibold text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs cursor-grab active:cursor-grabbing select-none hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
                             >
                               <GripVertical size={14} className="text-neutral-400 shrink-0 cursor-grab active:cursor-grabbing" />
                               <IconComp size={16} className={def.iconColor} />
                               <span>{valueText}</span>
                               <button
                                 type="button"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleRemoveWidget(wId);
                                 }}
                                 className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-700 hover:bg-rose-500 hover:text-white text-neutral-600 dark:text-neutral-300 flex items-center justify-center transition-colors cursor-pointer ml-1"
                                 title="Rimuovi widget"
                               >
                                 <Minus size={12} strokeWidth={3} />
                               </button>
                             </motion.div>
                           );
                         })}
                       </div>
                     ) : (
                       <div className="p-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-400">
                         Nessun widget attivo. Clicca sul pulsante qui sotto per aggiungerne fino a 2!
                       </div>
                     )}
                   </div>

                   {/* TASTO LIBRERIA WIDGET */}
                   <button
                     type="button"
                     onClick={() => setShowWidgetLibraryModal(true)}
                     className="mt-4 w-full border-2 border-dashed border-neutral-200 dark:border-neutral-700/60 hover:border-[#B0BEA9] dark:hover:border-[#5C6B55] rounded-2xl p-4 flex items-center justify-between text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-all cursor-pointer group shrink-0"
                   >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#B0BEA9]/20 text-[#31362F] dark:bg-[#5C6B55]/30 dark:text-[#E0DCD3] flex items-center justify-center font-bold">
                          <SlidersHorizontal size={16} />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold block">Personalizza Libreria Widget</span>
                          <span className="text-[11px] text-neutral-400 block font-normal">Scegli tra i 15 widget disponibili divisi per genere</span>
                        </div>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-[#B0BEA9]/20 text-[#31362F] dark:bg-[#5C6B55]/30 dark:text-[#E0DCD3] border border-[#B0BEA9]/40 dark:border-[#5C6B55]/50 shrink-0">
                        {draftProfile.selectedWidgets.length} / 2
                      </span>
                   </button>
                 </div>
               </div>

               {/* Bottoni Salva / Annulla */}
               <div className="absolute bottom-6 right-6 flex gap-4 z-20">
                 <button onClick={() => setIsEditing(false)} className="flex h-14 w-14 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 text-neutral-600 dark:text-white shadow-sm transition-transform active:scale-90 cursor-pointer" title="Annulla"><X size={24} strokeWidth={2.5} /></button>
                 <button onClick={handleSave} className="flex h-14 w-14 items-center justify-center rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-xl border border-black/10 dark:border-white/20 text-neutral-900 dark:text-white shadow-sm transition-transform active:scale-90 cursor-pointer" title="Salva"><Check size={24} strokeWidth={2.5} /></button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SCHERMATA DETTAGLIO RACCOLTA SENZA BANNER GIGANTE (con Tasto Modifica Raccolta) */}
      <AnimatePresence>
        {openedCollection && (
          <div className="fixed inset-0 z-[100] flex justify-center items-start pt-6 px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.3, ease: 'easeInOut' }} 
              className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl"
              onClick={() => setOpenedCollection(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={cardSpring}
              className="relative z-10 flex h-[85vh] w-full max-w-md flex-col rounded-[2rem] bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden ring-1 ring-neutral-200 dark:ring-neutral-800"
            >
              {/* Header Pulito con Tasto Modifica Raccolta */}
              <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md">
                <button
                  onClick={() => setOpenedCollection(null)}
                  className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Chiudi"
                >
                  <ArrowLeft size={20} />
                </button>

                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${openedCollection.accentColor}`}>
                    {getCollectionIcon(openedCollection.iconName, "w-4 h-4")}
                  </div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">
                    {openedCollection.name}
                  </h2>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Tasto Modifica Raccolta */}
                  <button
                    onClick={() => setEditingCollection(openedCollection)}
                    className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                    title="Modifica Nome, Icona e Stile Raccolta"
                  >
                    <PenLine size={16} />
                  </button>
                </div>
              </div>

              {/* Contenuto della Raccolta */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-4 border border-neutral-100 dark:border-neutral-800 space-y-1">
                  <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {openedCollection.description}
                  </p>
                  <div className="text-[11px] font-extrabold text-neutral-400 flex items-center gap-1 pt-1">
                    <span>{openedCollection.items.length} libri in questa raccolta</span>
                  </div>
                </div>



                {/* Elenco dei Libri nella Raccolta */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Libri salvati:</h3>
                  {openedCollection.items.length > 0 ? (
                    openedCollection.items.map(item => (
                      <div
                        key={item.id}
                        className="bg-neutral-50 dark:bg-neutral-800/70 rounded-2xl p-3.5 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-16 rounded-xl bg-neutral-200 dark:bg-neutral-700 overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-600 shadow-xs">
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{item.title}</h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{item.author}</p>
                            {item.price && (
                              <span className="inline-block text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full mt-1 border border-emerald-200 dark:border-emerald-800">
                                {item.price}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleMoveCollectionItemToLibrary(item)}
                          className="px-3 py-2 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold hover:bg-[#A0AF99] transition-all flex items-center gap-1 shrink-0 active:scale-95 cursor-pointer"
                          title="Sposta nella libreria principale"
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>Acquistato</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 px-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        Questa raccolta è vuota. Usa il tasto di ricerca in alto per aggiungere dei libri!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SEZIONI SOTTO LA TARGHETTA (MODO IBRIDO: CAROSELLO + MODALE "VEDI TUTTE" CON RICERCA) */}
      <div className="w-full max-w-sm mx-auto space-y-4 pt-2">
        <div className="rounded-[2rem] bg-white dark:bg-neutral-900 p-6 shadow-xl ring-1 ring-neutral-100 dark:ring-neutral-800 space-y-3.5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                  Le mie Raccolte
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {collections.length} raccolte organizzate
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAllCollectionsModalOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#B0BEA9]/20 dark:bg-[#5C6B55]/30 text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold hover:bg-[#B0BEA9]/30 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <span>Vedi tutte ({collections.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* CAROSELLO ORIZZONTALE SWIPEABLE */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x">
            {/* Card 1: + Crea Nuova Raccolta */}
            <button
              onClick={() => setShowCreateCollectionModal(true)}
              className="flex flex-col items-center justify-center min-w-[130px] w-[130px] h-[135px] rounded-[1.5rem] border-2 border-dashed border-neutral-200 dark:border-neutral-700/70 hover:border-[#B0BEA9] dark:hover:border-[#5C6B55] text-[#5C6B55] dark:text-[#B0BEA9] text-center transition-all cursor-pointer shrink-0 snap-start active:scale-95 bg-neutral-50/50 dark:bg-neutral-800/20"
            >
              <div className="w-9 h-9 rounded-full bg-[#B0BEA9]/20 text-[#31362F] dark:bg-[#5C6B55]/30 dark:text-[#E0DCD3] flex items-center justify-center mb-1">
                <Plus size={18} />
              </div>
              <span className="text-xs font-bold leading-tight">Crea Nuova</span>
              <span className="text-[10px] text-neutral-400 font-normal">Raccolta</span>
            </button>

            {/* Cards Raccolte Sfogliabili Orizzontalmente */}
            {collections.map(c => (
              <button
                key={c.id}
                onClick={() => setOpenedCollection(c)}
                className="flex flex-col justify-between min-w-[150px] w-[150px] h-[135px] p-3.5 rounded-[1.5rem] bg-neutral-50/80 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 transition-all cursor-pointer text-left shrink-0 snap-start active:scale-95 shadow-xs group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 ${c.accentColor}`}>
                    {getCollectionIcon(c.iconName, "w-3.5 h-3.5")}
                  </div>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                    {c.items.length}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate my-1 group-hover:text-[#5C6B55] dark:group-hover:text-[#B0BEA9] transition-colors">
                  {c.name}
                </h4>

                <div className="w-full h-12 rounded-xl bg-white dark:bg-neutral-900/60 p-1 flex items-center justify-center gap-1 overflow-hidden border border-neutral-200/60 dark:border-neutral-700/50">
                  {c.items.length > 0 ? (
                    c.items.slice(0, 3).map(item => (
                      <div key={item.id} className="h-full flex-1 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600">
                        <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    ))
                  ) : (
                    <span className="text-[9px] font-bold text-neutral-400">Vuota</span>
                  )}
                </div>
              </button>
            ))}

            {/* Card finale "Vedi Tutte" */}
            <button
              onClick={() => setIsAllCollectionsModalOpen(true)}
              className="flex flex-col items-center justify-center min-w-[120px] w-[120px] h-[135px] p-3 rounded-[1.5rem] bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer shrink-0 snap-start active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-1">
                <ChevronRight size={18} />
              </div>
              <span className="text-xs font-bold">Vedi Tutte</span>
              <span className="text-[10px] text-neutral-400 font-normal">({collections.length})</span>
            </button>
          </div>
        </div>


      </div>

      {/* MODALE "VEDI TUTTE LE RACCOLTE" CON RICERCA RAPIDA */}
      <AnimatePresence>
        {isAllCollectionsModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAllCollectionsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Library className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Tutte le tue Raccolte ({collections.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsAllCollectionsModalOpen(false)}
                  className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Barra di Ricerca tra le Raccolte */}
              <div className="relative shrink-0">
                <Search className="absolute left-3.5 top-3 text-neutral-400" size={16} />
                <input
                  type="text"
                  value={searchCollectionQuery}
                  onChange={(e) => setSearchCollectionQuery(e.target.value)}
                  placeholder="Cerca tra le tue raccolte..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-white focus:outline-none focus:border-[#B0BEA9]"
                />
              </div>

              {/* Elenco Filtrato */}
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {filteredCollectionsForModal.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setIsAllCollectionsModalOpen(false);
                        setOpenedCollection(c);
                      }}
                      className="flex flex-col justify-between p-3.5 rounded-[1.5rem] bg-neutral-50/80 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/60 transition-all cursor-pointer text-left group active:scale-95 shadow-xs"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${c.accentColor}`}>
                          {getCollectionIcon(c.iconName, "w-4 h-4")}
                        </div>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                          {c.items.length}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate mb-2 group-hover:text-[#5C6B55] transition-colors">
                        {c.name}
                      </h4>

                      <div className="w-full h-14 rounded-xl bg-white dark:bg-neutral-900/60 p-1 flex items-center justify-center gap-1 overflow-hidden border border-neutral-200/60 dark:border-neutral-700/50">
                        {c.items.length > 0 ? (
                          c.items.slice(0, 3).map(item => (
                            <div key={item.id} className="h-full flex-1 rounded overflow-hidden bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600">
                              <img src={item.coverUrl} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          ))
                        ) : (
                          <span className="text-[9px] font-bold text-neutral-400">Vuota</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAllCollectionsModalOpen(false);
                    setShowCreateCollectionModal(true);
                  }}
                  className="w-full py-3 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#A0AF99] transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                >
                  <FolderPlus size={16} />
                  <span>Crea Nuova Raccolta</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE CREA NUOVA RACCOLTA (con scelta Stile Copertina & Griglia 16 Icone) */}
      {showCreateCollectionModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <FolderPlus className="text-[#5C6B55] dark:text-[#B0BEA9]" size={20} />
              <span>Crea Nuova Raccolta</span>
            </h3>
            <form onSubmit={handleCreateCollection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-700 dark:text-neutral-300">Nome Raccolta</label>
                <input
                  type="text"
                  value={newCollName}
                  onChange={e => setNewCollName(e.target.value)}
                  required
                  placeholder="es. Saggi Scientifici"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-[#B0BEA9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-700 dark:text-neutral-300">Descrizione Breve</label>
                <input
                  type="text"
                  value={newCollDesc}
                  onChange={e => setNewCollDesc(e.target.value)}
                  placeholder="es. Libri di divulgazione e scienza"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-[#B0BEA9]"
                />
              </div>

              {/* Selettore Icone Ampliato (16 Icone) */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700 dark:text-neutral-300">Scegli un'Icona</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLLECTION_ICONS.map(ic => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setNewCollIcon(ic.name)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        newCollIcon === ic.name
                          ? 'border-[#B0BEA9] bg-[#B0BEA9]/20 text-[#31362F] dark:text-white shadow-xs font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                      title={ic.label}
                    >
                      {getCollectionIcon(ic.name, "w-4 h-4")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selettore Stile Copertina / Accento Colore */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Palette size={13} />
                  <span>Stile Copertina & Colore</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewCollCover(preset.class)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all text-xs font-bold ${
                        newCollCover === preset.class
                          ? 'border-neutral-800 dark:border-white ring-2 ring-neutral-400'
                          : 'border-neutral-200 dark:border-neutral-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${preset.class}`}>
                        {getCollectionIcon(newCollIcon, "w-3 h-3")}
                      </div>
                      <span className="truncate text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateCollectionModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold hover:bg-[#A0AF99] cursor-pointer"
                >
                  Crea Raccolta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE MODIFICA RACCOLTA ESISTENTE */}
      {editingCollection && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <PenLine className="text-[#5C6B55] dark:text-[#B0BEA9]" size={18} />
                <span>Modifica Raccolta</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedCollection} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-700 dark:text-neutral-300">Nome Raccolta</label>
                <input
                  type="text"
                  value={editingCollection.name}
                  onChange={e => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-[#B0BEA9]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-neutral-700 dark:text-neutral-300">Descrizione Breve</label>
                <input
                  type="text"
                  value={editingCollection.description}
                  onChange={e => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold focus:outline-none focus:border-[#B0BEA9]"
                />
              </div>

              {/* Selettore Icona */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700 dark:text-neutral-300">Icona</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLLECTION_ICONS.map(ic => (
                    <button
                      key={ic.name}
                      type="button"
                      onClick={() => setEditingCollection({ ...editingCollection, iconName: ic.name })}
                      className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                        editingCollection.iconName === ic.name
                          ? 'border-[#B0BEA9] bg-[#B0BEA9]/20 text-[#31362F] dark:text-white font-bold'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-500'
                      }`}
                    >
                      {getCollectionIcon(ic.name, "w-4 h-4")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selettore Stile Copertina & Colore */}
              <div>
                <label className="block text-xs font-bold mb-1.5 text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                  <Palette size={13} />
                  <span>Stile Copertina & Colore</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {COVER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditingCollection({ ...editingCollection, accentColor: preset.class })}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left cursor-pointer transition-all text-xs font-bold ${
                        editingCollection.accentColor === preset.class
                          ? 'border-neutral-800 dark:border-white ring-2 ring-neutral-400'
                          : 'border-neutral-200 dark:border-neutral-700 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${preset.class}`}>
                        {getCollectionIcon(editingCollection.iconName, "w-3 h-3")}
                      </div>
                      <span className="truncate text-[11px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteCollection(editingCollection.id)}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                  <span>Elimina</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCollection(null)}
                    className="px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] text-xs font-bold hover:bg-[#A0AF99] cursor-pointer"
                  >
                    Salva Modifiche
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* MODALE LIBRERIA WIDGET COMPLETA */}
      <AnimatePresence>
        {showWidgetLibraryModal && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWidgetLibraryModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 max-h-[88vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Libreria Widget Profilo</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#B0BEA9]/20 text-[#31362F] dark:bg-[#5C6B55]/30 dark:text-[#E0DCD3] border border-[#B0BEA9]/40 dark:border-[#5C6B55]/50">
                    {draftProfile.selectedWidgets.length} / 2
                  </span>
                  <button
                    onClick={() => setShowWidgetLibraryModal(false)}
                    className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* FILTRI PER CATEGORIA/GENERE WIDGET */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
                {WIDGET_CATEGORIES.map(cat => {
                  const isActive = activeCategoryFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#B0BEA9] text-[#31362F] dark:bg-[#5C6B55] dark:text-[#E0DCD3] shadow-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* LISTA SFLOGIABILE DEI 15 WIDGET RAGGRUPPATI */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {filteredWidgets.map(w => {
                  const isSelected = draftProfile.selectedWidgets.includes(w.id);
                  const Icon = w.icon;
                  const val = w.getValue(widgetData);

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleToggleWidget(w.id)}
                      className={`w-full flex items-start justify-between p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#B0BEA9] dark:border-[#5C6B55] bg-[#FCFBF8] dark:bg-neutral-900 shadow-md ring-2 ring-[#B0BEA9]/40 dark:ring-[#5C6B55]/50'
                          : 'border-neutral-200/80 dark:border-neutral-700/60 bg-neutral-50/50 dark:bg-neutral-800/40 hover:bg-white dark:hover:bg-neutral-900 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 pr-2">
                        <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Icon size={18} className={w.iconColor} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{w.title}</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0">
                              {val}
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-1">
                            {w.description}
                          </p>
                          <span className="inline-block text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mt-1.5">
                            {w.categoryName}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 mt-0.5">
                        {isSelected ? (
                          <CheckCircle2 size={20} className="text-[#5C6B55] dark:text-[#B0BEA9] fill-[#B0BEA9]/20" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowWidgetLibraryModal(false)}
                  className="w-full py-3 rounded-2xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-xs hover:bg-[#A0AF99] transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  Conferma Selezione ({draftProfile.selectedWidgets.length}/2)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODALE DI SELEZIONE SORGENTE IMMAGINE */}
      <AnimatePresence>
        {imagePickerType && (
          <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setImagePickerType(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-sm rounded-[2rem] bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {imagePickerType === 'avatar' ? 'Foto Profilo' : 'Sfondo Banner'}
                  </h3>
                </div>
                <button
                  onClick={() => setImagePickerType(null)}
                  className="rounded-full bg-neutral-100 dark:bg-neutral-800 p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    if (imagePickerType === 'avatar') {
                      avatarCameraInputRef.current?.click();
                    } else {
                      bannerCameraInputRef.current?.click();
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Camera size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Scatta Foto sul Momento</div>
                    <div className="text-[11px] text-neutral-500 font-normal">Apri la fotocamera del dispositivo</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (imagePickerType === 'avatar') {
                      avatarGalleryInputRef.current?.click();
                    } else {
                      bannerGalleryInputRef.current?.click();
                    }
                  }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <ImageIcon size={20} />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold">Scegli dalla Galleria</div>
                    <div className="text-[11px] text-neutral-500 font-normal">Seleziona un'immagine dai tuoi file</div>
                  </div>
                </button>

                {imagePickerType === 'banner' && (
                  <div className="pt-2 space-y-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="text-xs font-bold text-neutral-500 flex items-center gap-1.5">
                      <Palette size={14} />
                      <span>Oppure scegli uno stile predefinito:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BANNER_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectBannerPreset(preset.class)}
                          className="flex items-center gap-2 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-all cursor-pointer"
                        >
                          <div className={`w-5 h-5 rounded-full border border-black/10 shrink-0 ${preset.class}`} />
                          <span className="truncate">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {((imagePickerType === 'avatar' && draftProfile.avatarUrl) ||
                  (imagePickerType === 'banner' && draftProfile.bannerUrl)) && (
                  <button
                    onClick={() => handleRemoveImage(imagePickerType)}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-bold text-xs transition-colors cursor-pointer mt-1"
                  >
                    <Trash2 size={16} />
                    <span>Rimuovi Foto Impostata</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;
