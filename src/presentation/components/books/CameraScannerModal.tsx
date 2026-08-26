import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../../../domain/models/Book';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, RefreshCw, Check, AlertCircle, PenTool, Search, Barcode, EyeOff, Zap, ZapOff, Image as ImageIcon } from 'lucide-react';
import { useRegisterModal } from '../../context/ModalContext';
import { federatedBookSearch } from '../../../infrastructure/services/federatedBookSearch';
import { BookSheet, type BookSheetBook } from './BookSheet';

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
  const [manualIsbnInput, setManualIsbnInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const nativeDetectorRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);

  const supportedFormats = [
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E,
  ];

  useEffect(() => {
    let isMounted = true;

    if (isOpen) {
      setScannedBook(null);
      setDetectedIsbn(null);
      setScannerError(null);
      setManualIsbnInput('');
      setIsInputFocused(false);
      setIsFlashOn(false);

      const timer = setTimeout(() => {
        if (!isMounted) return;
        startScanner();
      }, 250);

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
      setIsFlashOn(false);

      // Assicurati che qualsiasi istanza o stream precedente sia correttamente chiuso
      await stopScanner();

      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: supportedFormats,
          verbose: false
        });
      }

      setIsScanning(true);

      // Configurazione avanzata della fotocamera per alta definizione HD (1280x720) per lettura codice a barre nitida
      const cameraConfig: any = {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      };

      await html5QrcodeRef.current.start(
        cameraConfig,
        {
          fps: 20,
          qrbox: (videoWidth, _videoHeight) => {
            // Mirino orientato in orizzontale (formato 3.2:1 tipico dei codici a barre ISBN/EAN-13)
            const width = Math.min(380, Math.floor(videoWidth * 0.90));
            const height = Math.min(190, Math.floor(width * 0.48));
            return { width, height };
          }
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {}
      );

      // Applicazione dinamica delle ottimizzazioni WebRTC (Autofocus continuo ed Esposizione)
      const applyCameraOptimizations = async () => {
        const videoEl = element.querySelector('video') as HTMLVideoElement | null;
        if (videoEl && videoEl.srcObject) {
          const stream = videoEl.srcObject as MediaStream;
          const tracks = stream.getVideoTracks();
          if (tracks && tracks.length > 0) {
            const track = tracks[0];
            const capabilities: any = typeof track.getCapabilities === 'function' ? track.getCapabilities() : {};
            
            const advancedOpts: any = {};
            if (capabilities.focusMode && Array.isArray(capabilities.focusMode) && capabilities.focusMode.includes('continuous')) {
              advancedOpts.focusMode = 'continuous';
            }
            if (capabilities.exposureMode && Array.isArray(capabilities.exposureMode) && capabilities.exposureMode.includes('continuous')) {
              advancedOpts.exposureMode = 'continuous';
            }

            if (Object.keys(advancedOpts).length > 0) {
              try {
                await track.applyConstraints({ advanced: [advancedOpts] } as any);
              } catch (err) {
                console.warn("Camera constraint optimization fallback:", err);
              }
            }
          }
        }
      };

      setTimeout(applyCameraOptimizations, 250);
      setTimeout(applyCameraOptimizations, 800);

      // Loop di rilevazione nativo a bassissima latenza con BarcodeDetector API di sistema
      const attachNativeDetectorLoop = () => {
        const videoEl = element.querySelector('video') as HTMLVideoElement | null;
        if (!videoEl) {
          setTimeout(attachNativeDetectorLoop, 150);
          return;
        }

        if ('BarcodeDetector' in window) {
          try {
            nativeDetectorRef.current = new (window as any).BarcodeDetector({
              formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e']
            });

            const scanNativeFrame = async () => {
              if (videoEl && videoEl.readyState >= 2 && nativeDetectorRef.current && html5QrcodeRef.current?.isScanning) {
                try {
                  const barcodes = await nativeDetectorRef.current.detect(videoEl);
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    handleBarcodeDetected(barcodes[0].rawValue);
                    return;
                  }
                } catch (e) {}
              }
              if (html5QrcodeRef.current?.isScanning) {
                animationFrameRef.current = requestAnimationFrame(scanNativeFrame);
              }
            };
            scanNativeFrame();
          } catch (err) {
            console.warn("Native BarcodeDetector init error:", err);
          }
        }
      };

      attachNativeDetectorLoop();

    } catch (err: any) {
      console.warn("Scanner camera init error:", err);
      setIsScanning(false);
      setScannerError(
        "Fotocamera non accessibile o permessi negati. Verifica le impostazioni del tuo browser o inserisci l'ISBN manualmente."
      );
    }
  };

  const toggleFlash = async () => {
    const element = document.getElementById("qr-reader");
    const videoEl = element?.querySelector('video') as HTMLVideoElement | null;
    if (videoEl && videoEl.srcObject) {
      const stream = videoEl.srcObject as MediaStream;
      const tracks = stream.getVideoTracks();
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        const nextState = !isFlashOn;
        let success = false;

        try {
          await track.applyConstraints({
            advanced: [{ torch: nextState, fillLightMode: nextState ? 'flash' : 'off' }]
          } as any);
          success = true;
        } catch (err) {
          try {
            await track.applyConstraints({
              advanced: [{ torch: nextState }]
            } as any);
            success = true;
          } catch (err2) {
            try {
              if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
                await html5QrcodeRef.current.applyVideoConstraints({
                  advanced: [{ torch: nextState }]
                } as any);
                success = true;
              }
            } catch (err3) {
              console.warn("Torch not supported on this camera track:", err3);
            }
          }
        }

        if (success) {
          setIsFlashOn(nextState);
        }
      }
    }
  };

  const stopScanner = async () => {
    setIsFlashOn(false);

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
      try {
        html5QrcodeRef.current.clear();
      } catch (e) {}
      html5QrcodeRef.current = null;
    }
    setIsScanning(false);
  };

  const handleBarcodeDetected = async (rawCode: string) => {
    const cleanIsbn = rawCode.replace(/[-_ \s]/g, '');
    if (!cleanIsbn || cleanIsbn.length < 8) return;

    if (navigator.vibrate) {
      try {
        navigator.vibrate([40, 30, 40]);
      } catch (e) {}
    }

    setDetectedIsbn(cleanIsbn);
    await stopScanner();
    setIsLoadingBook(true);

    try {
      // Ricerca federata automatica (Open Library + Google Books + OPAC SBN)
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
        setScannedBook(null);
        setScannerError(
          `Codice ISBN (${cleanIsbn}) letto con successo, ma nessun libro corrispondente è stato trovato nei cataloghi online. Verifica che il codice sia corretto o usa l'inserimento manuale.`
        );
      }
    } catch (err) {
      setIsLoadingBook(false);
      setScannerError("Codice a barre letto (" + cleanIsbn + ") ma si è verificato un errore durante la ricerca del libro.");
    }
  };

  // Pre-elaborazione foto caricata dalla galleria su Canvas 2D per scansione ad alta risoluzione
  const processCanvasPass = (
    file: File,
    maxDim: number,
    grayscale = false,
    rotate90 = false
  ): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        if (rotate90) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file);

        if (rotate90) {
          ctx.translate(height / 2, width / 2);
          ctx.rotate((90 * Math.PI) / 180);
          ctx.drawImage(img, -width / 2, -height / 2, width, height);
        } else {
          ctx.drawImage(img, 0, 0, width, height);
        }

        if (grayscale) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
            const v = avg > 115 ? 255 : 0;
            data[i] = v;
            data[i + 1] = v;
            data[i + 2] = v;
          }
          ctx.putImageData(imgData, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // Analisi immagini selezionate dalla Galleria
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await stopScanner();
    setIsLoadingBook(true);
    setScannerError(null);

    let decodedText: string | null = null;

    if (!html5QrcodeRef.current) {
      html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
        formatsToSupport: supportedFormats,
        verbose: false
      });
    }

    // PASS 1: Native BarcodeDetector su file originale
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
        console.warn("Pass 1 error:", err);
      }
    }

    // PASS 2: Html5Qrcode su canvas ridimensionato a 1200px
    if (!decodedText) {
      try {
        const resizedFile = await processCanvasPass(file, 1200, false, false);
        decodedText = await html5QrcodeRef.current.scanFile(resizedFile, true);
      } catch (err) {
        console.warn("Pass 2 error:", err);
      }
    }

    // PASS 3: Html5Qrcode su canvas in scala di grigi
    if (!decodedText) {
      try {
        const bwFile = await processCanvasPass(file, 900, true, false);
        decodedText = await html5QrcodeRef.current.scanFile(bwFile, true);
      } catch (err) {
        console.warn("Pass 3 error:", err);
      }
    }

    // PASS 4: Html5Qrcode su canvas ruotato di 90°
    if (!decodedText) {
      try {
        const rotatedFile = await processCanvasPass(file, 900, false, true);
        decodedText = await html5QrcodeRef.current.scanFile(rotatedFile, true);
      } catch (err) {
        console.warn("Pass 4 error:", err);
      }
    }

    if (decodedText) {
      await handleBarcodeDetected(decodedText);
    } else {
      // PASS 5: Smart Lens Cover Recognition (nessun codice a barre trovato -> OCR copertina)
      try {
        let extractedQuery = '';

        if ('TextDetector' in window) {
          try {
            const imageBitmap = await createImageBitmap(file);
            const textDetector = new (window as any).TextDetector();
            const detectedTexts = await textDetector.detect(imageBitmap);
            if (detectedTexts && detectedTexts.length > 0) {
              const rawWords = detectedTexts.map((t: any) => t.rawValue).filter(Boolean);
              extractedQuery = rawWords.join(' ').replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ \s]/g, ' ').trim();
            }
          } catch (e) {
            console.warn("Native TextDetector pass error:", e);
          }
        }

        if (!extractedQuery || extractedQuery.length < 3) {
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('ita+eng');
          const ret = await worker.recognize(file);
          await worker.terminate();

          if (ret && ret.data && ret.data.text) {
            const lines = ret.data.text
              .split('\n')
              .map(l => l.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ \s]/g, ' ').trim())
              .filter(l => l.length > 2);
            extractedQuery = lines.slice(0, 4).join(' ');
          }
        }

        if (extractedQuery && extractedQuery.length >= 3) {
          const searchResults = await federatedBookSearch(extractedQuery);
          setIsLoadingBook(false);

          if (searchResults && searchResults.length > 0) {
            const book = searchResults[0];
            const coverPreview = URL.createObjectURL(file);
            setScannedBook({
              title: book.title,
              author: book.author,
              coverUrl: book.coverUrl || coverPreview,
              startDate: new Date().toISOString().split('T')[0],
              endDate: '',
              status: 'Da leggere',
              totalPages: book.totalPages || 300,
              pagesRead: 0,
              genre: book.genre || 'Riconosciuto da Copertina (Smart Lens)',
              isbn: book.isbn || undefined,
              notes: book.description || undefined
            });
            return;
          }
        }
      } catch (ocrErr) {
        console.warn("Smart Lens OCR Cover error:", ocrErr);
      }

      setIsLoadingBook(false);
      setScannerError(
        "Nessun codice a barre o libro riconosciuto nell'immagine. Inquadra il codice a barre sul retro del libro o digita il titolo/ISBN in basso."
      );
    }
  };

  const handleManualIsbnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = manualIsbnInput.replace(/[-_ \s]/g, '');
    if (cleaned && cleaned.length >= 8) {
      handleBarcodeDetected(cleaned);
    } else {
      setScannerError("Inserisci un codice ISBN valido (almeno 9-13 cifre).");
    }
  };

  const handleConfirmAdd = () => {
    if (scannedBook) {
      onBookScanned(scannedBook);
      onClose();
    }
  };

  const shouldObscureCamera = isInputFocused || manualIsbnInput.trim().length > 0;

  const getBookSheetData = (): BookSheetBook | null => {
    if (!scannedBook) return null;
    return {
      id: `scanned-${scannedBook.isbn || Date.now()}`,
      title: scannedBook.title,
      author: scannedBook.author,
      cover: scannedBook.coverUrl,
      description: scannedBook.notes,
      pages: scannedBook.totalPages,
      genre: scannedBook.genre,
      isbn: scannedBook.isbn,
    };
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col justify-between overflow-hidden select-none"
        >
          {/* Sfondo Feed Fotocamera Live che occupa l'intero schermo */}
          <div
            id="qr-reader"
            className="absolute inset-0 w-full h-full object-cover z-0 overflow-hidden [&_video]:w-full [&_video]:h-full [&_video]:object-cover [&_canvas]:hidden [&_img]:hidden"
          />

          {/* Oscuramento Fotocamera quando si scrive nel campo ISBN manuale */}
          {shouldObscureCamera && !scannedBook && !isLoadingBook && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 transition-all animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-[#5C6B55]/30 text-[#A0AF99] flex items-center justify-center mb-3 border border-[#5C6B55]/50">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Ricerca ISBN manuale attiva</h3>
              <p className="text-xs text-[#A09A90] max-w-xs leading-relaxed">
                La fotocamera live è in pausa mentre usi la digitazione manuale dell'ISBN. Premere Cerca per avviare la ricerca.
              </p>
            </div>
          )}

          {/* HEADER TOP CONTROLS (Tutto Schermo) */}
          <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-5 pb-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            {/* Tasto Chiudi */}
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg"
              title="Chiudi Scanner"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Titolo e Badge Live */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 rounded-full shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">Scanner ISBN</span>
              </div>
            </div>

            {/* Controllo Flash (Torch) */}
            <button
              type="button"
              onClick={toggleFlash}
              className={`w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-lg ${
                isFlashOn
                  ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-500/30'
                  : 'bg-black/40 hover:bg-black/70 text-white border-white/20'
              }`}
              title={isFlashOn ? "Spegni Flash" : "Accendi Flash"}
            >
              {isFlashOn ? (
                <Zap className="w-5 h-5 fill-current text-amber-950" />
              ) : (
                <ZapOff className="w-5 h-5 text-white" />
              )}
            </button>
          </div>

          {/* CENTRO VIEWPORT: Mirino Laser HD a Tutto Schermo */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center pointer-events-none p-4">
            {isScanning && !scannedBook && !isLoadingBook && !scannerError && !shouldObscureCamera && (
              <div className="flex flex-col items-center justify-center w-full max-w-sm">
                {/* Rettangolo ISBN Rettangolare Elegante */}
                <div className="relative w-80 sm:w-96 h-48 sm:h-52 border border-white/30 rounded-3xl bg-black/15 backdrop-blur-[1px] shadow-2xl flex items-center justify-center overflow-hidden">
                  {/* Angoli Verdi Sage/Emerald */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-[#B0BEA9] rounded-tl-2xl" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-[#B0BEA9] rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-[#B0BEA9] rounded-bl-2xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-[#B0BEA9] rounded-br-2xl" />

                  {/* Linea Laser Animata */}
                  <motion.div
                    animate={{ y: [-80, 80, -80] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#B0BEA9] to-transparent shadow-[0_0_15px_#B0BEA9]"
                  />
                </div>

                <span className="mt-4 text-xs font-medium text-white/90 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/15 text-center shadow-lg">
                  Inquadra il codice a barre ISBN sul retro del libro
                </span>
              </div>
            )}

            {/* Error Overlay */}
            {scannerError && !shouldObscureCamera && (
              <div className="pointer-events-auto max-w-xs bg-black/90 backdrop-blur-md border border-rose-500/30 rounded-3xl p-5 text-center flex flex-col items-center gap-3 text-rose-200 shadow-2xl animate-in zoom-in-95">
                <AlertCircle className="w-9 h-9 text-rose-400 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{scannerError}</p>
                <button
                  onClick={() => startScanner()}
                  className="px-4 py-2 bg-[#5C6B55] hover:bg-[#4D5A46] text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer border border-[#788C71]"
                >
                  Riprova Scansione
                </button>
              </div>
            )}

            {/* Loading Status Overlay */}
            {isLoadingBook && (
              <div className="pointer-events-auto max-w-xs bg-black/90 backdrop-blur-md border border-emerald-500/30 rounded-3xl p-6 text-center flex flex-col items-center gap-3 shadow-2xl animate-in zoom-in-95">
                <RefreshCw className="w-9 h-9 text-emerald-400 animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">
                    Codice ISBN {detectedIsbn ? `(${detectedIsbn})` : ''} letto!
                  </h4>
                  <p className="text-[11px] text-[#A09A90]">Ricerca scheda libro in corso nei cataloghi...</p>
                </div>
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS & MANUAL INPUT (Tutto Schermo) */}
          <div className="relative z-20 px-4 sm:px-6 pt-4 pb-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-3">
            {/* Form Input Manuale ISBN */}
            <form onSubmit={handleManualIsbnSubmit} className="w-full">
              <div className="relative flex items-center">
                <Barcode className="absolute left-4 w-4 h-4 text-[#A09A90] pointer-events-none" />
                <input
                  type="text"
                  value={manualIsbnInput}
                  onChange={(e) => setManualIsbnInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Oppure digita codice ISBN (es. 9788804668237)..."
                  className="w-full pl-11 pr-24 py-3 bg-black/50 backdrop-blur-md text-xs font-semibold text-white placeholder-[#88837A] rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#B0BEA9] focus:border-transparent transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!manualIsbnInput.trim()}
                  className="absolute right-2 px-3.5 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] disabled:opacity-40 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Cerca</span>
                </button>
              </div>
            </form>

            {/* Pulsanti Azioni Rapide */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="py-3 px-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-white/15 cursor-pointer shadow-md">
                <ImageIcon className="w-4 h-4 text-[#B0BEA9] shrink-0" />
                <span className="truncate">Carica da Galleria</span>
                <input
                  type="file"
                  accept="image/*"
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
                className="py-3 px-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-white/15 cursor-pointer shadow-md"
              >
                <PenTool className="w-4 h-4 text-[#B0BEA9] shrink-0" />
                <span className="truncate">Compilazione Manuale</span>
              </button>
            </div>
          </div>

          {/* BOOK FOUND BOTTOM SHEET SLIDE-UP */}
          <AnimatePresence>
            {scannedBook && !isLoadingBook && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-40 bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] rounded-t-3xl p-5 shadow-2xl border-t border-[#EBE5D9] dark:border-[#4A4743]/60 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => setIsSheetOpen(true)}
                      className="w-14 h-20 shrink-0 relative rounded-xl overflow-hidden border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none focus:ring-2 focus:ring-[#5C6B55] shadow-md group cursor-pointer"
                    >
                      <img
                        src={scannedBook.coverUrl}
                        alt={scannedBook.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                    </button>
                    <div className="min-w-0 flex-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D382B] dark:text-[#E0DCD3] bg-[#D8E2D5] dark:bg-[#3B4838] px-2.5 py-0.5 rounded-full border border-[#B0BEA9] dark:border-[#5C6B55] mb-1">
                        <Check className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Libro Riconosciuto
                      </span>
                      <h4 className="font-bold text-sm text-[#4A4743] dark:text-[#E0DCD3] truncate">{scannedBook.title}</h4>
                      <p className="text-xs text-[#7A756D] dark:text-[#A09A90] truncate mt-0.5">{scannedBook.author}</p>
                      {scannedBook.isbn && (
                        <p className="text-[10px] text-[#5C6B55] dark:text-[#A0AF99] font-mono mt-1">ISBN: {scannedBook.isbn}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setScannedBook(null);
                      setDetectedIsbn(null);
                      setScannerError(null);
                      setManualIsbnInput('');
                      startScanner();
                    }}
                    className="py-3 px-3 bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all border border-[#DCD5C6] dark:border-[#4A4743]/60 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90]" />
                    <span>Rifai Scansione</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAdd}
                    className="py-3 px-3 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer border border-[#788C71]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salva Libro</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Dettagli Libro Trovato */}
    <BookSheet
      isOpen={isSheetOpen}
      onClose={() => setIsSheetOpen(false)}
      book={getBookSheetData()}
      onAddBook={() => {
        setIsSheetOpen(false);
        handleConfirmAdd();
      }}
    />
    </>
  );
};
