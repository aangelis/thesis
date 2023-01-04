-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "name_el" TEXT,
    "name_en" TEXT,
    "surname_el" TEXT,
    "surname_en" TEXT,
    "father_name_el" TEXT,
    "father_name_en" TEXT,
    "department" TEXT,
    "title" TEXT,
    "title_ldap" TEXT,
    "is_staff" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "is_superuser" BOOLEAN DEFAULT false,
    "last_login" DATETIME,
    "date_joined" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "title_el" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "content" TEXT,
    "abstract_el" TEXT,
    "abstract_en" TEXT,
    "keywords_el" TEXT,
    "keywords_en" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL,
    "images" INTEGER NOT NULL DEFAULT 0,
    "tables" INTEGER NOT NULL DEFAULT 0,
    "diagrams" INTEGER NOT NULL DEFAULT 0,
    "maps" INTEGER NOT NULL DEFAULT 0,
    "drawings" INTEGER NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_timestamp" DATETIME,
    "license" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "Role" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_secretary" BOOLEAN NOT NULL DEFAULT false,
    "is_librarian" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submitter_email" TEXT NOT NULL,
    "due_to" DATETIME NOT NULL,
    "secretary_id" INTEGER NOT NULL,
    CONSTRAINT "Permission_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_email_key" ON "Role"("email");