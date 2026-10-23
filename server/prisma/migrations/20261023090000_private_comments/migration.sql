-- Replies on a circular are private between the writer and the sender unless
-- the writer chooses to show them to everyone on the document.
ALTER TABLE "DocumentComment" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;
