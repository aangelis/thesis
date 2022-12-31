-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deposit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "title_el" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "content" TEXT,
    "abstract_el" TEXT,
    "abstract_en" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT,
    "images" INTEGER NOT NULL DEFAULT 0,
    "tables" INTEGER NOT NULL DEFAULT 0,
    "diagrams" INTEGER NOT NULL DEFAULT 0,
    "maps" INTEGER NOT NULL DEFAULT 0,
    "drawings" INTEGER NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_timestamp" DATETIME,
    "license" TEXT,
    "comments" TEXT,
    "submitter_id" INTEGER NOT NULL,
    "submitter_department" TEXT,
    "submitter_title" TEXT,
    "supervisor" TEXT,
    "new_filename" TEXT,
    "original_filename" TEXT,
    "date_created" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deposit_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deposit" ("abstract_el", "abstract_en", "comments", "confirmed", "confirmed_timestamp", "content", "diagrams", "drawings", "id", "images", "language", "license", "maps", "new_filename", "original_filename", "pages", "submitter_department", "submitter_id", "submitter_title", "supervisor", "tables", "title", "title_el", "title_en") SELECT "abstract_el", "abstract_en", "comments", "confirmed", "confirmed_timestamp", "content", "diagrams", "drawings", "id", "images", "language", "license", "maps", "new_filename", "original_filename", "pages", "submitter_department", "submitter_id", "submitter_title", "supervisor", "tables", "title", "title_el", "title_en" FROM "Deposit";
DROP TABLE "Deposit";
ALTER TABLE "new_Deposit" RENAME TO "Deposit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
