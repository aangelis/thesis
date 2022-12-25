-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submitter_email" TEXT NOT NULL,
    "due_to" DATETIME NOT NULL,
    "secretary_id" INTEGER NOT NULL,
    CONSTRAINT "Permission_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Permission" ("due_to", "id", "secretary_id", "submitter_email") SELECT "due_to", "id", "secretary_id", "submitter_email" FROM "Permission";
DROP TABLE "Permission";
ALTER TABLE "new_Permission" RENAME TO "Permission";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
