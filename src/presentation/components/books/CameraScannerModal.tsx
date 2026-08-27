import React, { useState, useEffect, useRef } from 'react';
import type { Book } from '../../../domain/models/Book';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, RefreshCw, Check, AlertCircle, PenTool, ScanLine, Search, Barcode, EyeOff, Zap, ZapOff, Image as ImageIcon } from 'lucide-react';
import { useRegisterModal } from '../../context/ModalContext';
import { federatedBookSearch } from '../../../infrastructure/services/federatedBookSearch';
import { BookSheet, type BookSheetBook } from './BookSheet';
import { RegisterBookModal } from './RegisterBookModal';

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
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
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
      setIsFlashOn(false);

      // Assicurati che qualsiasi istanza o stream precedente sia correttamente chiuso
      await stopScanner();

      // Richiesta esplicita dei permessi della fotocamera per garantire il prompt del browser se necessario
      if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
          tempStream.getTracks().forEach(track => track.stop());
        } catch (permErr) {
          console.warn("Direct getUserMedia permission request warning:", permErr);
        }
      }

      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: supportedFormats,
          verbose: false
        });
      }

      setIsScanning(true);

      // Inizializza lo scanner con la configurazione standard universale per fotocamera posteriore
      const cameraConfig: any = { facingMode: "environment" };

      await html5QrcodeRef.current.start(
        cameraConfig,
        {
          fps: 25,
          qrbox: (videoWidth, videoHeight) => {
            return {
              width: Math.min(340, Math.floor(videoWidth * 0.85)),
              height: Math.min(200, Math.floor(videoHeight * 0.50))
            };
          }
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {}
      );

      // Applicazione dinamica delle ottimizzazioni WebRTC (Autofocus ed Esposizione continua)
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

      setTimeout(applyCameraOptimizations, 300);
      setTimeout(applyCameraOptimizations, 1000);

      // Loop di rilevazione nativo con BarcodeDetector su frame video
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
              if (videoEl && videoEl.readyState >= 2 && nativeDetectorRef.current) {
                try {
                  const barcodes = await nativeDetectorRef.current.detect(videoEl);
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    handleBarcodeDetected(barcodes[0].rawValue);
                    return;
                  }
                } catch (e) {}
              }
              animationFrameRef.current = requestAnimationFrame(scanNativeFrame);
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
        "Fotocamera live non accessibile. Verifica di aver concesso i permessi per la fotocamera nelle impostazioni del browser o digita l'ISBN nel campo in basso."
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
        navigator.vibrate([40]);
      } catch (e) {
        // Ignora
      }
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

  // Analisi immagini selezionate dalla Galleria (Scansione Smart Barcode / Lens)
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

    // PASS 3: Html5Qrcode su canvas con contrasto scala di grigi
    if (!decodedText) {
      try {
        const bwFile = await processCanvasPass(file, 900, true, false);
        decodedText = await html5QrcodeRef.current.scanFile(bwFile, true);
      } catch (err) {
        console.warn("Pass 3 error:", err);
      }
    }

    // PASS 4: Html5Qrcode su canvas ruotato di 90° (per codici a barre verticali)
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
      // PASS 5: Smart Lens Cover Recognition (nessun codice a barre trovato -> analisi testo copertina)
      try {
        let extractedQuery = '';

        // 5a. Tentativo con TextDetector nativo (se supportato dal browser)
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

        // 5b. Fallback a Tesseract.js (OCR universale in-browser)
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
          // Ricerca federata con il testo estratto dalla copertina del libro
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
        "Nessun codice a barre o libro riconosciuto nell'immagine. Inquadra il codice a barre sul retro o digita il titolo/ISBN in basso."
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#31362F]/60 dark:bg-black/80 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ y: "100%", opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "100%", opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#FCFBF8] dark:bg-[#33302D] text-[#4A4743] dark:text-[#E0DCD3] w-full max-w-md rounded-3xl p-5 shadow-2xl border border-[#EBE5D9] dark:border-[#4A4743]/60 flex flex-col max-h-[90vh] overflow-y-auto transition-colors"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE5D9] dark:border-[#4A4743]/50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#B0BEA9] dark:bg-[#5C6B55] text-[#31362F] dark:text-[#E0DCD3] border border-[#A0AF99] dark:border-[#4D5A46] flex items-center justify-center">
                  <ScanLine className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#4A4743] dark:text-[#E0DCD3]">Scanner Codice ISBN</h2>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90]">Inquadra il codice a barre sul retro del libro</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#EBE5D9] dark:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] hover:bg-[#DCD5C6] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewfinder Area con Mirino Scanner */}
            <div className="relative my-3 aspect-[4/3] w-full rounded-2xl bg-[#1E221D] overflow-hidden border border-[#383532] dark:border-[#4A4743]/60 flex items-center justify-center shrink-0">
              {/* Contenitore HTML5 QR Code */}
              <div id="qr-reader" className="w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover" />

              {/* Oscuramento Fotocamera quando si scrive nel campo ISBN manuale */}
              {shouldObscureCamera && !scannedBook && !isLoadingBook && (
                <div className="absolute inset-0 bg-[#1E221D]/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-30 transition-all animate-in fade-in">
                  <div className="w-10 h-10 rounded-2xl bg-[#5C6B55]/20 text-[#A0AF99] flex items-center justify-center mb-2 border border-[#5C6B55]/40">
                    <EyeOff className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#E0DCD3]">Ricerca ISBN manuale attiva</span>
                  <span className="text-[11px] text-[#A09A90] mt-1 max-w-xs">
                    La fotocamera live è in pausa mentre usi la digitazione manuale dell'ISBN.
                  </span>
                </div>
              )}

              {/* Overlay grafico del Mirino Moderno */}
              {isScanning && !scannedBook && !isLoadingBook && !scannerError && !shouldObscureCamera && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 p-4">
                  {/* Pulsante Controllo Flash (Torch) manuale per l'utente */}
                  <button
                    type="button"
                    onClick={toggleFlash}
                    className={`pointer-events-auto absolute top-3 right-3 px-3 py-1.5 rounded-full text-[11px] font-bold backdrop-blur-md border transition-all active:scale-95 cursor-pointer shadow-lg z-20 flex items-center gap-1.5 ${
                      isFlashOn
                        ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-500/20'
                        : 'bg-black/60 hover:bg-black/80 text-white/90 border-white/20'
                    }`}
                    title={isFlashOn ? "Spegni Flash" : "Accendi Flash"}
                  >
                    {isFlashOn ? (
                      <>
                        <Zap className="w-3.5 h-3.5 fill-current text-amber-950" />
                        <span>Flash ON</span>
                      </>
                    ) : (
                      <>
                        <ZapOff className="w-3.5 h-3.5 text-white/90" />
                        <span>Flash OFF</span>
                      </>
                    )}
                  </button>

                  {/* Rettangolo di allineamento elegante con angoli minimali */}
                  <div className="relative w-64 sm:w-72 h-36 border border-white/30 rounded-2xl bg-black/10 backdrop-blur-[1px] shadow-2xl flex items-center justify-center overflow-hidden">
                    {/* Angoli Sage/Emerald Eleganti */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#B0BEA9] rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#B0BEA9] rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#B0BEA9] rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#B0BEA9] rounded-br-lg" />

                    {/* Laser fluido di scansione verticale */}
                    <motion.div
                      animate={{ y: [-65, 65, -65] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#B0BEA9] to-transparent shadow-[0_0_10px_#B0BEA9]"
                    />
                  </div>

                  <span className="mt-3 text-[11px] font-medium text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                    Inquadra il codice a barre nel rettangolo
                  </span>
                </div>
              )}

              {/* Error Overlay */}
              {scannerError && !shouldObscureCamera && (
                <div className="absolute inset-0 bg-[#1E221D]/95 p-5 text-center flex flex-col items-center justify-center gap-2 text-rose-300 z-20">
                  <AlertCircle className="w-8 h-8 text-rose-400" />
                  <p className="text-xs font-semibold leading-relaxed max-w-xs">{scannerError}</p>
                  <button
                    onClick={() => startScanner()}
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
                  <span className="text-[11px] text-[#A09A90]">Ricerca libro in corso...</span>
                </div>
              )}

              {/* Overlay quando un libro è stato trovato: Tasto "Rifai Scansione" nello spazio della fotocamera live */}
              {scannedBook && !isLoadingBook && (
                <div className="absolute inset-0 bg-[#1E221D]/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 transition-all animate-in fade-in">
                  <div className="w-11 h-11 rounded-2xl bg-[#5C6B55]/20 text-[#A0AF99] flex items-center justify-center mb-2 border border-[#5C6B55]/40 shadow-inner">
                    <RefreshCw className="w-5 h-5 text-[#A0AF99]" />
                  </div>
                  <span className="text-xs font-bold text-[#E0DCD3] mb-0.5">Libro Trovato!</span>
                  <p className="text-[11px] text-[#A09A90] max-w-xs mb-3">
                    Salva il libro in basso oppure fai una nuova scansione.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setScannedBook(null);
                      setDetectedIsbn(null);
                      setScannerError(null);
                      setManualIsbnInput('');
                      startScanner();
                    }}
                    className="px-4 py-2 bg-[#5C6B55] hover:bg-[#4D5A46] text-white text-xs font-bold rounded-xl shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-[#788C71]"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scansiona Un Altro Libro</span>
                  </button>
                </div>
              )}
            </div>

            {/* Input manuale diretto ISBN integrato nel modal */}
            <form onSubmit={handleManualIsbnSubmit} className="mb-3">
              <div className="relative flex items-center">
                <Barcode className="absolute left-3.5 w-4 h-4 text-[#7A756D] dark:text-[#A09A90] pointer-events-none" />
                <input
                  type="text"
                  value={manualIsbnInput}
                  onChange={(e) => setManualIsbnInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder="Oppure digita ISBN (es. 9788804668237)..."
                  className="w-full pl-10 pr-20 py-2.5 bg-[#F4F1EA] dark:bg-[#2A2826] text-xs font-semibold text-[#4A4743] dark:text-[#E0DCD3] placeholder-[#9E988F] dark:placeholder-[#88837A] rounded-2xl border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none focus:ring-2 focus:ring-[#5C6B55] transition-all"
                />
                <button
                  type="submit"
                  disabled={!manualIsbnInput.trim()}
                  className="absolute right-1.5 px-3 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] disabled:opacity-50 text-white rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <Search className="w-3 h-3" />
                  <span>Cerca</span>
                </button>
              </div>
            </form>

            {/* Scanned Result Card con Dati Reali trovati */}
            {scannedBook && (
              <div className="bg-[#F4F1EA] dark:bg-[#2A2826] rounded-2xl p-3.5 border border-[#B0BEA9] dark:border-[#5C6B55] mb-3 flex gap-3 items-center animate-in fade-in">
                <button
                  onClick={() => setIsSheetOpen(true)}
                  className="w-12 h-16 shrink-0 relative rounded-lg overflow-hidden border border-[#DCD5C6] dark:border-[#4A4743]/60 focus:outline-none focus:ring-2 focus:ring-[#5C6B55] transition-transform active:scale-95 group"
                >
                  <img
                    src={scannedBook.coverUrl}
                    alt={scannedBook.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D382B] dark:text-[#E0DCD3] bg-[#D8E2D5] dark:bg-[#3B4838] px-2 py-0.5 rounded-full border border-[#B0BEA9] dark:border-[#5C6B55]">
                    <Check className="w-3 h-3 text-[#4D6349] dark:text-[#788C71]" /> Libro Riconosciuto
                  </span>
                  <h4 className="font-bold text-xs text-[#4A4743] dark:text-[#E0DCD3] truncate mt-1">{scannedBook.title}</h4>
                  <p className="text-[11px] text-[#7A756D] dark:text-[#A09A90] truncate">{scannedBook.author}</p>
                  {scannedBook.isbn && (
                    <p className="text-[10px] text-[#5C6B55] dark:text-[#A0AF99] font-mono mt-0.5">ISBN: {scannedBook.isbn}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    onClick={handleConfirmAdd}
                    className="px-3.5 py-1.5 bg-[#5C6B55] hover:bg-[#4D5A46] text-white rounded-xl text-xs font-bold active:scale-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Aggiungi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-3.5 py-1.5 bg-[#EBE5D9] dark:bg-[#383532] hover:bg-[#DCD5C6] text-[#31362F] dark:text-[#E0DCD3] rounded-xl text-xs font-bold active:scale-95 transition-all border border-[#DCD5C6] dark:border-[#4A4743]/60 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <PenTool className="w-3.5 h-3.5 text-[#5C6B55] dark:text-[#A8BB9C]" />
                    <span>Registra</span>
                  </button>
                </div>
              </div>
            )}

            {/* Action Controls */}
            <div className="grid grid-cols-2 gap-3 mt-auto pt-1 shrink-0">
              <label className="py-3 px-3 bg-[#B0BEA9] dark:bg-[#5C6B55] hover:bg-[#A0AF99] dark:hover:bg-[#4D5A46] text-[#31362F] dark:text-[#E0DCD3] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all border border-[#A0AF99] dark:border-[#4D5A46] cursor-pointer">
                <ImageIcon className="w-4 h-4 shrink-0" />
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
                className="py-3 px-3 bg-[#F4F1EA] dark:bg-[#2A2826] hover:bg-[#EBE5D9] dark:hover:bg-[#383532] text-[#4A4743] dark:text-[#E0DCD3] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all border border-[#DCD5C6] dark:border-[#4A4743]/60 cursor-pointer shadow-sm"
              >
                <PenTool className="w-4 h-4 text-[#7A756D] dark:text-[#A09A90] shrink-0" />
                <span className="truncate">Compilazione Manuale</span>
              </button>
            </div>
          </motion.div>
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

    {/* Modale Registra & Personalizza Libro */}
    <RegisterBookModal
      isOpen={isRegisterOpen}
      onClose={() => setIsRegisterOpen(false)}
      initialBook={scannedBook}
      onConfirmSave={(customizedBook) => {
        setIsRegisterOpen(false);
        onBookScanned(customizedBook);
        onClose();
      }}
    />
    </>
  );
};
