-- CreateTable
CREATE TABLE "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submitter_email" TEXT NOT NULL,
    "due_to" DATETIME NOT NULL,
    "secretary_id" INTEGER NOT NULL
);
