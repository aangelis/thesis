--
-- PostgreSQL database dump
--

-- Dumped from database version 14.6 (Debian 14.6-1.pgdg110+1)
-- Dumped by pg_dump version 14.6 (Debian 14.6-1.pgdg110+1)

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

--
-- Name: notifyconfirmed(); Type: FUNCTION; Schema: public; Owner: user01
--

CREATE FUNCTION public.notifyconfirmed() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ BEGIN PERFORM pg_notify('thesis_confirmed_deposit', row_to_json(NEW)::text); RETURN new; END; $$;


ALTER FUNCTION public.notifyconfirmed() OWNER TO user01;

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
10	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
11	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-01-06 09:31:32.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
12	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2020-03-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
13	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
14	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
15	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
8	Ανάπτυξη πληροφοριακού συστήματος διαχείρισης υποτροφιών	Ανάπτυξη πληροφοριακού συστήματος διαχείρισης υποτροφιών	Scholarship management information system	\N	Η εργασία αυτή πραγματεύεται την ανάπτυξη μία διαδικτυακής εφαρμογής για τη διαχείριση υποτροφιών από ιδρύματα ανά την επικράτεια, η οποία αναπτύχθηκε υπό την αιγίδα του Study in Greece. Αυτή τη στιγμή τα ιδρύματα χρησιμοποιούν διάφορες πλατφόρμες για να δημοσιοποιήσουν τις ανακοινώσεις τους για τις παρεχόμενες υποτροφίες τους. Αυτό δεν αποτελεί τη βέλτιστη λύση, γιατί δυσχεραίνει το έργο των υποψηφίων στην αναζήτηση της κατάλληλης υποτροφίας. Έτσι αναπτύχθηκε η πλατφόρμα που αναλύεται σε αυτή τη διπλωματική εργασία. Οι βασικοί χρήστες αυτής της πλατφόρμας είναι ο γενικός διαχειριστής, τα ιδρύματα και οι υποψήφιοι. Σε αυτή την πλατφόρμα ένας χρήστης αποκτάει έναν ιδρυματικό λογαριασμό - σε συνεννόηση με το γενικό διαχειριστή της πλατφόρμας - και έπειτα του δίνεται η δυνατότητα να διαχειρίζεται εξ’ ολοκλήρου τις υποτροφίες του ιδρύματος, δηλαδή να δημιουργεί, να προσαρμόζει, να διαγράφει ή να απενεργοποιεί υποτροφίες. Τέλος, οι δυνητικοί υποψήφιοι μπορούν να αναζητούν την υποτροφία που τους ενδιαφέρει, με βάση διάφορα κριτήρια που εκείνοι επιλέγουν.	This thesis deals with the development of a web application for the management of scholarships from institutions throughout the country, which was developed with the support of Study in Greece. Currently, institutions use various platforms to publicize their announcements about the scholarships they offer. This is not an optimal solution, as it makes it difficult for applicants to find the right scholarship for them. Thus, the platform described in this thesis was developed. The main user entities of this platform are the general administrator, the institutions and the applicants. In this platform, a user acquires an institutional account – approved by the general administrator of the platform - and is then given the possibility to fully manage the scholarships of the institution, i.e., to create, edit, delete or deactivate scholarships. Finally, potential applicants can search for the scholarship they are interested in, based on various criteria of their choice.	εφαρμογή, διαδίκτυο	Django, Python, PostgreSQL, application, web	0	Ελληνικά	0	0	0	0	0	t	2019-06-08 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Χρήστος Μιχαλακέλης	\N	\N	2022-12-31 14:21:06	\N
4	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια περίληψη	Sample abstract text	\N	\N	0	Ελληνικά	0	0	0	0	0	t	2022-11-21 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Βαρλάμης Ηρακλής	\N	\N	2022-12-31 14:21:06	\N
9	Τεχνοοικονομική Ανάλυση Σε IoT: Περίπτωση Wristbands	Τεχνοοικονομική Ανάλυση Σε IoT: Περίπτωση Wristbands	Techno-economic Analysis in IoT: Case Wristbands	\N	Τα τελευταία χρόνια, το Internet of Things (IoT) (ελληνικά: Διαδίκτυο των Πραγμάτων) έχει γίνει μια από τις σημαντικότερες τεχνολογίες του 21ου αιώνα. Το ΙοΤ δεν είναι μια ενιαία τεχνολογία, είναι μια ιδέα στην οποία συνδέονται και ενεργοποιούνται τα περισσότερα νέα πράγματα, προσφέροντας με αυτόν τον τρόπο πολλές επιχειρηματικές ευκαιρίες και προσθέτοντας στην πολυπλοκότητα της πληροφορικής, αλλά και βελτιώνοντας τον τρόπο ζωής των ανθρώπων. Σκοπός της παρούσας εργασίας είναι η τεχνοοικονομική ανάλυση και αξιολόγηση, μιας υποτιθέμενης νεοφυούς εταιρίας παροχής Β2Β υπηρεσιών στον κλάδο της τεχνολογίας και υγείας η οποία θα εμπορεύεται τους δικούς της Activity Trackers, με πρώτο και βασικό της προϊόν ένα Wristband, ενώ θα ασχολείται με την εγκατάσταση του ειδικού λογισμικού στο προϊόν, την συσκευασία του καθώς και το σχεδιασμό μιας εφαρμογής για κινητά Android και Apple. Μέσα στα πλαίσια της παρουσίασης και ανάλυσης, θα γίνει προσπάθεια αποτύπωσης, των γενικότερων πληροφοριών, σχετικά με τις απαιτούμενες τεχνολογίες, καθώς και την οικονομική βιωσιμότητα της παρούσας επένδυσης. Η εταιρία έχει πολλές προοπτικές ανάπτυξης και με βάση οικονομικό πλάνο που διενεργήθηκε, σε συνδυασμό με την επιχειρηματική ιδέα και τις αναλύσεις εσωτερικού και εξωτερικού περιβάλλοντος, έχει πολλές πιθανότητες να είναι κερδοφόρα και υγιείς, τουλάχιστον τα 5 πρώτα χρόνια μελέτης. Παράλληλα, μέσω του προσφερόμενου προϊόντος έχει σαν στόχο τη βελτίωση της ποιότητας ζωής των καταναλωτών καθώς και στην ανάπτυξη του κλάδου της Πληροφορικής και Επικοινωνιών. Τέλος, η ίδρυση της εταιρείας πρόκειται να συμβάλλει αποτελεσματικά στην ανάπτυξη της οικονομίας καθώς έρχεται να καλύψει ήδη υπάρχουσες ανάγκες τόσο από πλευράς εταιρειών που επιζητούν διαφημιστική προβολή, όσο και από πλευράς χρηστών που επιζητούν εγχώρια αγορά του παρόντος προϊόντος.	The Internet of Things (IoT) has recently become one of the most important technologies of the 21st century. IoT is not a single technology, it is an idea in which most new things are connected and activated, thus offering many business opportunities, and adding to the complexity of information technology, but also improving the way of life of people. The purpose of this study is the techno-economic analysis (business plan) and evaluation of a supposed start-up company providing B2B services in the field of technology and health, which will trade its own Activity Trackers, with its first and main product a Wristband, while it will deal with the installation of the product-specific software, its packaging and the design of an Android and Apple mobile application. Within the framework of the presentation and analysis, an attempt will be made to capture, the general information, regarding the required technologies, as well as the financial viability of the present investment. The company has many growth potential and based on a financial plan carried out, in combination with the business idea and the analysis of internal and external environment, it has many chances to be profitable and healthy, at least the first 5 years of study. At the same time, through the offered product, it aims to improve the quality of life of consumers as well as the development of the IT and Communications sector. Finally, the establishment of the company is going to contribute effectively to the development of the economy as it comes to cover existing needs both from companies seeking advertising and from users seeking domestic purchase of this product.	Ίντερνετ των Πραγμάτων, Επιχειρηματικό Σχέδιο, Χρηματοοικονομική Ανάλυση, Προϋπολογισμός	Internet of Things, Wristbands, Business Plan, Financial Analysis, Budgeting	0	Ελληνικά	0	0	0	0	0	t	2022-10-18 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Χρήστος Μιχαλακέλης	\N	\N	2022-12-31 14:21:06	\N
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
21	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	Η επιρροή του COVID-19 στην τιμή των κρυπτονομισμάτων	The Influence of COVID-19 on Cryptocurrency Price	\N	Μια δοκιμαστική περίληψη	Sample abstract text	μερικές, λέξεις, κλειδιά	some, key, words	0	Ελληνικά	0	0	0	0	0	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
76	Big Data και Ανάπτυξη Επιχειρηματικότητας	Big Data και Ανάπτυξη Επιχειρηματικότητας	Applications of Big Data in the banking industry	\N	Η παρούσα πτυχιακή εργασία εκπονήθηκε για την ολοκλήρωση της φοίτησης μας\nστο τμήμα Διοικητικής Επιστήμης και Τεχνολογίας της σχολής Οικονομικών\nΕπιστημών και Διοίκησης Επιχειρήσεων του Πανεπιστημίου Πατρών, πρώην τμήμα\nΔιοίκησης Επιχειρήσεων του Τ.Ε.Ι Πατρών. Η εκκίνηση της πτυχιακής εργασίας\nτοποθετείται χρονικά τον Μάιο του 2020.\n Το αντικείμενο της παρούσας πτυχιακής εργασίας αφορά στη μελέτη των Μεγάλων\nΔεδομένων και των τεχνολογιών τους καθώς και πως μπορούν να εφαρμοστούν στην\nσημερινή ελληνική επιχειρηματικότητα για την καλύτερη ανάπτυξη των\nεπιχειρήσεων σε όλους τους τομείς της. Κρίθηκε ακόμη σκόπιμο, να διεξαχθεί μία\nέρευνα πάνω στα όσα μελετήσαμε στα πρώτα κεφάλαια και, αν και πως οι\nεπιχειρήσεις χρησιμοποιούν κατάλληλα αυτήν την τεχνολογία, με δείγμα τις\nελληνικές επιχειρήσεις και οργανώσεις, ώστε να αποτυπώσουμε τί ισχύει για την\nελληνική οικονομία. Τέλος, παραθέσαμε τα αποτελέσματα που λάβαμε και\nπροχωρήσαμε στην εξαγωγή των συμπερασμάτων από αυτά.	The present thesis was done for the completion of our studies in the Department of\nManagement Science and Technology of the School of Economics and Business\nAdministration of the University of Patras, former Department of Business\nAdministration of the Technological Educational Institute of Patras. The start of the\nthesis is scheduled for May 2020.\n The subject of this thesis concerns the study of Big Data and their technologies as\nwell as how they can be applied in today's Greek entrepreneurship for the better\ndevelopment of the companies in all their sectors. It was also considered appropriate\nto conduct a research on what we studied on the first chapters and, although how these\ncompanies use this technology properly, with a sample of Greek companies and\norganizations, in order to see what applies to the Greek economy. At the end, we\npresented the results we received and proceeded to draw conclusions from them	Μεγάλα δεδομένα, επιχειρηματικότητα, εξαγωγή συμπερασμάτων	big data, entrepreneurship	41	Ελληνικά	2	8	4	2	5	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	7	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής		\N	\N	2022-12-31 14:21:06	\N
3	Σύστημα Ανάπτυξης και Διαχείρισης Εικονοποίησης Βασισμένης σε Περιέκτες (Containers) με Βάση το Λογισμικό Kubernetes	Σύστημα Ανάπτυξης και Διαχείρισης Εικονοποίησης Βασισμένης σε Περιέκτες (Containers) με Βάση το Λογισμικό Kubernetes	Docker container based evelopment and management system base on Kubernetes	\N	Τα τελευταία χρόνια η ανάπτυξη εφαρμογών με τη χρήση Containers, έχει αυξηθεί ραγδαία [1]. Πολλές εταιρείες και κυβερνητικοί ή μη οργανισμοί, έχουν υιοθετήσει τη χρήση τους προκειμένου να αναπτύξουν εφαρμογές βασισμένες σε “Μικροϋπηρεσίες” (Microservices) [1] [2]. Η χρήση των Containers και των Microservices δίνουν στους προγραμματιστές συγκριτικά πλεονεκτήματα στην ανάπτυξη εφαρμογών μέσω της χρήσης των τεχνικών της συνεχούς ενσωμάτωσης (Continuous Integration – CI) και της συνεχούς παράδοσης (Continuous Delivery – CD) [3]. Με τη χρήση Container Orchestration Mechanisms [4] [5], αντικείμενο που θα μελετηθεί στη παρούσα εργασία μπορεί να ενισχυθεί και να απλοποιηθεί η χρήση των τεχνικών CI/CD. Σκοπός της παρούσας εργασίας είναι να περιγράψει έναν από του ποιο δημοφιλής μηχανισμούς διαχείρισης και ενορχήστρωσης Containers, τον Κυβερνήτη (Kubernetes) [6]. Η απουσία έρευνας στον τρόπο λειτουργίας του Kubernetes στην Ελληνική γλώσσα, λόγω της πρόσφατης ανάπτυξης και διάθεσής του ως λογισμικό ανοικτού κώδικα, θα καταστήσει τη παρούσα σημείο αναφοράς για όσους θελήσουν να κατανοήσουν τον ρόλο, τον τρόπο λειτουργίας και τις δυνατότητες του Kubernetes. Επιπρόσθετα, οι αναγνώστες θα έχουν την ευκαιρία να κατανοήσουν τη χρήση των Containers καθώς και των μηχανισμών διαχείρισή τους. Η περιγραφή της λειτουργίας του Kubernetes θα υλοποιηθεί αρχικά μέσω της προσομοίωσης εγκατάστασής του σε εικονικό περιβάλλον. Το εικονικό περιβάλλον θα αποτελείται από ένα εικονικό cluster, στο οποίο θα εγκατασταθεί το Kubernetes και από ένα εικονικό εργαστήριο Η/Υ με δύο τερματικά. Η υλοποίηση όλων των παραπάνω θα γίνει με τη βοήθεια του λογισμικού VirtualBox. Έπειτα η όλη υλοποίηση θα επαληθευτεί μέσω της εγκατάστασης του σε πραγματική υποδομή, στο εργαστήριο Η/Υ και στους αντίστοιχους servers, του τμήματος «Εφαρμοσμένης Πληροφορικής» του Πανεπιστημίου Μακεδονίας. Μέσω αυτής της διαδικασίας οι αναγνώστες θα έχουν τη δυνατότητα να κατανοήσουν τον τρόπο λειτουργίας του Kubernetes, τις δυνατότητές του και τον ρόλο του στη διαχείριση των Containers.	In recent years, the use of Containers in application development has increased rapidly [1]. Many companies, governmental and non-governmental organizations have adopted their use in order to develop their applications with "Microservices" [1] [2]. The use of “containers” and “microservices” provides to developers with comparative advantages in application development enabling them to use techniques such as Continuous Integration (CI) and Continuous Delivery (CD) [3]. Additionally, the use of these techniques can be enhanced and simplified using Containers Orchestration Mechanisms [4] [5], which is the main topic of this master thesis. The purpose of this master thesis is to describe one of the most popular mechanisms for managing and orchestrating containers, the “Kubernetes” [6]. The absence of a Kubernetes survey in the Greek language due to its recent development and availability will make this, point of reference for those who want to understand the role, the mode of operation and the potentials of Kubernetes. Furthermore, readers will be able to understand the use of “containers” and the “orchestration mechanisms” in general. The description of Kubernetes will be implemented firstly in a virtual environment. This environment will be consisting of a virtual cluster, where Kubernetes will be installed and a computer lab with 2 terminal pc. All these will be implemented with the help of VirtualBox software. Afterward, this structure will be applied in a real infrastructure on the computer lab of the University of Macedonia Applied Computer Science department. Through this process, the reader will have the opportunity to understand how Kubernetes works, its role in managing container web applications and its potentials.	\N	\N	12	Ελληνικά	23	0	2	0	5	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0		4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Κωνσταντίνος Μαργαρίτης	\N	\N	2022-08-31 14:21:06	2023-01-12 14:27:06
2	Εξισορρόπηση φόρτου σε ένα web service χρησιμοποιώντας\nεικονικές μηχανές σε περιβάλλον Docker	Εξισορρόπηση φόρτου σε ένα web service χρησιμοποιώντας\nεικονικές μηχανές σε περιβάλλον Docker	Load balancing of web services in virtual machines using Docker	\N	Η επεκτασιμότητα και υψηλή διαθεσιμότητα των συστοιχιών εξυπηρετητών ιστού\nπροϋποθέτουν μια αποτελεσματική πολιτική κατανομής φόρτου. Αυτό θα\nμπορούσε να υλοποιηθεί όταν υπολογίζεται συνεχώς μια συγκεκριμένη μετρική\nπου εκφράζει την μεταβολή του φόρτου που μπορεί να διαχειρίζεται ο εκάστοτε\nεξυπηρετητής. Στην εργασία αυτή, διερευνήθηκε η δυνατότητα παρακολούθησης\nμιας μετρικής προκειμένου όταν παρίσταται ανάγκη να γίνεται αυτοματοποιημένη\nκλιμάκωση της εξισορρόπησης του φόρτου (Auto-Scaling Load Balancing). Η\nεξέταση επικεντρώθηκε σε μια σημαντική οικογένεια μετρικών που σχετίζονται με\nτα ΗΤΤP αιτήματα. Ο μηχανισμός που επιλέχθηκε για την συγκέντρωση των τιμών\nτων μετρικών αυτών είναι το Prometheus. Στο πλαίσιο αυτό πραγματοποιήθηκαν\nδοκιμές σε δύο διαφορετικούς τύπους σεναρίων. α) εξισορρόπηση φόρτου σε\nσυστοιχία των nginx εξυπηρετητών με χρήση των αλγορίθμων Round Robin (RR)\nκαι Least Connections (LC) χωρίς την δυνατότητα αυτοματοποιημένης κλιμάκωσης\nβ) εξισορρόπηση φόρτου στην συστοιχία των nginx εξυπηρετητών με χρήση των\nαλγορίθμων Round Robin (RR) και Least Connections (LC) με πλήρη εφαρμογή\nαυτοματοποιημένης κλιμάκωσης. Μια επιπλέον δυαδική διάσταση που διέπει τα\nεξεταζόμενα σενάρια είναι το αν η λειτουργία γίνεται σε συνθήκες ισορροπίας ή σε\nσυνθήκες διαταραχής. Για την επίτευξη της αυτοματοποιημένης κλιμάκωσης\nχρησιμοποιείται το Jenkins ένα εργαλείο Continuous Integration μαζί με έναν ειδικά\nπροσαρμοσμένο ΗΑproxy. Τα πειραματικά αποτελέσματα δείχνουν πως\nβελτιώνεται η απόδοση του συστήματος με την εφαρμογή αυτού του\nπροσαρμοζόμενου μοντέλου εξισορρόπησης φορτίου όταν ο αριθμός των ενεργών\nστιγμιότυπων διπλασιάζεται. Τέλος θα πρέπει να σημειωθεί πως όλη η εργασία \nΕξισορρόπηση φόρτου σε ένα web service χρησιμοποιώντας εικονικές μηχανές σε περιβάλλον Docker Σελίδα 12\nείναι χτισμένη στο Docker Swarm δηλαδή σε μια γηγενή εφαρμογή υπολογιστικού\nνέφους, που επιτρέπει την εύκολη μετάβαση του σ’ ένα τέτοιο περιβάλλον. 	In order to achieve scalability and high availability of services offered by web servers,\nan effective load balancing policy is required. The aforementioned policy could be\nimplemented as a result of continuous monitoring of an ad-hoc chosen metric. This\nmetric formulated the load change that each web server can handle. In addition, the\nusage of the monitored metric was examined as an Auto-Scaling Load Balancing\nactivation mechanism. Eventually, the review was focus on an important class of\nmetrics related with http requests. Τo this end, the registration and processing of metric\nvalues is achieved by using an open source time series database called Prometheus.\nWithin the above context, a set of stress test scenarios have been implemented.\na) A nginx web server cluster load balancing based on Round Robin (RR) and Least\nConnections (LC) algorithms without Auto-Scaling capability.\nb) A nginx web server cluster load balancing based on Round Robin (RR) and Least\nConnections (LC) algorithms with fully Automated Scaling capability.\nFurthermore, a dual, cross-cutting dimension was taken in to account based on whether\nthe cluster operated under conditions of high imbalance. The automated instance\nscaling was achieved by using a Continuous Integration tool such as Jenkins along with\na specially adapted HAproxy version. The experimental results showed an improved\nperformance when the auto-scaling load balancing capability is applied. In fact, when\nthe number of instances is doubled, the lack of performance under stress is\ncompensated.\nFinally, it should be noted that the whole system was build on one node Docker Swarm.\nThe latter is a cloud native application and therefore it allows a smooth migration in\nsuch an environment when a business case arises.	επεκτασιμότητα, εξισορρόπηση, κλιμάκωση	nginx, HAproxy Docker, load balancer	12	Ελληνικά	0	3	0	0	0	f	\N	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	Ένα σύντομο σχόλιο για δοκιμή.	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Κωνσταντίνος Τσερπές	media-1674921639040-290671686.pdf	thesis-baliotis-2018.pdf	2022-12-31 14:21:06	\N
7	Ψηφιακός Μετασχηματισμός Μικρομεσαίων επιχειρήσεων	Ψηφιακός Μετασχηματισμός Μικρομεσαίων επιχειρήσεων	Title Digital Transformation of Small and Medium Enterprises	\N	Σκοπός της παρούσας διπλωματικής εργασίας είναι η ανάδειξη των βασικότερων προεκτάσεων του ψηφιακού μετασχηματισμού των ελληνικών επιχειρήσεων με ιδιαίτερη έμφαση στις μικρομεσαίες επιχειρήσεις. Στην εποχή της βιομηχανίας 4.0, οι επιχειρήσεις καλούνται να δραστηριοποιηθούν σε ένα ραγδαία μεταβαλλόμενο περιβάλλον με τις αναδυόμενες τεχνολογίες να διαταράσσουν συνεχώς όλες τις δομές του οικονομικού και του κοινωνικού ιστού. Ο ψηφιακός μετασχηματισμός των επιχειρήσεων θεωρείται επιτακτική ανάγκη και συνίσταται στη διείσδυση των ψηφιακών τεχνολογιών στις επιχειρήσεις και τον αντίκτυπό τους στην κοινωνία. Στο πλαίσιο της εργασίας πραγματοποιήθηκε έρευνα με χρήση ερωτηματολογίου. Μέσω της έρευνας αναλύονται ζητήματα που αφορούν, μεταξύ άλλων, την ψηφιακή ωριμότητα των επιχειρήσεων και το βαθμό κατανόησης των νέων τεχνολογικών εφαρμογών από τις μικρομεσαίες επιχειρήσεις. Επίσης αναδεικνύονται ο βαθμός ενσωμάτωσης νέων ψηφιακών λύσεων, το επίπεδο αξιοποίησης των δυνατοτήτων που προσφέρει το ηλεκτρονικό εμπόριο και η διαχείριση των ηλεκτρονικών προμηθειών καθώς και το επίπεδο επενδύσεων στην κατεύθυνση του ψηφιακού μετασχηματισμού. Τέλος εξετάζονται διαστάσεις σχετικά με τις αναδυόμενες ψηφιακές διαφοροποιήσεις και ανισότητες.	The aim of this dissertation is to highlight the main extensions of the digital transformation of Greek companies with special emphasis on small and medium enterprises. In the age of industry 4.0, companies are called upon to operate in a rapidly changing environment with emerging technologies constantly disrupting all structures of the economic and social fabric. Digital business transformation is considered an imperative and consists of the penetration of digital technologies in business and their impact on society. In the context of this research, a survey was conducted using a questionnaire. The research analyzes issues related to, among others, the digital maturity of enterprises and the degree of understanding of new technological applications by small and medium enterprises. The degree of integration of new digital solutions, the level of utilization of the possibilities offered by ecommerce and the management of e-procurement, as well as the level of investments in the direction of digital transformation are also highlighted. Finally, dimensions related to emerging digital differences and inequalities are examined.	ψηφιακός μετασχηματισμός, μικρομεσαίες επιχειρήσεις, αναδυόμενες τεχνολογίες, επιχειρηματικότητα, ψηφιακή ωριμότητα, ηλεκτρονικό εμπόριο, ηλεκτρονικές προμήθειες	digital transformation, small medium enterprises, emerging technologies, entrepreneurship, digital maturity, commerce, procurement	0	Ελληνικά	0	0	0	0	0	t	2021-11-14 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Αγαπητού Χρύσα	\N	\N	2022-12-31 14:21:06	\N
1	Νέες τεχνολογίες πληροφοριακής υποστήριξης στην αγροδιατροφική αλυσίδα. Η περίπτωση της καλλιέργειας ακριβείας	Νέες τεχνολογίες πληροφοριακής υποστήριξης στην αγροδιατροφική αλυσίδα. Η περίπτωση της καλλιέργειας ακριβείας	New information support technologies in the agri-food chain. The case of precision cultivation	\N	Στον σύγχρονο αγρο – διατροφικό τομέα η χρήση ψηφιακών τεχνολογιών οδηγεί σε μια πιο άγρο – οικολογική προσέγγιση την γεωργική παραγωγή. Η γεωργία ακριβείας βελτιστοποιεί την απόδοση των καλλιεργειών με τις ελάχιστες εισροές, οδηγώντας στην μεγιστοποίηση του κέρδους και μειώνοντας τις επιδράσεις στο περιβάλλον. Όμως, κάποια προβλήματα δεν λείπουν. Για την εφαρμογή της είναι απαραίτητες σχετικά υψηλές σε κόστος επενδύσεις. Επίσης, είναι απαραίτητες ακριβές μετρήσεις και αναλύσεις. Τα ανωτέρω θα χρηματοδοτηθούν τόσο από πόρους της Ευρωπαϊκής Ένωσης και των Κρατών – Μελών, όσο και από τον ιδιωτικό τομέα.	In the modern agri - food sector the use of digital technologies leads the agricultural production to a more agro - ecological approach. Precision farming optimizes crop yields with minimal inputs, maximizing profits and reducing environmental impacts. But some problems are not missing. For its implementation, relatively high cost investments are necessary. Accurate measurements and analysies are also needed. The above will be financed both by resources of the European Union and the Member States, and by the private sector.	 ασύρματα δίκτυα αισθητήρων, Διαδίκτυο των Πραγμάτων	unmanned aerial vehicles, UGV	86	Ελληνικά	0	1	0	21	0	t	2023-01-21 12:05:00.896	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0		8	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Μαλινδρέτος Γεώργιος	media-1674072551457-425168273.pdf	pdf-test.pdf	2022-12-31 14:21:06	\N
5	Εξόρυξη Δεδομένων από Ελληνικά Κείμενα με Στόχο τη Κατηγοριοποίηση με τη Χρήση του Greek BERT	Εξόρυξη Δεδομένων από Ελληνικά Κείμενα με Στόχο τη Κατηγοριοποίηση με τη Χρήση του Greek BERT	Data Mining from Greek Articles for Text Classification with Greek Bert	\N	Η κατηγοριοποίηση κειμένων είναι μια σημαντική μελέτη στον τομέα της εξαγωγής πληροφορίας από κείμενα (Text Mining), έχοντας ένα μεγάλο εύρος εφαρμογής. Τα τελευταία χρόνια, μέσω της εξέλιξης αλγορίθμων νευρωνικών δικτύων (Neural Networks), έχουν αναπτυχθεί πολλές τεχνικές εξαγωγής γλωσσικών μοντέλων από μεγάλες συλλογές κειμένων γνωστά ως προ-εκπαιδευμένα γλωσσικά μοντέλα (Pre-Trained Language Models), οι οποίες βρίσκουν εφαρμογή σε ποικίλες εργασίες επεξεργασίας φυσικής γλώσσας (Natural Language Processing - NLP). Την συγκεκριμένη χρονική στιγμή, η βέλτιστη πρακτική για ταξινόμηση κειμένων είναι η εφαρμογή των Pre-Trained Language Models με την κατάλληλη προσαρμογή τους (Fine-Tuning). Στόχος της παρούσας διπλωματικής εργασίας ήταν η δημιουργία ενός κατηγοριοποιητή κειμένων για εφαρμογή πάνω σε Ελληνικά άρθρα, κείμενα και ειδήσεις. Οι βασικοί πυλώνες αυτού του εγχειρήματος είναι το καινοτόμο μοντέλο BERT της Google και η εξελληνισμένη του εκδοχή (GreekBERT). Ο απώτερος σκοπός της συγκεκριμένης διπλωματικής ήταν, με την χρήση της ήδη υπάρχουσας γνώσης και τεχνογνωσίας στον τομέα της Επεξεργασίας Φυσικής Γλώσσας, η ανάπτυξη και η εκπαίδευση ενός μοντέλου κατηγοριοποίησης Ελληνικών ειδήσεων που μέσω συνεχής εκπαίδευσης και αλληλεπίδρασης με τους χρήστες θα καταφέρει να επιτύχει μέγιστα αποτελέσματα. Αρχικά γίνεται αναφορά στο θεωρητικό κομμάτι των τεχνικών του text mining, των μοντέλων κατηγοριοποίησης και του μοντέλου BERT. Στη συνέχεια και αφού έχει γίνει η κατανόηση του μοντέλου BERT παρουσιάζονται τα βασικά σημεία του μοντέλου που αναπτύχθηκε και εκπαιδεύτηκε για τον Κατηγοριοποιητή Ελληνικών Κειμένων με τη προγραμματιστική γλώσσα python καθώς και της web σελίδας με τη χρήση της προγραμματιστικής γλώσσας HTML. Κατά την ολοκλήρωση της εργασίας παρουσιάζονται τα αποτελέσματα της ακρίβειας και της αποτελεσματικότητας των κατηγοριοποιήσεων του μοντέλου (accuracy) κατά την πρώτη εκπαίδευση και χρήση , με το dataset των 4000 κειμένων που είχαμε στην διάθεσή μας, καθώς και ο έλεγχος της ακρίβειας και της αποτελεσματικότητας των κατηγοριοποιήσεων μετά από αρκετές επανεκπαιδεύσεις και χρήσης της εφαρμογής από πραγματικούς χρήστες.	The categorization of texts is an important study in the field of text mining, having a wide range of application. In recent years, through the evolution of Neural Networks, many techniques have been developed to extract language models from large collections of texts known as PreTrained Language Models, which find application in a variety of Natural Language Processing (NLP) processes. At this point in time, the best practice for text classification is the application of Pre-Trained Language Models with their proper adaptation (Fine-Tuning). The aim of this diploma thesis was to create a categorizer of texts for application on Greek articles, texts and news. The main pillars of this project are Google's innovative BERT model and its Hellenized version (GreekBERT). The ultimate goal of this diploma thesis was, with the use of the already existing knowledge and know-how in the field of Natural Language Processing, the development and education of a model of categorization of Greek news that through continuous training and interaction with users will manage to achieve maximum results. Initially, reference is made to the theoretical part of the techniques of text mining, the categorization models and the BERT model. Then, after the understanding of the BERT model, the main points of the model developed and trained for the Greek Text Categorizer with the programming python language as well as the web page with the use of html programming language are presented. During the completion of the project, the results of the accuracy and effectiveness of the classifications of the model (accuracy) during the first training and use are presented, with the dataset of 4000 texts that we had at our disposal, as well as the control of the accuracy and effectiveness of the categorizations after several retrainings and use of the application by real users.	Εξόρυξη Δεδομένων, Εξόρυξη Κειμένων, Αυτόματη Κατηγοριοποίηση, Μηχανική Μάθηση	Data Mining, Greek Bert, Text Mining, NLP	0	Ελληνικά	0	0	0	0	0	t	2022-08-03 13:51:14.05	Αναφορά Δημιουργού – Μη Εμπορική Χρήση – Όχι Παράγωγα Έργα 4.0	\N	4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Βαρλάμης Ηρακλής	\N	\N	2022-12-31 14:21:06	\N
6	Αποθετήριο πακέτων λογισμικού διανομών Linux	Αποθετήριο πακέτων λογισμικού διανομών Linux	Software repository aggregator for Linux distributions	\N	Το όλο έργο αποτελείται από 3 ξεχωριστά μέρη: το μηχανισμό (python scripts εντός Docker containers) που εξάγει τις πληροφορίες, το back-end (Django REST Framework) που είναι υπεύθυνο για την εισαγωγή των εισαχθέντων χαρακτηριστικών στη βάση δεδομένων, την αναζήτηση σε αυτή με βάση συγκεκριμένα κριτήρια, καθώς και για την παροχή των αντίστοιχων αποτελεσμάτων στο front-end. Το τελευταίο κομμάτι αποτελεί το front-end (React.js), του οποίου ο ρόλος είναι να λαμβάνει τα αποτελέσματα αναζήτησης που παρέχονται από το backend και να τα παρουσιάζει με έναν καλά δομημένο και διαισθητικό τρόπο.	The whole project consists of 3 distinguished parts: the mechanism (python scripts within Docker containers) which extracts the information, the back-end (Django REST framework) which is responsible for populating the database with the extracted attributes, querying it based on specific search criteria and feeding the front-end with the corresponding results. The last part is the front-end (React.js), whose role is to consume the queried results provided by the back-end and present them in a well structured and intuitive way.	Διανομές, πακέτα λογισμικού, αποθετήριο, συλλογή πληροφοριών, διαδικτυακή εφαρμογή	 Linux distributions, software packages, repository, information collection, web application	12	Ελληνικά	9	3	1	2	11	t	2022-12-28 10:35:47.984	Αναφορά Δημιουργού - Παρόμοια Διανομή 4.0		4	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	Ανάργυρος Τσαδήμας	\N	\N	2022-12-31 14:21:06	\N
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
4	itp21101@hua.gr	itp21101	ΑΠΟΣΤΟΛΟΣ	ΑΓΓΕΛΗΣ	Απόστολος	Apostolos	Αγγέλης	Angelis	Δημήτριος	Dimitrios	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	\N	f	t	f	2023-02-04 09:31:06.822	2022-11-19 12:20:23.21
5	ifigenia@hua.gr	ifigenia	ΙΦΙΓΕΝΕΙΑ	ΒΑΡΔΑΚΩΣΤΑ	\N	\N	\N	\N	\N	\N	Βιβλιοθήκη και Κέντρο Πληροφόρησης	Bιβλιοθηκάριος	\N	f	t	f	2023-02-04 09:31:34.345	2022-12-20 18:48:36.879
3	mitsi@hua.gr	mitsi	ΜΗΤΣΗ	ΛΟΡΕΤΑ	\N	\N	\N	\N	\N	\N	Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής	Διοικητική Υπάλληλος	\N	f	t	f	2023-02-04 09:33:46.006	2022-12-24 17:37:58.608
2	admin@hua.gr	admin	Διαχειριστής	συστήματος	\N	\N	\N	\N	\N	\N	Πληροφορικής και Τηλεματικής	Προσωπικό διαχείρισης	\N	f	t	f	2023-02-04 09:35:26.373	2022-11-29 19:21:01.346
8	itp21100@hua.gr	itp21100	ΒΑΣΙΛΗΣ	ΗΛΙΟΥ	Βασίλης	Vassilis	Ηλιού	Iliou	Ευάγγελος	Evangelos	Πληροφορικής και Τηλεματικής	Μεταπτυχιακός Φοιτητής	\N	f	t	f	2023-01-29 07:33:24.05	2022-11-19 12:20:35.849
7	itp22044@hua.gr	itp22044	ΔΗΜΗΤΡΙΟΣ	ΠΑΠΑΓΕΩΡΓΙΟΥ	Δημήτριος	Dimitrios	Παπαγεωργίου	Papageorgiou	Αθανάσιος	\N	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής	\N	f	t	f	2023-01-29 08:21:39.658	2022-12-31 13:57:01.158
9	itp22039@hua.gr	itp22039	ΕΥΑΓΓΕΛΟΣ	ΓΕΩΡΓΙΟΥ	\N	\N	\N	\N	\N	\N	Πληροφορικής και Τηλεματικής	Προπτυχιακός Φοιτητής	\N	f	t	f	2023-01-29 08:22:01.597	2023-01-18 19:22:08.29
6	daneli@hua.gr	daneli	ΦΩΤΕΙΝΗ	ΔΕΝΕΛΗ	\N	\N	\N	\N	\N	\N	Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής	Διοικητική Υπάλληλος	\N	f	t	f	2023-01-29 08:24:43.832	2022-12-27 11:25:46.981
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

SELECT pg_catalog.setval('public."Deposit_id_seq"', 78, true);


--
-- Name: Permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: user01
--

SELECT pg_catalog.setval('public."Permission_id_seq"', 14, true);


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
-- Name: Deposit tr_deposit_confirmed; Type: TRIGGER; Schema: public; Owner: user01
--

CREATE TRIGGER tr_deposit_confirmed AFTER UPDATE OF confirmed ON public."Deposit" FOR EACH ROW WHEN ((new.confirmed IS TRUE)) EXECUTE FUNCTION public.notifyconfirmed();


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

