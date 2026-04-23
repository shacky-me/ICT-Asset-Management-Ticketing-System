-- Add non-ICT requestable roles used by the access request flow.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'END_USER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPERVISOR';
