export interface GenreClassificationInput {
  categories?: string[] | string | null;
  subjects?: string[] | string | null;
  title?: string | null;
  description?: string | null;
  publishedYear?: string | number | null;
}

export interface ClassifiedGenreResult {
  genre: string;
  subgenre: string;
}

/**
 * Classificatore intelligente per associare categoria, genere e sottogenere reali
 * a partire dai metadati dei cataloghi online (Google Books categories, Open Library subjects, titolo, descrizione).
 * Garantisce sempre la restituzione di una coppia valida [Genere, Sottogenere] presente in GENRES_MAP,
 * eliminando qualsiasi dicitura generica come "Rilevato da Scansione".
 */
export function classifyBookGenre(input: GenreClassificationInput): ClassifiedGenreResult {
  const allTokens: string[] = [];

  // Raccogli categorie
  if (Array.isArray(input.categories)) {
    allTokens.push(...input.categories.map(c => String(c).toLowerCase()));
  } else if (typeof input.categories === 'string') {
    allTokens.push(input.categories.toLowerCase());
  }

  // Raccogli soggetti
  if (Array.isArray(input.subjects)) {
    allTokens.push(...input.subjects.map(s => String(s).toLowerCase()));
  } else if (typeof input.subjects === 'string') {
    allTokens.push(input.subjects.toLowerCase());
  }

  // Raccogli parole chiave dal titolo e descrizione
  if (input.title) {
    allTokens.push(input.title.toLowerCase());
  }
  if (input.description) {
    allTokens.push(input.description.toLowerCase().slice(0, 500));
  }

  const combinedText = allTokens.join(' ');

  const has = (...keywords: string[]): boolean => {
    return keywords.some(k => combinedText.includes(k.toLowerCase()));
  };

  // 1. Fumetti, Manga & Graphic Novel
  if (has('manga', 'anime', 'comic', 'comics', 'graphic novel', 'fumett', 'shonen', 'seinen', 'shojo', 'webtoon', 'manhwa', 'superhero')) {
    const genre = 'Fumetti, Manga & Graphic Novel';
    if (has('shonen', 'action manga')) return { genre, subgenre: 'Shonen & Action Manga' };
    if (has('seinen')) return { genre, subgenre: "Seinen & Manga d'Autore" };
    if (has('shojo', 'josei')) return { genre, subgenre: 'Shojo & Josei' };
    if (has('bonelli', 'italiano', 'europeo', 'topolino', 'tex', 'dylan dog')) return { genre, subgenre: 'Fumetto Italiano & Europeo' };
    if (has('marvel', 'dc comics', 'superhero', 'american')) return { genre, subgenre: 'Comics Americani & Supereroi' };
    return { genre, subgenre: 'Graphic Novel Contemporanee' };
  }

  // 2. Gialli, Thriller & Noir
  if (has('thriller', 'mystery', 'detective', 'suspense', 'giallo', 'gialli', 'noir', 'crime', 'delitto', 'omicidio', 'assassino', 'investigatore', 'poliziesco', 'hardboiled', 'indagine', 'spionaggio', 'spy')) {
    const genre = 'Gialli, Thriller & Noir';
    if (has('psicologico', 'psychological thriller')) return { genre, subgenre: 'Thriller Psicologico' };
    if (has('noir', 'hardboiled')) return { genre, subgenre: 'Noir & Hardboiled' };
    if (has('legal', 'avvocat', 'tribunale')) return { genre, subgenre: 'Legal Thriller' };
    if (has('medical', 'medico', 'ospedale')) return { genre, subgenre: 'Medical Thriller' };
    if (has('cozy', 'cozy mystery')) return { genre, subgenre: 'Cozy Mystery' };
    if (has('police', 'polizia', 'procedural', 'commissari')) return { genre, subgenre: 'Police Procedural / Poliziesco' };
    if (has('spy', 'spionaggio', 'techno-thriller', 'intelligence')) return { genre, subgenre: 'Spionaggio & Techno-Thriller' };
    return { genre, subgenre: 'Giallo Classico (Whodunit)' };
  }

  // 3. Fantasy & Magia
  if (has('fantasy', 'magic', 'magia', 'drago', 'draghi', 'elf', 'stregon', 'wizard', 'mythology', 'mitologia', 'folklore', 'spada', 'epic fantasy', 'high fantasy', 'dark fantasy', 'romantasy')) {
    const genre = 'Fantasy & Magia';
    if (has('epic fantasy', 'high fantasy', 'tolkien', 'il signore degli anelli')) return { genre, subgenre: 'High / Epic Fantasy' };
    if (has('dark fantasy', 'grimdark')) return { genre, subgenre: 'Dark Fantasy & Grimdark' };
    if (has('urban fantasy', 'paranormal', 'vampir', 'lupi')) return { genre, subgenre: 'Urban Fantasy & Paranormale' };
    if (has('mitologia', 'mythology', 'folklore', 'greca', 'norrena')) return { genre, subgenre: 'Mitologia & Folklore' };
    if (has('romantasy', 'romance fantasy')) return { genre, subgenre: 'Romantasy (Romance Fantasy)' };
    if (has('fiaba', 'fiabe', 'favole', 'fairy tale')) return { genre, subgenre: 'Fiabe & Favole' };
    return { genre, subgenre: 'High / Epic Fantasy' };
  }

  // 4. Fantascienza (Sci-Fi)
  if (has('science fiction', 'fantascienza', 'sci-fi', 'scifi', 'space opera', 'cyberpunk', 'distopia', 'dystopian', 'post-apocalyptic', 'apocalittico', 'alien', 'marte', 'astronave', 'viaggi nel tempo', 'time travel', 'multiverse', 'steampunk', 'robot', 'androide')) {
    const genre = 'Fantascienza (Sci-Fi)';
    if (has('cyberpunk', 'solarpunk')) return { genre, subgenre: 'Cyberpunk & Solarpunk' };
    if (has('distopia', 'dystopia', 'post-apocalittico', '1984', 'orwell')) return { genre, subgenre: 'Distopia & Post-Apocalittico' };
    if (has('space opera', 'galassia', 'interstellare', 'spazio')) return { genre, subgenre: 'Space Opera' };
    if (has('tempo', 'time travel', 'multiverso')) return { genre, subgenre: 'Viaggi nel Tempo & Multiverso' };
    if (has('militare', 'military')) return { genre, subgenre: 'Fantascienza Militare' };
    if (has('steampunk')) return { genre, subgenre: 'Steampunk & Retrofuturismo' };
    if (has('alien', 'extraterrestre', 'primo contatto')) return { genre, subgenre: 'Primo Contatto Alieno' };
    return { genre, subgenre: 'Space Opera' };
  }

  // 5. Horror, Grottesco & Mistero
  if (has('horror', 'terrore', 'brivido', 'lovecraft', 'grottesco', 'spavent', 'fantasma', 'fantasmi', 'haunted', 'infestat', 'splatter', 'demone', 'demoni', 'esorcismo', 'occulto')) {
    const genre = 'Horror, Grottesco & Mistero';
    if (has('lovecraft', 'cosmic horror', 'cosmico')) return { genre, subgenre: 'Horror Cosmico (Lovecraftiano)' };
    if (has('occulto', 'demone', 'stregoneria', 'demoniaco')) return { genre, subgenre: 'Stregoneria, Occulto & Demoniaco' };
    if (has('fantasma', 'fantasmi', 'ghost', 'casa stregata')) return { genre, subgenre: 'Storie di Fantasmi & Case Stregate' };
    if (has('splatter', 'gore', 'body horror')) return { genre, subgenre: 'Splatterpunk & Body Horror' };
    return { genre, subgenre: 'Horror Psicologico' };
  }

  // 6. Romance & Sentimentale
  if (has('romance', 'love story', 'sentimentale', 'amore', 'innamorat', 'romantic', 'regency', 'commedia romantica', 'enemies to lovers', 'dark romance')) {
    const genre = 'Romance & Sentimentale';
    if (has('storico', 'regency', 'bridgerton', 'ottocento')) return { genre, subgenre: 'Romance Storico / Regency' };
    if (has('dark romance')) return { genre, subgenre: 'Dark Romance' };
    if (has('young adult', 'new adult')) return { genre, subgenre: 'New Adult & Young Adult Romance' };
    if (has('commedia', 'comico', 'divertente')) return { genre, subgenre: 'Commedia Romantica' };
    if (has('enemies to lovers', 'tropi')) return { genre, subgenre: 'Enemies to Lovers & Tropi Classici' };
    return { genre, subgenre: 'Romance Contemporaneo' };
  }

  // 7. Crescita Personale & Mindset
  if (has('self-help', 'crescita personale', 'mindset', 'abitudini', 'produttività', 'time management', 'psicologia', 'stoicismo', 'stoic', 'leadership', 'mindfulness', 'meditazione', 'motivazione', 'benessere')) {
    const genre = 'Crescita Personale & Mindset';
    if (has('abitudini', 'atomic habits', 'disciplina', 'routine')) return { genre, subgenre: 'Costruzione Abitudini & Disciplina' };
    if (has('produttività', 'time management', 'efficienza')) return { genre, subgenre: 'Produttività & Time Management' };
    if (has('stoicismo', 'filosofia applicata', 'marco aurelio', 'seneca')) return { genre, subgenre: 'Stoicismo & Filosofia Applicata' };
    if (has('finanza personale', 'soldi', 'risparmio', 'investire')) return { genre, subgenre: 'Finanza Personale & Indipendenza' };
    if (has('leadership', 'comunicazione', 'parlare in pubblico')) return { genre, subgenre: 'Leadership & Comunicazione' };
    if (has('mindfulness', 'ansia', 'stress', 'benessere mentale')) return { genre, subgenre: 'Mindfulness & Benessere Mentale' };
    return { genre, subgenre: 'Psicologia Pratica & Emotiva' };
  }

  // 8. Biografie & Memorie
  if (has('biography', 'autobiography', 'biografia', 'autobiografia', 'memorie', 'memoir', 'diario', 'lettere')) {
    const genre = 'Biografie & Memorie';
    if (has('scienziat', 'innovat', 'jobs', 'musk', 'einstein')) return { genre, subgenre: 'Biografie di Scienziati & Innovatori' };
    if (has('viaggio', 'esplorazione', 'diari')) return { genre, subgenre: 'Diari di Viaggio & Esplorazione' };
    if (has('storia', 'storica', 're', 'imperator', 'politico')) return { genre, subgenre: 'Biografie Storiche' };
    return { genre, subgenre: 'Autobiografie & Memorie' };
  }

  // 9. Business & Tecnologia
  if (has('business', 'economics', 'economia', 'startup', 'imprenditor', 'marketing', 'finanza', 'tecnologia', 'computer science', 'intelligenza artificiale', 'artificial intelligence', 'software', 'programming')) {
    const genre = 'Business & Tecnologia';
    if (has('startup', 'imprenditoria', 'founder')) return { genre, subgenre: 'Imprenditoria & Startup' };
    if (has('intelligenza artificiale', 'ai', 'tech', 'software', 'algoritmi')) return { genre, subgenre: 'Intelligenza Artificiale & Tech' };
    if (has('marketing', 'branding', 'vendite')) return { genre, subgenre: 'Marketing & Branding' };
    if (has('management', 'strategia', 'gestione')) return { genre, subgenre: 'Management & Strategia' };
    return { genre, subgenre: 'Economia & Mercati Globali' };
  }

  // 10. Religione & Spiritualità
  if (has('religion', 'religione', 'spiritual', 'spiritualità', 'teologia', 'bibbia', 'cristianesimo', 'buddhismo', 'islam', 'vangelo', 'esoterismo', 'simboli')) {
    const genre = 'Religione & Spiritualità';
    if (has('esoterismo', 'simbologia', 'tarocchi', 'astrologia')) return { genre, subgenre: 'Esoterismo & Simbologia Antica' };
    if (has('teologia', 'storia delle religioni', 'chiesa')) return { genre, subgenre: 'Teologia & Storia delle Religioni' };
    return { genre, subgenre: 'Spiritualità & Meditazione' };
  }

  // 11. Manuali, Hobby & Lifestyle
  if (has('cooking', 'cucina', 'ricette', 'gastronomia', 'enologia', 'vino', 'sport', 'fitness', 'allenamento', 'viaggio', 'guide turistiche', 'giardinaggio', 'fai da te', 'gaming')) {
    const genre = 'Manuali, Hobby & Lifestyle';
    if (has('cucina', 'cooking', 'ricette', 'chef', 'vino')) return { genre, subgenre: 'Cucina, Gastronomia & Enologia' };
    if (has('sport', 'fitness', 'allenamento', 'calcio', 'corsa')) return { genre, subgenre: 'Sport, Fitness & Allenamento' };
    if (has('viaggi', 'guide', 'turismo', 'lonely planet')) return { genre, subgenre: 'Viaggi & Guide Turistiche' };
    if (has('fai da te', 'giardino', 'piante', 'natura')) return { genre, subgenre: 'Fai da Te, Giardinaggio & Natura' };
    return { genre, subgenre: 'Informatica, Programmazione & Gaming' };
  }

  // 12. Ragazzi & Young Adult
  if (has('juvenile', 'children', 'ragazzi', 'young adult', 'bambini', 'infanzia', 'scuola media', 'favola')) {
    const genre = 'Ragazzi & Young Adult';
    if (has('fantasy')) return { genre, subgenre: 'Young Adult Fantasy' };
    if (has('dystopian', 'distopia')) return { genre, subgenre: 'Young Adult Dystopian' };
    if (has('illustrat', 'fiabe', 'disegni')) return { genre, subgenre: 'Fiabe Illustrate' };
    return { genre, subgenre: 'Narrativa per Ragazzi (10-14 anni)' };
  }

  // 13. Saggistica & Conoscenza
  if (has('history', 'storia', 'filosofia', 'philosophy', 'science', 'scienza', 'astrofisica', 'spazio', 'biologia', 'sociologia', 'geopolitica', 'antropologia', 'archeologia', 'arte', 'architettura', 'musica', 'cinema', 'saggio', 'non-fiction', 'nonfiction')) {
    const genre = 'Saggistica & Conoscenza';
    if (has('storia', 'history', 'roma', 'guerra', 'medievale', 'moderna')) return { genre, subgenre: 'Storia Antica, Medievale & Moderna' };
    if (has('filosofia', 'philosophy', 'kant', 'nietzsche', 'pensiero')) return { genre, subgenre: 'Filosofia & Pensiero Critico' };
    if (has('spazio', 'astrofisica', 'fisica', 'astronomia', 'scienza')) return { genre, subgenre: 'Scienza, Astrofisica & Spazio' };
    if (has('biologia', 'ecologia', 'natura', 'animali')) return { genre, subgenre: 'Biologia, Natura & Ecologia' };
    if (has('sociologia', 'geopolitica', 'politica', 'società')) return { genre, subgenre: 'Sociologia & Geopolitica' };
    if (has('antropologia', 'archeologia')) return { genre, subgenre: 'Antropologia & Archeologia' };
    if (has('arte', 'architettura', 'design', 'pittura')) return { genre, subgenre: 'Arte, Architettura & Design' };
    if (has('musica', 'cinema', 'spettacolo', 'teatro')) return { genre, subgenre: 'Musica, Cinema & Spettacolo' };
    return { genre, subgenre: 'Filosofia & Pensiero Critico' };
  }

  // 14. Narrativa & Classici (Default / Romanzi generici)
  const genre = 'Narrativa & Classici';
  const pubYearNum = input.publishedYear ? parseInt(String(input.publishedYear), 10) : 0;
  if (pubYearNum > 0 && pubYearNum < 1970) {
    return { genre, subgenre: 'Classici della Letteratura' };
  }
  if (has('classic', 'classico', 'classici', 'letteratura classica', 'dante', 'manzoni', 'pirandello', 'calvino', 'shakespeare', 'dostoevskij', 'tolstoj')) {
    return { genre, subgenre: 'Classici della Letteratura' };
  }
  if (has('storico', 'medioevo', 'rinascimento', 'guerra mondiale')) {
    return { genre, subgenre: 'Romanzo Storico' };
  }
  if (has('poesia', 'poesie', 'dramma', 'teatro')) {
    return { genre, subgenre: 'Poesia & Drammaturgia' };
  }
  if (has('satira', 'umorismo', 'comico')) {
    return { genre, subgenre: 'Narrativa Umoristica & Satira' };
  }
  if (has('realismo magico', 'marquez')) {
    return { genre, subgenre: 'Realismo Magico' };
  }

  return {
    genre,
    subgenre: 'Narrativa Contemporanea'
  };
}
