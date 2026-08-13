import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../../../domain/models/Book';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, Sparkles, Check, Upload, AlertCircle } from 'lucide-react';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookScanned: (book: Omit<Book, 'id'>) => void;
}

const MOCK_SCANNED_BOOKS: Omit<Book, 'id'>[] = [
  {
    title: 'Il Signore degli Anelli: La Compagnia dell\'Anello',
    author: 'J.R.R. Tolkien',
    coverUrl: 'https://images.unsplash.com/photo-1629992101753-56d196c8aea7?auto=format&fit=crop&q=80&w=400',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'In lettura',
    totalPages: 576,
    pagesRead: 45,
    genre: 'Fantasy Epico',
    rating: 5
  },
  {
    title: 'Sapiens: Da animali a dèi',
    author: 'Yuval Noah Harari',
    coverUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=400',
    startDate: '',
    endDate: '',
    status: 'Da leggere',
    totalPages: 540,
    pagesRead: 0,
    genre: 'Saggio Storico'
  },
  {
    title: 'Fahrenheit 451',
    author: 'Ray Bradbury',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    startDate: '',
    endDate: '',
    status: 'Da leggere',
    totalPages: 208,
    pagesRead: 0,
    genre: 'Fantascienza Classica'
  }
];

import { useRegisterModal } from '../../context/ModalContext';

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onBookScanned
}) => {
  useRegisterModal(isOpen);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [, setIsScanning] = useState(false);
  const [, setScannedIsbn] = useState<string | null>(null);
  const [scannedBook, setScannedBook] = useState<Omit<Book, 'id'> | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setScannedBook(null);
      setScannedIsbn(null);
      setScannerError(null);

      const timer = setTimeout(() => {
        if (!isMounted) return;
        startScanner();
      }, 350);

      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isOpen]);

  const startScanner = async () => {
    const element = document.getElementById("qr-reader");
    if (!element) return;

    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader");
      }

      const qrCode = html5QrcodeRef.current;

      setIsScanning(true);
      setScannerError(null);

      await qrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 260, height: 160 }
        },
        async (decodedText) => {
          stopScanner();
          setScannedIsbn(decodedText);
          await fetchBookDetailsByIsbn(decodedText);
        },
        () => {}
      );
    } catch (err: any) {
      console.warn("Html5Qrcode start error:", err);
      setIsScanning(false);
      setScannerError("Impossibile avviare la fotocamera posteriore. Assicurati di aver concesso i permessi.");
    }
  };

  const stopScanner = () => {
    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          html5QrcodeRef.current.stop().then(() => {
            html5QrcodeRef.current?.clear();
          }).catch(e => console.warn(e));
        }
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
    }
    setIsScanning(false);
  };

  const fetchBookDetailsByIsbn = async (isbn: string) => {
    setIsLoadingBook(true);
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");

    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (bookData) {
        const title = bookData.title || `Libro (ISBN: ${cleanIsbn})`;
        const author = bookData.authors ? bookData.authors.map((a: any) => a.name).join(', ') : 'Autore Sconosciuto';
        const coverUrl = bookData.cover ? (bookData.cover.large || bookData.cover.medium) : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
        const totalPages = bookData.number_of_pages || 300;

        setScannedBook({
          title,
          author,
          coverUrl,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Da leggere',
          totalPages,
          pagesRead: 0,
          genre: 'Scansionato ISBN'
        });
      } else {
        setScannedBook({
          title: `Libro Scansionato (ISBN: ${cleanIsbn})`,
          author: 'Autore da completare',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Da leggere',
          totalPages: 300,
          pagesRead: 0,
          genre: 'ISBN Barcode'
        });
      }
    } catch (e) {
      setScannedBook({
        title: `Libro Scansionato (ISBN: ${cleanIsbn})`,
        author: 'Autore da completare',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'Da leggere',
        totalPages: 300,
        pagesRead: 0,
        genre: 'ISBN Barcode'
      });
    } finally {
      setIsLoadingBook(false);
    }
  };

  const handleSimulatedScan = () => {
    stopScanner();
    setIsLoadingBook(true);
    setScannedBook(null);

    setTimeout(() => {
      setIsLoadingBook(false);
      const randomBook = MOCK_SCANNED_BOOKS[Math.floor(Math.random() * MOCK_SCANNED_BOOKS.length)];
      setScannedBook(randomBook);
    }, 1200);
  };

  const handleConfirmAdd = () => {
    if (scannedBook) {
      onBookScanned(scannedBook);
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopScanner();
      setIsLoadingBook(true);
      const reader = new FileReader();
      reader.onload = () => {
        setTimeout(() => {
          setIsLoadingBook(false);
          setScannedBook({
            title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
            author: 'Autore da Immagine',
            coverUrl: reader.result as string,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            status: 'Da leggere',
            totalPages: 300,
            pagesRead: 0,
            genre: 'Riconosciuto da Immagine'
          });
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 flex flex-col max-h-[90vh] overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border border-[#A0AF99] dark:border-[#4D5A46] flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Scanner ISBN HTML5</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Fotocamera posteriore (environment)</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Area */}
            <div className="relative my-4 aspect-[4/3] w-full rounded-2xl bg-[#31362F] dark:bg-[#252924] overflow-hidden border border-[#252924] dark:border-[#4A4743]/60 flex items-center justify-center">
              {/* HTML5 QR Code Container */}
              <div id="qr-reader" className="w-full h-full object-cover" />

              {/* Error overlay */}
              {scannerError && (
                <div className="absolute inset-0 bg-[#31362F]/90 p-5 text-center flex flex-col items-center justify-center gap-2 text-rose-300 z-20">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-xs font-semibold">{scannerError}</p>
                  <button
                    onClick={startScanner}
                    className="mt-2 px-3 py-1.5 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#4A4743] dark:text-[#E0DCD3] text-xs font-bold rounded-xl border border-[#DCD5C6] dark:border-[#4A4743]/60"
                  >
                    Riprova Scansione
                  </button>
                </div>
              )}

              {/* Scanning status loading overlay */}
              {isLoadingBook && (
                <div className="absolute inset-0 bg-[#31362F]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-8 h-8 text-[#B0BEA9] dark:text-[#5C6B55] animate-spin" />
                  <span className="text-xs font-semibold text-[#EBE5D9]">Ricerca codice ISBN in corso...</span>
                </div>
              )}
            </div>

            {/* Scanned Result Card */}
            {scannedBook && (
              <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-3.5 border border-[#B0BEA9] dark:border-[#5C6B55] mb-3 flex gap-3 items-center animate-in fade-in">
                <img
                  src={scannedBook.coverUrl}
                  alt={scannedBook.title}
                  className="w-12 h-16 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D382B] dark:text-[#E0DCD3] bg-[#D8E2D5] dark:bg-[#3B4838] px-2 py-0.5 rounded-full border border-[#B0BEA9] dark:border-[#5C6B55]">
                    <Check className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Libro Trovato
                  </span>
                  <h4 className="font-bold text-xs text-[#4A4743] dark:text-[#E0DCD3] truncate mt-1">{scannedBook.title}</h4>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">{scannedBook.author}</p>
                </div>
                <button
                  onClick={handleConfirmAdd}
                  className="px-3.5 py-2 bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] rounded-xl text-xs font-bold hover:bg-[#A0AF99] active:scale-95 transition-all shadow-md shadow-[#B0BEA9]/30 shrink-0 border border-[#A0AF99] dark:border-[#4D5A46]"
                >
                  Inserisci nel Form
                </button>
              </div>
            )}

            {/* Action Controls */}
            <div className="space-y-2 mt-auto">
              <button
                onClick={handleSimulatedScan}
                disabled={isLoadingBook}
                className="w-full py-3 bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A46] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#B0BEA9]/30 active:scale-98 transition-all border border-[#A0AF99] dark:border-[#4D5A46]"
              >
                <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Simula Scansione Rapida</span>
              </button>

              <label className="w-full py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors border border-[#DCD5C6] dark:border-[#4A4743]/60">
                <Upload className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
                <span>Carica Foto / Scatta con Fotocamera</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
