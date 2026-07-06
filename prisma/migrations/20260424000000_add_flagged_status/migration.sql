-- Add Flagged status to AssetStatus enum
ALTER TYPE "AssetStatus" ADD VALUE IF NOT EXISTS 'Flagged';
