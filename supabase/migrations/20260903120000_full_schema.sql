-- Migration: Schema Completo e Unificato per BiblioDesk
-- Descrizione: Tabelle con vincoli foreign key, indici e Row Level Security (RLS) isolate per utente.

-- 1. Tabella Profili Utente
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    banner_url TEXT,
    badge TEXT DEFAULT 'Lettore Novizio 📚',
    reading_goal INT DEFAULT 24,
    favorite_genres JSONB DEFAULT '[]'::jsonb,
    favorite_subgenres JSONB DEFAULT '{}'::jsonb,
    selected_widgets JSONB DEFAULT '["read_count", "reading_count"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profili visibili a tutti gli utenti autenticati" ON public.profiles;
CREATE POLICY "Profili visibili a tutti gli utenti autenticati"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Utenti possono aggiornare il proprio profilo" ON public.profiles;
CREATE POLICY "Utenti possono aggiornare il proprio profilo"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Utenti possono inserire il proprio profilo" ON public.profiles;
CREATE POLICY "Utenti possono inserire il proprio profilo"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 2. Tabella Catalogo Libri Globale (Metadata condivisibili)
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_url TEXT,
    isbn TEXT,
    total_pages INT,
    genre TEXT DEFAULT 'Narrativa',
    publisher TEXT,
    published_year TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_books_isbn ON public.books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_title_author ON public.books(title, author);

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Libri consultabili da tutti gli utenti autenticati" ON public.books;
CREATE POLICY "Libri consultabili da tutti gli utenti autenticati"
    ON public.books FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Utenti autenticati possono inserire libri" ON public.books;
CREATE POLICY "Utenti autenticati possono inserire libri"
    ON public.books FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "Utenti autenticati possono aggiornare libri" ON public.books;
CREATE POLICY "Utenti autenticati possono aggiornare libri"
    ON public.books FOR UPDATE
    TO authenticated
    USING (true);

-- 3. Tabella Libreria Personale / Stato di Lettura (Relazionale)
CREATE TABLE IF NOT EXISTS public.user_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Da leggere', -- 'Da leggere' | 'In lettura' | 'Letto'
    pages_read INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    rating INT,
    review TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_user_book_rel UNIQUE (user_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_user_books_user_id ON public.user_books(user_id);
CREATE INDEX IF NOT EXISTS idx_user_books_status ON public.user_books(status);

ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utenti possono vedere solo i propri libri personali" ON public.user_books;
CREATE POLICY "Utenti possono vedere solo i propri libri personali"
    ON public.user_books FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono inserire solo nella propria libreria" ON public.user_books;
CREATE POLICY "Utenti possono inserire solo nella propria libreria"
    ON public.user_books FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono aggiornare solo i propri libri" ON public.user_books;
CREATE POLICY "Utenti possono aggiornare solo i propri libri"
    ON public.user_books FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono eliminare solo i propri libri" ON public.user_books;
CREATE POLICY "Utenti possono eliminare solo i propri libri"
    ON public.user_books FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 4. Tabella Raccolte e Wishlist Personalizzate
CREATE TABLE IF NOT EXISTS public.user_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT DEFAULT 'Heart',
    accent_color TEXT DEFAULT 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_collections_user_id ON public.user_collections(user_id);

ALTER TABLE public.user_collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utenti vedono solo le proprie raccolte" ON public.user_collections;
CREATE POLICY "Utenti vedono solo le proprie raccolte"
    ON public.user_collections FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono creare proprie raccolte" ON public.user_collections;
CREATE POLICY "Utenti possono creare proprie raccolte"
    ON public.user_collections FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono modificare proprie raccolte" ON public.user_collections;
CREATE POLICY "Utenti possono modificare proprie raccolte"
    ON public.user_collections FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono eliminare proprie raccolte" ON public.user_collections;
CREATE POLICY "Utenti possono eliminare proprie raccolte"
    ON public.user_collections FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Tabella Amicizie
CREATE TABLE IF NOT EXISTS public.amicizie (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amico_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stato TEXT NOT NULL DEFAULT 'in_attesa', -- 'in_attesa' | 'accettata' | 'rifiutata'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_friendship UNIQUE (user_id, amico_id)
);

CREATE INDEX IF NOT EXISTS idx_amicizie_users ON public.amicizie(user_id, amico_id);

ALTER TABLE public.amicizie ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Utenti vedono le proprie relazioni di amicizia" ON public.amicizie;
CREATE POLICY "Utenti vedono le proprie relazioni di amicizia"
    ON public.amicizie FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = amico_id);

DROP POLICY IF EXISTS "Utenti possono inviare richieste di amicizia" ON public.amicizie;
CREATE POLICY "Utenti possono inviare richieste di amicizia"
    ON public.amicizie FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti coinvolti possono aggiornare amicizia" ON public.amicizie;
CREATE POLICY "Utenti coinvolti possono aggiornare amicizia"
    ON public.amicizie FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR auth.uid() = amico_id);

-- 6. Tabella Spunti Social e Takeaways
CREATE TABLE IF NOT EXISTS public.spunti_social (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    libro_titolo TEXT NOT NULL,
    libro_autore TEXT,
    libro_copertina TEXT,
    testo_spunto TEXT NOT NULL,
    tipo_spunto TEXT DEFAULT 'Takeaway',
    rating INT DEFAULT 5,
    privacy TEXT DEFAULT 'public',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_spunti_created_at ON public.spunti_social(created_at DESC);

ALTER TABLE public.spunti_social ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Spunti pubblici visibili a tutti gli utenti" ON public.spunti_social;
CREATE POLICY "Spunti pubblici visibili a tutti gli utenti"
    ON public.spunti_social FOR SELECT
    TO authenticated
    USING (privacy = 'public' OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono inserire i propri spunti" ON public.spunti_social;
CREATE POLICY "Utenti possono inserire i propri spunti"
    ON public.spunti_social FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Utenti possono eliminare i propri spunti" ON public.spunti_social;
CREATE POLICY "Utenti possono eliminare i propri spunti"
    ON public.spunti_social FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 7. Tabella Comunicazioni App (Annunci / Aggiornamenti Ufficiali)
CREATE TABLE IF NOT EXISTS public.comunicazioni_app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titolo TEXT NOT NULL,
    contenuto TEXT NOT NULL,
    autore TEXT DEFAULT 'BiblioDesk Team',
    tag TEXT DEFAULT 'Novità',
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.comunicazioni_app ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutti gli utenti possono leggere le comunicazioni" ON public.comunicazioni_app;
CREATE POLICY "Tutti gli utenti possono leggere le comunicazioni"
    ON public.comunicazioni_app FOR SELECT
    TO authenticated
    USING (true);
