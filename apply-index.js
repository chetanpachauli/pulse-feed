const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function applyIndex() {
  try {
    console.log('Applying GIN index for search...');
    
    // Add tsvector column
    await prisma.$executeRaw`ALTER TABLE "contents" ADD COLUMN IF NOT EXISTS "title_tsvector" tsvector GENERATED ALWAYS AS (to_tsvector('english', title)) STORED`;
    
    // Create GIN index
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "contents_title_gin_idx" ON "contents" USING GIN ("title_tsvector")`;
    
    // Create trigger function
    await prisma.$executeRaw`CREATE OR REPLACE FUNCTION update_title_tsvector() RETURNS TRIGGER AS $$ BEGIN NEW.title_tsvector := to_tsvector('english', NEW.title); RETURN NEW; END; $$ LANGUAGE plpgsql`;
    
    // Create trigger
    await prisma.$executeRaw`DROP TRIGGER IF EXISTS "contents_title_tsvector_update" ON "contents"`;
    await prisma.$executeRaw`CREATE TRIGGER "contents_title_tsvector_update" BEFORE INSERT OR UPDATE ON "contents" FOR EACH ROW EXECUTE FUNCTION update_title_tsvector()`;
    
    // Create search function
    await prisma.$executeRaw`CREATE OR REPLACE FUNCTION search_contents_by_title(search_query text) RETURNS TABLE(id text, title text, description text, type text, slug text, view_count bigint, created_at timestamp, updated_at timestamp, rank real) AS $$ BEGIN RETURN QUERY SELECT c.id, c.title, c.description, c.type::text, c.slug, c.view_count, c.created_at, c.updated_at, ts_rank(c.title_tsvector, plainto_tsquery('english', search_query)) as rank FROM "contents" c WHERE c.title_tsvector @@ plainto_tsquery('english', search_query) ORDER BY rank DESC, c.created_at DESC; END; $$ LANGUAGE plpgsql`;
    
    console.log('GIN index and search functionality applied successfully!');
    
  } catch (error) {
    console.error('Error applying index:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

applyIndex();
