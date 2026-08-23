import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../../../domain/models/Book';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Camera, RefreshCw, Check, AlertCircle, PenTool, ScanLine } from 'lucide-react';
import { useRegisterModal } from '../../context/ModalContext';
import { federatedBookSearch } from '../../../infrastructure/services/federatedBookSearch';

interface CameraScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookScanned: (book: Omit<Book, 'id'>) => void;
  onOpenManualEntry?: () => void;
}

export const CameraScannerModal: React.FC<CameraScannerModalProps> = ({
  isOpen,
  onClose,
  onBookScanned,
  onOpenManualEntry
}) => {
  useRegisterModal(isOpen);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [detectedIsbn, setDetectedIsbn] = useState<string | null>(null);
  const [scannedBook, setScannedBook] = useState<Omit<Book, 'id'> | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const nativeDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setScannedBook(null);
      setDetectedIsbn(null);
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
      setScannerError(null);

      const supportedFormats = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
      ];

      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: supportedFormats,
          verbose: false
        });
      }

      setIsScanning(true);

      await html5QrcodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.333333
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame non decodificato
        }
      );

      // Integrazione accelerata nativa BarcodeDetector se disponibile nel browser
      if ('BarcodeDetector' in window) {
        try {
          nativeDetectorRef.current = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e']
          });

          const videoEl = element.querySelector('video') as HTMLVideoElement | null;
          if (videoEl) {
            const scanNativeFrame = async () => {
              if (videoEl.readyState >= 2 && nativeDetectorRef.current) {
                try {
                  const barcodes = await nativeDetectorRef.current.detect(videoEl);
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    handleBarcodeDetected(barcodes[0].rawValue);
                    return;
                  }
                } catch (e) {
                  // Fallback silenzioso
                }
              }
              animationFrameRef.current = requestAnimationFrame(scanNativeFrame);
            };
            scanNativeFrame();
          }
        } catch (err) {
          console.warn("Native BarcodeDetector init error:", err);
        }
      }
    } catch (err: any) {
      console.warn("Scanner camera init error:", err);
      setIsScanning(false);
      setScannerError(
        "Impossibile accedere alla fotocamera. Assicurati di aver concesso i permessi o prova lo scatto foto."
      );
    }
  };

  const stopScanner = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (html5QrcodeRef.current) {
      try {
        if (html5QrcodeRef.current.isScanning) {
          await html5QrcodeRef.current.stop();
        }
      } catch (e) {
        console.warn("Error stopping scanner:", e);
      }
      setIsScanning(false);
    }
  };

  const handleBarcodeDetected = async (rawCode: string) => {
    const cleanIsbn = rawCode.replace(/[-_ \s]/g, '');
    if (!cleanIsbn || cleanIsbn.length < 8) return;

    // Esegui feedback aptico di conferma lettura
    if (navigator.vibrate) {
      try {
        navigator.vibrate([80, 40, 80]);
      } catch (e) {
        // Ignora su browser senza permessi vibrazione
      }
    }

    setDetectedIsbn(cleanIsbn);
    await stopScanner();
    setIsLoadingBook(true);

    try {
      // Ricerca federata automatica con l'ISBN rilevato
      const searchResults = await federatedBookSearch(cleanIsbn);
      setIsLoadingBook(false);

      if (searchResults && searchResults.length > 0) {
        const book = searchResults[0];
        setScannedBook({
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Da leggere',
          totalPages: book.totalPages || 300,
          pagesRead: 0,
          genre: book.genre || 'Rilevato da Scansione',
          isbn: book.isbn || cleanIsbn,
          notes: book.description || undefined
        });
      } else {
        setScannedBook({
          title: `Libro (ISBN: ${cleanIsbn})`,
          author: 'Autore da catalogare',
          coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          status: 'Da leggere',
          totalPages: 300,
          pagesRead: 0,
          genre: 'Scansionato da Fotocamera',
          isbn: cleanIsbn
        });
      }
    } catch (err) {
      setIsLoadingBook(false);
      setScannerError("Codice a barre letto (" + cleanIsbn + ") ma si è verificato un errore nella ricerca online.");
    }
  };

  const handleConfirmAdd = () => {
    if (scannedBook) {
      onBookScanned(scannedBook);
      onClose();
    }
  };

  // Elaborazione avanzata foto scattata / caricata per estrazione vera del codice a barre
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await stopScanner();
    setIsLoadingBook(true);
    setScannerError(null);

    let decodedText: string | null = null;

    // 1. Tenta decodifica tramite API nativa BarcodeDetector del browser
    if ('BarcodeDetector' in window) {
      try {
        const imageBitmap = await createImageBitmap(file);
        const detector = new (window as any).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e']
        });
        const barcodes = await detector.detect(imageBitmap);
        if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
          decodedText = barcodes[0].rawValue;
        }
      } catch (err) {
        console.warn("BarcodeDetector su file foto fallito, proseguo con Html5Qrcode", err);
      }
    }

    // 2. Tenta decodifica tramite Html5Qrcode.scanFile
    if (!decodedText) {
      try {
        if (!html5QrcodeRef.current) {
          const supportedFormats = [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ];
          html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
            formatsToSupport: supportedFormats,
            verbose: false
          });
        }
        decodedText = await html5QrcodeRef.current.scanFile(file, true);
      } catch (err) {
        console.warn("Html5Qrcode scanFile non ha rilevato codici a barre nell'immagine:", err);
      }
    }

    if (decodedText) {
      await handleBarcodeDetected(decodedText);
    } else {
      setIsLoadingBook(false);
      setScannerError(
        "Nessun codice a barre ISBN (es. 978...) rilevato nella foto. Assicurati che il codice a barre sul retro del libro sia nitido e ben illuminato."
      );
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
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Scanner Codice ISBN</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Inquadra il codice a barre (EAN-13) o scatta una foto</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Area con Mirino Scanner */}
            <div className="relative my-4 aspect-[4/3] w-full rounded-2xl bg-[#1E221D] overflow-hidden border border-[#383532] dark:border-[#4A4743]/60 flex items-center justify-center">
              {/* Contenitore HTML5 QR Code */}
              <div id="qr-reader" className="w-full h-full object-cover" />

              {/* Overlay grafico del Mirino con linea laser animata */}
              {isScanning && !scannedBook && !isLoadingBook && !scannerError && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 p-6">
                  {/* Rettangolo guida per il codice a barre */}
                  <div className="relative w-64 h-36 border-2 border-emerald-400/70 rounded-xl bg-emerald-500/5 shadow-2xl flex items-center justify-center overflow-hidden">
                    {/* Angoli decorativi per puntamento */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                    {/* Linea Laser Scansione Animata */}
                    <motion.div
                      animate={{ y: [-60, 60, -60] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399]"
                    />
                  </div>
                  <span className="mt-3 text-[11px] font-bold text-emerald-200/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    Posiziona il codice a barre nel rettangolo
                  </span>
                </div>
              )}

              {/* Error Overlay */}
              {scannerError && (
                <div className="absolute inset-0 bg-[#1E221D]/95 p-5 text-center flex flex-col items-center justify-center gap-2 text-rose-300 z-20">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p className="text-xs font-semibold leading-relaxed max-w-xs">{scannerError}</p>
                  <button
                    onClick={startScanner}
                    className="mt-2 px-4 py-2 bg-[#5C6B55] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#4D5A46] transition-all cursor-pointer"
                  >
                    Riprova Scansione
                  </button>
                </div>
              )}

              {/* Loading Status Overlay con ricerca ISBN */}
              {isLoadingBook && (
                <div className="absolute inset-0 bg-[#1E221D]/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <span className="text-xs font-semibold text-emerald-200">
                    Codice ISBN {detectedIsbn ? `(${detectedIsbn})` : ''} rilevato!
                  </span>
                  <span className="text-[11px] text-[#A09A90]">Download informazioni dal web...</span>
                </div>
              )}
            </div>

            {/* Scanned Result Card con Dati Reali */}
            {scannedBook && (
              <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-3.5 border border-[#B0BEA9] dark:border-[#5C6B55] mb-3 flex gap-3 items-center animate-in fade-in">
                <img
                  src={scannedBook.coverUrl}
                  alt={scannedBook.title}
                  className="w-12 h-16 object-cover rounded-lg border border-[#DCD5C6] dark:border-[#4A4743]/60 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D382B] dark:text-[#E0DCD3] bg-[#D8E2D5] dark:bg-[#3B4838] px-2 py-0.5 rounded-full border border-[#B0BEA9] dark:border-[#5C6B55]">
                    <Check className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Libro Autocompilato
                  </span>
                  <h4 className="font-bold text-xs text-[#4A4743] dark:text-[#E0DCD3] truncate mt-1">{scannedBook.title}</h4>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">{scannedBook.author}</p>
                  {scannedBook.isbn && (
                    <p className="text-[10px] text-[#5C6B55] dark:text-[#A0AF99] font-mono mt-0.5">ISBN: {scannedBook.isbn}</p>
                  )}
                </div>
                <button
                  onClick={handleConfirmAdd}
                  className="px-3.5 py-2 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Salva Libro
                </button>
              </div>
            )}

            {/* Action Controls */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
              <label className="py-3 px-4 bg-[#B0BEA9] dark:bg-[#5C6B55] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A46] text-[#31362F] dark:text-[#E0DCD3] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all border border-[#A0AF99] dark:border-[#4D5A46] cursor-pointer">
                <Camera className="w-4 h-4" />
                <span>Scatta Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenManualEntry) {
                    onOpenManualEntry();
                  }
                }}
                className="py-3 px-4 bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#DCD5C6] dark:border-[#4A4743]/60 cursor-pointer"
              >
                <PenTool className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
                <span>Inserimento Manuale</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
