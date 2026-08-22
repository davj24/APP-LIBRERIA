import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { 
  Settings2, Camera, PenLine, BookCheck, BookOpen, X, Check, LayoutGrid, Heart, 
  Users, Plus, Flame, BookmarkPlus, Library, Sparkles, Image as ImageIcon, Trash2, 
  Palette, Bookmark, Target, Clock, Brain, Lightbulb, FastForward, CheckCircle2,
  GripVertical, Minus, SlidersHorizontal, ArrowLeftRight, PieChart, Moon, Book,
  Trophy, Repeat, FolderPlus,
  BookMarked, ArrowLeft, Search, ChevronRight, Star, Crown, Compass, GraduationCap,
  Coffee, Rocket, Zap, Glasses
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useBooks } from '../hooks/useBooks';
import { useRegisterModal } from '../context/ModalContext';

interface WishlistItem {
  id: string;
  title: string;
  author: string;
  price?: string;
  coverUrl: string;
}

export type CollectionIconName = 
  | 'Heart' | 'Flame' | 'Trophy' | 'Sparkles' | 'BookMarked' | 'Library'
  | 'Star' | 'Crown' | 'Compass' | 'GraduationCap' | 'Coffee' | 'Moon'
  | 'Rocket' | 'Zap' | 'Glasses' | 'Bookmark';

export interface UserCollection {
  id: string;
  name: string;
  description: string;
  iconName: CollectionIconName;
  accentColor: string;
  items: WishlistItem[];
}

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

const INITIAL_COLLECTIONS: UserCollection[] = [
  {
    id: 'c1',
    name: 'La mia Wishlist',
    description: 'Libri che desideri acquistare e leggere prossimamente.',
    iconName: 'Heart',
    accentColor: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    items: [
      {
        id: 'w1',
        title: 'Klara e il Sole',
        author: 'Kazuo Ishiguro',
        price: '304 pag.',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'
      },
      {
        id: 'w2',
        title: 'La vegetariana',
        author: 'Han Kang',
        price: '180 pag.',
        coverUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400'
      }
    ]
  },
  {
    id: 'c2',
    name: 'In Coda sul Comodino',
    description: 'Titoli già acquistati e in tuo possesso pronti in coda di lettura.',
    iconName: 'Library',
    accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    items: [
      {
        id: 'w3',
        title: 'Dune: Parte Seconda',
        author: 'Frank Herbert',
        price: '650 pag.',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400'
      }
    ]
  },
  {
    id: 'c3',
    name: 'I Miei Preferiti',
    description: 'I capolavori indimenticabili che hanno lasciato il segno.',
    iconName: 'Trophy',
    accentColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    items: [
      {
        id: 'w4',
        title: 'L\'Ombra del Vento',
        author: 'Carlos Ruiz Zafón',
        price: '528 pag.',
        coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400'
      }
    ]
  }
];

interface FriendActivity {
  id: string;
  name: string;
  avatar: string;
  readingNow: string;
  streakDays: number;
  status: string;
}

const MOCK_FRIENDS: FriendActivity[] = [
  {
    id: 'f1',
    name: 'Damiano',
    avatar: 'D',
    readingNow: 'Dune: Parte Seconda',
    streakDays: 18,
    status: 'In lettura'
  },
  {
    id: 'f2',
    name: 'Tommaso',
    avatar: 'T',
    readingNow: 'L\'Ombra del Vento',
    streakDays: 24,
    status: 'Streak Attiva 🔥'
  }
];

const BANNER_PRESETS = [
  { name: 'Neutro', class: 'bg-neutral-200 dark:bg-neutral-800' },
  { name: 'Verde Salvia', class: 'bg-[#5C6B55]' },
  { name: 'Tramonto', class: 'bg-gradient-to-r from-amber-500 to-rose-500' },
  { name: 'Notte Stellata', class: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900' }
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
    getValue: ({ readCount }) => `${readCount > 0 ? readCount : 45} Letti`
  },
  {
    id: 'reading_count',
    title: 'In Lettura',
    description: 'Indica il numero di titoli attualmente "sul comodino" da tenere traccia.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: BookOpen,
    iconColor: 'text-amber-500 dark:text-amber-400',
    getValue: ({ readingCount }) => `${readingCount > 0 ? readingCount : 2} In Lettura`
  },
  {
    id: 'current_progress',
    title: 'Completamento Attuale',
    description: 'Si aggiorna in tempo reale in base all\'ultimo libro aperto mostrando la percentuale di avanzamento.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: PieChart,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    getValue: ({ currentProgressPercent }) => `${currentProgressPercent || 65}% Completato`
  },
  {
    id: 'total_pages',
    title: 'Pagine Totali',
    description: 'Il conteggio totale delle pagine sfogliate nel tempo. Percezione concreta della lettura.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: Bookmark,
    iconColor: 'text-sky-500 dark:text-sky-400',
    getValue: ({ totalPages }) => `${totalPages > 0 ? totalPages.toLocaleString('it-IT') : '12.450'} Pagine`
  },
  {
    id: 'annual_goal',
    title: 'Obiettivo Annuale',
    description: 'Confronta i libri letti con la meta personale prefissata per l\'anno in corso.',
    category: 'statistiche',
    categoryName: '📊 Avanzamento & Statistiche',
    icon: Target,
    iconColor: 'text-rose-500 dark:text-rose-400',
    getValue: ({ readCount, readingGoal }) => `${readCount > 0 ? readCount : 45}/${readingGoal || 50} nel 2026`
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
    getValue: ({ streakDays }) => `${streakDays > 0 ? streakDays : 5} Giorni di fila`
  },
  {
    id: 'max_streak',
    title: 'Record Assoluto',
    description: 'Mostra la tua striscia di costanza più lunga di sempre. Un trofeo personale che non scompare.',
    category: 'abitudini',
    categoryName: '🔥 Abitudini & Costanza',
    icon: Trophy,
    iconColor: 'text-amber-400 dark:text-amber-300',
    getValue: ({ maxStreakDays }) => `Record: ${maxStreakDays || 21} giorni`
  },
  {
    id: 'time_slot',
    title: 'Fascia Oraria Preferita',
    description: 'Tag calcolato in base a quando registri le tue sessioni (es. la sera tardi o la mattina).',
    category: 'abitudini',
    categoryName: '🔥 Abitudini & Costanza',
    icon: Moon,
    iconColor: 'text-indigo-400 dark:text-indigo-300',
    getValue: ({ timeSlotText }) => timeSlotText || 'Lettore Notturno'
  },
  {
    id: 'top_genre',
    title: 'Genere Dominante',
    description: 'Mostra la categoria o il genere più frequente tra le tue letture recenti.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Brain,
    iconColor: 'text-teal-500 dark:text-teal-400',
    getValue: ({ dominantGenre }) => dominantGenre || 'Psicologia'
  },
  {
    id: 'primary_format',
    title: 'Supporto Dominante',
    description: 'Mostra come preferisci consumare i libri (carta, ebook o audiolibri).',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Book,
    iconColor: 'text-blue-500 dark:text-blue-400',
    getValue: ({ primaryFormatText }) => primaryFormatText || '80% Cartaceo'
  },
  {
    id: 'to_read_backlog',
    title: 'Da Iniziare / Backlog',
    description: 'Traccia quanti libri possiedi già o hai acquistato ma che stanno ancora attendendo sullo scaffale.',
    category: 'libreria',
    categoryName: '📚 Libreria & Formati',
    icon: Library,
    iconColor: 'text-amber-600 dark:text-amber-400',
    getValue: ({ toReadCount }) => `${toReadCount > 0 ? toReadCount : 15} In Coda`
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
    getValue: ({ reReadsCount }) => `${reReadsCount || 4} Riletture`
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

  // GESTIONE RACCOLTE UTENTE
  const [collections, setCollections] = useState<UserCollection[]>(INITIAL_COLLECTIONS);
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

  const [profile, setProfile] = useState({
    name: userProfile.name || 'Davide Belluzzo',
    bio: userProfile.bio || 'Appassionato di mondi di carta. 200+ libri in libreria.',
    bannerColor: userProfile.bannerUrl ? '' : 'bg-neutral-200 dark:bg-neutral-800',
    avatarUrl: userProfile.avatarUrl || '',
    bannerUrl: userProfile.bannerUrl || '',
    selectedWidgets: (userProfile.selectedWidgets && userProfile.selectedWidgets.length > 0)
      ? userProfile.selectedWidgets
      : ['read_count', 'reading_count']
  });

  const [draftProfile, setDraftProfile] = useState(profile);

  useEffect(() => {
    const widgets = (userProfile.selectedWidgets && userProfile.selectedWidgets.length > 0)
      ? userProfile.selectedWidgets
      : ['read_count', 'reading_count'];

    setProfile({
      name: userProfile.name || 'Davide Belluzzo',
      bio: userProfile.bio || 'Appassionato di mondi di carta. 200+ libri in libreria.',
      bannerColor: userProfile.bannerUrl ? '' : 'bg-neutral-200 dark:bg-neutral-800',
      avatarUrl: userProfile.avatarUrl || '',
      bannerUrl: userProfile.bannerUrl || '',
      selectedWidgets: widgets
    });
  }, [userProfile]);

  // Input file hidden per Fotocamera e Galleria
  const avatarCameraInputRef = useRef<HTMLInputElement>(null);
  const avatarGalleryInputRef = useRef<HTMLInputElement>(null);
  const bannerCameraInputRef = useRef<HTMLInputElement>(null);
  const bannerGalleryInputRef = useRef<HTMLInputElement>(null);

  const [friends] = useState<FriendActivity[]>(MOCK_FRIENDS);

  const readCount = books.filter(b => b.status === 'Letto').length;
  const readingCount = books.filter(b => b.status === 'In lettura').length;
  const toReadCount = books.filter(b => b.status === 'Da leggere').length;

  const currentReadingBook = books.find(b => b.status === 'In lettura');
  const currentProgressPercent = currentReadingBook && currentReadingBook.totalPages
    ? Math.min(100, Math.round(((currentReadingBook.pagesRead || 0) / currentReadingBook.totalPages) * 100))
    : 65;

  const calculatedTotalPages = books.reduce((acc, b) => acc + (b.pagesRead || b.totalPages || 0), 0);
  const getDominantGenre = () => {
    if (books.length === 0) return 'Psicologia';
    const counts: Record<string, number> = {};
    books.forEach(b => {
      if (b.genre) counts[b.genre] = (counts[b.genre] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || 'Saggistica';
  };

  const widgetData = {
    readCount,
    readingCount,
    totalPages: calculatedTotalPages,
    readingGoal: userProfile.readingGoal || 50,
    streakDays: 18,
    averagePace: 30,
    dominantGenre: getDominantGenre(),
    notesCount: 128,
    nextBookTitle: collections[0]?.items[0]?.title || 'Klara e il Sole',
    currentProgressPercent,
    timeSlotText: 'Lettore Notturno',
    primaryFormatText: '80% Cartaceo',
    toReadCount: toReadCount > 0 ? toReadCount : 15,
    maxStreakDays: 21,
    reReadsCount: 4
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
      bannerUrl: draftProfile.bannerUrl,
      selectedWidgets: draftProfile.selectedWidgets
    });
    setIsEditing(false);
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        if (target === 'avatar') {
          setDraftProfile(prev => ({ ...prev, avatarUrl: dataUrl }));
        } else {
          setDraftProfile(prev => ({ ...prev, bannerUrl: dataUrl, bannerColor: '' }));
        }
      }
    };
    reader.readAsDataURL(file);
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
  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollName.trim()) return;

    const newColl: UserCollection = {
      id: Date.now().toString(),
      name: newCollName.trim(),
      description: newCollDesc.trim() || 'Raccolta personalizzata',
      iconName: newCollIcon,
      accentColor: newCollCover,
      items: []
    };

    setCollections(prev => [...prev, newColl]);
    setNewCollName('');
    setNewCollDesc('');
    setShowCreateCollectionModal(false);
    setOpenedCollection(newColl);
  };

  // SALVA MODIFICHE RACCOLTA ESISTENTE
  const handleSaveEditedCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;

    setCollections(prev => prev.map(c => c.id === editingCollection.id ? editingCollection : c));
    if (openedCollection && openedCollection.id === editingCollection.id) {
      setOpenedCollection(editingCollection);
    }
    setEditingCollection(null);
  };

  // ELIMINA RACCOLTA
  const handleDeleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    if (openedCollection?.id === id) setOpenedCollection(null);
    setEditingCollection(null);
  };

  // SPOSTA LIBRO DA RACCOLTA A LIBRERIA PRINCIPALE
  const handleMoveCollectionItemToLibrary = (item: WishlistItem) => {
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
      const updatedItems = openedCollection.items.filter(i => i.id !== item.id);
      setOpenedCollection(prev => prev ? { ...prev, items: updatedItems } : null);
      setCollections(prev => prev.map(c => c.id === openedCollection.id ? { ...c, items: updatedItems } : c));
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
             <div className="relative h-24 w-24 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center font-black text-2xl text-neutral-700 dark:text-neutral-200 shadow-sm overflow-hidden">
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
             <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
           </h2>
           <p className="text-sm text-neutral-500 mt-1">
             {profile.bio}
           </p>

           {/* Generi Preferiti (Entità separate rispetto alla bio testuale) */}
           {userProfile.favoriteGenres && userProfile.favoriteGenres.length > 0 && (
             <div className="flex flex-wrap gap-1.5 mt-3">
               {userProfile.favoriteGenres.map((genre) => (
                 <span
                   key={genre}
                   className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5C6B55]/10 dark:bg-[#5C6B55]/20 text-[#5C6B55] dark:text-[#A0AF99] border border-[#5C6B55]/20 shadow-2xs"
                 >
                   {genre}
                 </span>
               ))}
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
                   <div className="-mt-14 mb-6 relative inline-block self-start">
                     <div className="h-28 w-28 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-300 dark:bg-neutral-700 flex items-center justify-center font-black text-3xl text-neutral-700 dark:text-neutral-200 shadow-sm overflow-hidden">
                       {draftProfile.avatarUrl ? (
                         <img src={draftProfile.avatarUrl} alt={draftProfile.name} className="w-full h-full object-cover" />
                       ) : (
                         <span>{draftProfile.name ? draftProfile.name.trim().charAt(0).toUpperCase() : 'D'}</span>
                       )}
                     </div>
                     <div 
                       onClick={() => setImagePickerType('avatar')}
                       className="absolute bottom-0 right-0 rounded-full bg-black/50 hover:bg-black/70 p-2 text-white border-2 border-white dark:border-neutral-900 backdrop-blur-md cursor-pointer transition-colors shadow-md"
                       title="Cambia Foto Profilo"
                     >
                       <Camera size={14} />
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

        {/* Sezione Amici / Social Hub */}
        <div className="rounded-[2rem] bg-white dark:bg-neutral-900 p-6 shadow-xl ring-1 ring-neutral-100 dark:ring-neutral-800 space-y-4 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white leading-tight flex items-center gap-2">
                <span>I miei Amici</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  Social Hub
                </span>
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                Condividi letture e sfide di streak con i tuoi amici
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            {friends.map(friend => (
              <div
                key={friend.id}
                className="bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl p-3.5 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] font-bold text-sm flex items-center justify-center shrink-0">
                    {friend.avatar}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">{friend.name}</h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-neutral-400" />
                      <span>{friend.readingNow}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 px-2.5 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 text-[11px] font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{friend.streakDays} gg</span>
                </div>
              </div>
            ))}
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
