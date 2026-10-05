-- Supervisor is the department head, so name it HOD; add the leadership roles
-- used by the document and fleet subsystems.
ALTER TYPE "Role" RENAME VALUE 'SUPERVISOR' TO 'HOD';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PS';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'DIRECTOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ASSISTANT_DIRECTOR';
