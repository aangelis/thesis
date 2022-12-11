/*
  Warnings:

  - You are about to drop the column `is_enabled` on the `Role` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_secretary" BOOLEAN NOT NULL DEFAULT false,
    "is_librarian" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Role" ("email", "id", "is_admin", "is_librarian", "is_secretary") SELECT "email", "id", "is_admin", "is_librarian", "is_secretary" FROM "Role";
DROP TABLE "Role";
ALTER TABLE "new_Role" RENAME TO "Role";
CREATE UNIQUE INDEX "Role_email_key" ON "Role"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
