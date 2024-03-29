-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "name_el" VARCHAR(100),
    "name_en" VARCHAR(100),
    "surname_el" VARCHAR(100),
    "surname_en" VARCHAR(100),
    "father_name_el" VARCHAR(100),
    "father_name_en" VARCHAR(100),
    "department" VARCHAR(100),
    "title" VARCHAR(100),
    "title_ldap" VARCHAR(100),
    "is_staff" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "is_superuser" BOOLEAN DEFAULT false,
    "last_login" TIMESTAMP(3),
    "date_joined" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deposit" (
    "id" SERIAL NOT NULL,
    "title_el" VARCHAR(500) NOT NULL,
    "title_en" VARCHAR(500) NOT NULL,
    "content" TEXT,
    "abstract_el" TEXT,
    "abstract_en" TEXT,
    "keywords_el" TEXT,
    "keywords_en" TEXT,
    "pages" INTEGER NOT NULL DEFAULT 0,
    "language" VARCHAR(50) NOT NULL,
    "images" INTEGER NOT NULL DEFAULT 0,
    "tables" INTEGER NOT NULL DEFAULT 0,
    "diagrams" INTEGER NOT NULL DEFAULT 0,
    "maps" INTEGER NOT NULL DEFAULT 0,
    "drawings" INTEGER NOT NULL DEFAULT 0,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_timestamp" TIMESTAMP(3),
    "license" VARCHAR(100) NOT NULL,
    "comments" TEXT,
    "submitter_id" INTEGER NOT NULL,
    "submitter_department" TEXT,
    "submitter_title" TEXT,
    "supervisor" VARCHAR(100),
    "new_filename" TEXT,
    "original_filename" TEXT,
    "date_created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_uploaded" TIMESTAMP(3),

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_secretary" BOOLEAN NOT NULL DEFAULT false,
    "is_librarian" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "submitter_email" TEXT NOT NULL,
    "due_to" TIMESTAMP(3) NOT NULL,
    "secretary_id" INTEGER NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_email_key" ON "Role"("email");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_submitter_id_fkey" FOREIGN KEY ("submitter_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_secretary_id_fkey" FOREIGN KEY ("secretary_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Name: notifyconfirmed(); Type: FUNCTION; Schema: public; Owner: user01
--

CREATE OR REPLACE FUNCTION public.notifyconfirmed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN PERFORM pg_notify('thesis_confirmed_deposit', row_to_json(NEW)::text); RETURN new; END; $$;


-- ALTER FUNCTION public.notifyconfirmed() OWNER TO user01;

--
-- Name: Deposit tr_deposit_confirmed; Type: TRIGGER; Schema: public; Owner: user01
--

CREATE TRIGGER tr_deposit_confirmed AFTER UPDATE OF confirmed ON public."Deposit" FOR EACH ROW WHEN ((new.confirmed IS TRUE)) EXECUTE FUNCTION public.notifyconfirmed();
