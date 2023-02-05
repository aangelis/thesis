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
