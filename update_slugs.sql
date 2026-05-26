-- 1. Add slug column to markets and events
ALTER TABLE markets ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- 2. Populate existing rows with category/event + first 6 chars of UUID
UPDATE markets SET slug = category || '-' || substr(id::text, 1, 6) WHERE slug IS NULL;
UPDATE events SET slug = 'event-' || substr(id::text, 1, 6) WHERE slug IS NULL;

-- 3. Create triggers for new rows to auto-generate slug
CREATE OR REPLACE FUNCTION public.generate_market_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := NEW.category || '-' || substr(NEW.id::text, 1, 6);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_market_insert_slug ON markets;
CREATE TRIGGER on_market_insert_slug
    BEFORE INSERT ON markets
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_market_slug();

CREATE OR REPLACE FUNCTION public.generate_event_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := 'event-' || substr(NEW.id::text, 1, 6);
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_event_insert_slug ON events;
CREATE TRIGGER on_event_insert_slug
    BEFORE INSERT ON events
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_event_slug();
