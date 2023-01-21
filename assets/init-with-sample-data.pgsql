--
-- PostgreSQL database dump
--

-- Dumped from database version 14.3
-- Dumped by pg_dump version 14.6 (Ubuntu 14.6-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Deposit; Type: TABLE; Schema: public; Owner: user01
--

CREATE TABLE public."Deposit" (
    id integer NOT NULL,
    title character varying(500) NOT NULL,
    title_el character varying(500) NOT NULL,
    title_en character varying(500) NOT NULL,
    content text,
    abstract_el text,
    abstract_en text,
    keywords_el text,
    keywords_en text,
    pages integer DEFAULT 0 NOT NULL,
    language character varying(50) NOT NULL,
    images integer DEFAULT 0 NOT NULL,
    tables integer DEFAULT 0 NOT NULL,
    diagrams integer DEFAULT 0 NOT NULL,
    maps integer DEFAULT 0 NOT NULL,
    drawings integer DEFAULT 0 NOT NULL,
    confirmed boolean DEFAULT false NOT NULL,
    confirmed_timestamp timestamp(3) without time zone,
    license character varying(100) NOT NULL,
    comments text,
    submitter_id integer NOT NULL,
    submitter_department text,
    submitter_title text,
    supervisor character varying(100),
    new_filename text,
    original_filename text,
    date_created timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    date_uploaded timestamp(3) without time zone
);


ALTER TABLE public."Deposit" OWNER TO user01;

--
-- Name: Deposit_id_seq; Type: SEQUENCE; Schema: public; Owner: user01
--

CREATE SEQUENCE public."Deposit_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Deposit_id_seq" OWNER TO user01;

--
-- Name: Deposit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user01
--

ALTER SEQUENCE public."Deposit_id_seq" OWNED BY public."Deposit".id;


--
-- Name: Permission; Type: TABLE; Schema: public; Owner: user01
--

CREATE TABLE public."Permission" (
    id integer NOT NULL,
    submitter_email text NOT NULL,
    due_to timestamp(3) without time zone NOT NULL,
    secretary_id integer NOT NULL
);


ALTER TABLE public."Permission" OWNER TO user01;

--
-- Name: Permission_id_seq; Type: SEQUENCE; Schema: public; Owner: user01
--

CREATE SEQUENCE public."Permission_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Permission_id_seq" OWNER TO user01;

--
-- Name: Permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user01
--

ALTER SEQUENCE public."Permission_id_seq" OWNED BY public."Permission".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: user01
--

CREATE TABLE public."Role" (
    id integer NOT NULL,
    email text NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    is_secretary boolean DEFAULT false NOT NULL,
    is_librarian boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Role" OWNER TO user01;

--
-- Name: Role_id_seq; Type: SEQUENCE; Schema: public; Owner: user01
--

CREATE SEQUENCE public."Role_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Role_id_seq" OWNER TO user01;

--
-- Name: Role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user01
--

ALTER SEQUENCE public."Role_id_seq" OWNED BY public."Role".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: user01
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    name_el character varying(100),
    name_en character varying(100),
    surname_el character varying(100),
    surname_en character varying(100),
    father_name_el character varying(100),
    father_name_en character varying(100),
    department character varying(100),
    title character varying(100),
    title_ldap character varying(100),
    is_staff boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_superuser boolean DEFAULT false,
    last_login timestamp(3) without time zone,
    date_joined timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO user01;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: user01
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO user01;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: user01
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: user01
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO user01;

--
-- Name: Deposit id; Type: DEFAULT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Deposit" ALTER COLUMN id SET DEFAULT nextval('public."Deposit_id_seq"'::regclass);


--
-- Name: Permission id; Type: DEFAULT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Permission" ALTER COLUMN id SET DEFAULT nextval('public."Permission_id_seq"'::regclass);


--
-- Name: Role id; Type: DEFAULT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Role" ALTER COLUMN id SET DEFAULT nextval('public."Role_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Deposit; Type: TABLE DATA; Schema: public; Owner: user01
--

COPY public."Deposit" (id, title, title_el, title_en, content, abstract_el, abstract_en, keywords_el, keywords_en, pages, language, images, tables, diagrams, maps, drawings, confirmed, confirmed_timestamp, license, comments, submitter_id, submitter_department, submitter_title, supervisor, new_filename, original_filename, date_created, date_uploaded) FROM stdin;
3	RFSS7 verification process	διαδικασία επαλήθευσης RFSS7	RFSS7 verification process	\N			\N	\N	12	Ελληνικά	23	0	2	0	5	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0		4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
4	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-11-21 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
5	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
7	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
8	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
9	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-10-18 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
10	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
11	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
12	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
13	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
14	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
1	CSNFR verification process	διαδικασία επαλήθευσης CSNFRC	SNFR verification process	\N	\N	\N	\N	\N	86	Ελληνικά	0	1	0	21	0	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	8	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	\N	media-1674072551457-425168273.pdf	pdf-test.pdf	2022-12-31 14:21:06	\N
15	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
21	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
25	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
29	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
35	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
39	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
45	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
52	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
57	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
62	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
66	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
75	Ανάπτυξη αυτοματοποιημένου συστήματος διαχείρισης αγορών τροφίμων	Ανάπτυξη αυτοματοποιημένου συστήματος διαχείρισης αγορών τροφίμων	Development of an automated system for managing food purchases	\N			\N	\N	34	Ελληνικά	2	21	9	4	6	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
77	Χρησιμοποιώντας αντίστροφη παρεμβολή για την επίλυση μη γραμμικών εξισώσεων	Χρησιμοποιώντας αντίστροφη παρεμβολή για την επίλυση μη γραμμικών εξισώσεων	Using inverse interpolation to solve non-linear equations	\N			\N	\N	63	Ελληνικά	6	8	7	1	3	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:23:55.407	\N
16	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
20	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
23	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
28	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
32	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
36	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
40	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
42	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
44	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
46	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
50	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
54	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
58	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
17	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-12-28 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
22	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
30	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
33	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
38	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
43	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
48	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
53	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
60	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
67	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
71	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
76	Εφαρμογές Big Data στον τραπεζικό κλάδο	Εφαρμογές Big Data στον τραπεζικό κλάδο	Applications of Big Data in the banking industry	\N			\N	\N	41	Ελληνικά	2	8	4	2	5	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	7	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
18	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
24	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
27	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
34	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
41	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
47	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
51	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
56	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
59	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
64	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
70	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
73	Χρήση τεχνολογιών νευρωνικών δικτύων για αναγνώριση προσωπικότητας	Χρήση τεχνολογιών νευρωνικών δικτύων για αναγνώριση προσωπικότητας	Use of neural network technologies for personality recognition	\N	Μια μικρή περίληψη		\N	\N	56	Ελληνικά	14	2	4	2	1	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
19	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
26	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
31	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
37	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
49	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
55	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
61	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
65	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
69	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
74	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
63	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
68	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
72	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
6	διαδικασία επαλήθευσης FGRFSS7	διαδικασία επαλήθευσης FGRFSS7	FGRFSS7 verification process	\N			\N	\N	12	Ελληνικά	9	3	1	2	11	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού - Παρόμοια Διανομή 4.0		4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Ανάργυρος Τσαδήμας	\N	\N	2022-12-31 14:21:06	\N
2	NFR verification process	διαδικασία επαλήθευσης NFR	NFR verification process	\N	some short text		\N	\N	12	Ελληνικά	0	3	0	0	0	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	Ένα σύντομο σχόλιο για δοκιμή.	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: user01
--

COPY public."Permission" (id, submitter_email, due_to, secretary_id) FROM stdin;
7	itp21103@hua.gr	2023-01-03 21:59:59.999	3
8	itp21101@hua.gr	2023-01-30 21:59:59.999	6
9	itp22044@hua.gr	2022-12-31 21:59:59.999	6
10	43434344666@hua.gr	2023-01-04 21:59:59.999	3
11	itp22107@hua.gr	2023-02-24 00:00:00	6
12	itp2110122@hua.gr	2022-01-10 22:00:00	6
13	itp22039@hua.gr	2023-02-16 21:59:59.999	3
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: user01
--

COPY public."Role" (id, email, is_admin, is_secretary, is_librarian, is_active) FROM stdin;
1	itp220022@hua.gr	t	f	f	f
2	daneli@hua.gr	f	t	f	t
3	mitsi@hua.gr	f	t	f	t
4	ifigenia@hua.gr	f	f	t	t
5	itp22200@hua.gr	f	t	f	f
6	itp21101@hua.gr	f	t	f	f
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: user01
--

COPY public."User" (id, email, username, first_name, last_name, name_el, name_en, surname_el, surname_en, father_name_el, father_name_en, department, title, title_ldap, is_staff, is_active, is_superuser, last_login, date_joined) FROM stdin;
1	tsadimas@hua.gr	tsadimas	ΑΝΑΡΓΥΡΟΣ	ΤΣΑΔΗΜΑΣ	\N	\N	\N	\N	\N	\N	Πληροφορικής και Τηλεματικής	Διδακτικό Προσωπικό	\N	f	t	t	2022-12-01 18:20:39.299	2022-12-01 18:06:05.283
2	admin@hua.gr	admin	Διαχειριστής	συστήματος	\N	\N	\N	\N	\N	\N	Πληροφορικής και Τηλεματικής	Προσωπικό διαχείρισης	\N	f	t	f	2023-01-03 16:35:36.775	2022-11-29 19:21:01.346
6	daneli@hua.gr	daneli	ΦΩΤΕΙΝΗ	ΔΑΝΕΛΗ	\N	\N	\N	\N	\N	\N	Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής	Διοικητική Υπάλληλος	\N	f	t	f	2023-01-04 11:31:33.421	2022-12-27 11:25:46.981
7	itp22044@hua.gr	itp22044	ΔΗΜΗΤΡΙΟΣ	ΠΑΠΑΓΕΩΡΓΙΟΥ	Δημήτριος	Dimitrios	Παπαγεωργίου	Papageorgiou	Αθανάσιος	\N	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής	\N	f	t	f	2023-01-18 19:20:52.106	2022-12-31 13:57:01.158
3	mitsi@hua.gr	mitsi	ΜΗΤΣΗ	ΛΟΡΕΤΑ	\N	\N	\N	\N	\N	\N	Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής	Διοικητική Υπάλληλος	\N	f	t	f	2023-01-18 19:22:33.762	2022-12-24 17:37:58.608
9	itp22039@hua.gr	itp22039	ΕΥΑΓΓΕΛΟΣ	ΓΕΩΡΓΙΟΥ	\N	\N	\N	\N	\N	\N	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής	\N	f	t	f	2023-01-18 19:23:17.57	2023-01-18 19:22:08.29
8	itp21100@hua.gr	itp21100	ΒΑΣΙΛΗΣ	ΗΛΙΟΥ	Βασίλης	Vassilis	Ηλιού	Iliou	Ευάγγελος	Evangelos	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	\N	f	t	f	2023-01-18 19:24:50.415	2022-11-19 12:20:35.849
5	ifigenia@hua.gr	ifigenia	ΙΦΙΓΕΝΕΙΑ	ΒΑΡΔΑΚΩΣΤΑ	\N	\N	\N	\N	\N	\N	Βιβλιοθήκη και Κέντρο Πληροφόρησης	Bιβλιοθηκάριος	\N	f	t	f	2023-01-19 18:02:15.108	2022-12-20 18:48:36.879
4	itp21101@hua.gr	itp21101	ΑΠΟΣΤΟΛΟΣ	ΑΓΓΕΛΗΣ	Απόστολος	Apostolos	Αγγέλης	Angelis	Δημήτριος	Dimitrios	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	\N	f	t	f	2023-01-19 19:34:13.169	2022-11-19 12:20:23.21
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: user01
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e196f824-ecd7-4263-849e-77da6e448f1a	6877972752014779c3e2b3d60e33d0ee6c762d055029559de720fca427155e7b	2023-01-18 19:09:09.756427+00	20230118190909_init	\N	\N	2023-01-18 19:09:09.690459+00	1
\.


--
-- Name: Deposit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user01
--

SELECT pg_catalog.setval('public."Deposit_id_seq"', 77, true);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user01
--

SELECT pg_catalog.setval('public."Permission_id_seq"', 13, true);


--
-- Name: Role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user01
--

SELECT pg_catalog.setval('public."Role_id_seq"', 6, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user01
--

SELECT pg_catalog.setval('public."User_id_seq"', 9, true);


--
-- Name: Deposit Deposit_pkey; Type: CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Role_email_key; Type: INDEX; Schema: public; Owner: user01
--

CREATE UNIQUE INDEX "Role_email_key" ON public."Role" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: user01
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: user01
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: Deposit Deposit_submitter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Deposit"
    ADD CONSTRAINT "Deposit_submitter_id_fkey" FOREIGN KEY (submitter_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Permission Permission_secretary_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: user01
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_secretary_id_fkey" FOREIGN KEY (secretary_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

