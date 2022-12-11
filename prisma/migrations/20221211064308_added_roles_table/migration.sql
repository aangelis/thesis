-- CreateTable
CREATE TABLE "Roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_secretary" BOOLEAN NOT NULL DEFAULT false,
    "is_librarian" BOOLEAN NOT NULL DEFAULT false,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateIndex
CREATE UNIQUE INDEX "Roles_email_key" ON "Roles"("email");
