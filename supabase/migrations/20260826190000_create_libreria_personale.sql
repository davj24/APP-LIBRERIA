-- Migration: Create public.libreria_personale table with RLS Policies
-- Description: Enables personal library membership per user with full Row Level Security isolation.

-- 1. Create the join table if it does not already exist
CREATE TABLE IF NOT EXISTS public.libreria_personale (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevent duplicate book entries per user
    CONSTRAINT unique_user_book UNIQUE (user_id, book_id)
);

-- Note: If public.books table exists or is created later, you can add a foreign key constraint:
-- ALTER TABLE public.libreria_personale
--   ADD CONSTRAINT fk_libreria_personale_book
--   FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.libreria_personale ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to allow safe re-execution)
DROP POLICY IF EXISTS "Users can view their own library entries" ON public.libreria_personale;
DROP POLICY IF EXISTS "Users can insert into their own library" ON public.libreria_personale;
DROP POLICY IF EXISTS "Users can update their own library entries" ON public.libreria_personale;
DROP POLICY IF EXISTS "Users can delete from their own library" ON public.libreria_personale;

-- 4. Create RLS Policies for full CRUD security

-- SELECT Policy: Users can only view rows where user_id matches their authenticated auth.uid()
CREATE POLICY "Users can view their own library entries"
    ON public.libreria_personale
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- INSERT Policy: Users can only insert rows where user_id matches their authenticated auth.uid()
CREATE POLICY "Users can insert into their own library"
    ON public.libreria_personale
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- UPDATE Policy: Users can only update rows that belong to them, and cannot assign user_id to someone else
CREATE POLICY "Users can update their own library entries"
    ON public.libreria_personale
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE Policy: Users can only delete rows where user_id matches their authenticated auth.uid()
CREATE POLICY "Users can delete from their own library"
    ON public.libreria_personale
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
