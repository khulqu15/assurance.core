--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2026-04-12 11:34:02

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 5061 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 210441)
-- Name: claim_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_attachments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    claim_id uuid,
    original_file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    file_mime_type character varying(100) NOT NULL,
    file_size bigint NOT NULL,
    uploaded_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    stored_file_name character varying(255) NOT NULL,
    file_extension character varying(20) NOT NULL,
    storage_disk character varying(50) DEFAULT 'local'::character varying NOT NULL
);


ALTER TABLE public.claim_attachments OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 210450)
-- Name: claim_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_comments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    claim_id uuid,
    comment_type character varying(30) NOT NULL,
    comment_text text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.claim_comments OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 210432)
-- Name: claim_status_histories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_status_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    claim_id uuid,
    from_status_id smallint,
    to_status_id smallint NOT NULL,
    action_by uuid NOT NULL,
    action_role character varying(50) NOT NULL,
    note text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.claim_status_histories OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 210412)
-- Name: claim_statuses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claim_statuses (
    id smallint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    sequence smallint NOT NULL
);


ALTER TABLE public.claim_statuses OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 210411)
-- Name: claim_statuses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.claim_statuses_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.claim_statuses_id_seq OWNER TO postgres;

--
-- TOC entry 5062 (class 0 OID 0)
-- Dependencies: 224
-- Name: claim_statuses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.claim_statuses_id_seq OWNED BY public.claim_statuses.id;


--
-- TOC entry 226 (class 1259 OID 210420)
-- Name: claims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.claims (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    claim_number character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    claim_amount numeric(18,2) NOT NULL,
    incident_date date NOT NULL,
    current_status_id smallint NOT NULL,
    submitted_at timestamp with time zone,
    reviewed_at timestamp with time zone,
    decided_at timestamp with time zone,
    reviewed_by uuid,
    decided_by uuid,
    rejection_reason text,
    version integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.claims OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 210459)
-- Name: idempotency_keys; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.idempotency_keys (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    key character varying(255) NOT NULL,
    actor_id uuid NOT NULL,
    resource_type character varying(100) NOT NULL,
    resource_id uuid,
    request_hash text NOT NULL,
    response_code integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    expired_at timestamp with time zone NOT NULL
);


ALTER TABLE public.idempotency_keys OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 210372)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 210371)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5063 (class 0 OID 0)
-- Dependencies: 218
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 222 (class 1259 OID 210394)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id smallint NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 210393)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- TOC entry 5064 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 223 (class 1259 OID 210402)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    role_id smallint,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 210651)
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    email_notification boolean DEFAULT true NOT NULL,
    push_notification boolean DEFAULT false NOT NULL,
    claim_status_notification boolean DEFAULT true NOT NULL,
    approval_decision_notification boolean DEFAULT true NOT NULL,
    weekly_summary boolean DEFAULT true NOT NULL,
    theme character varying(20) DEFAULT 'light'::character varying NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    default_page character varying(30) DEFAULT 'dashboard'::character varying NOT NULL,
    rows_per_page integer DEFAULT 25 NOT NULL,
    remember_session boolean DEFAULT true NOT NULL,
    two_factor_auth boolean DEFAULT false NOT NULL,
    login_alert boolean DEFAULT true NOT NULL,
    auto_logout boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 210629)
-- Name: user_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_tokens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    token text NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_tokens OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 210380)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    full_name character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    email_verified_at timestamp with time zone,
    phone_number character varying(20),
    nik character varying(30),
    birth_place character varying(100),
    birth_date date,
    address text,
    city character varying(100),
    province character varying(100),
    postal_code character varying(10),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4807 (class 2604 OID 210415)
-- Name: claim_statuses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_statuses ALTER COLUMN id SET DEFAULT nextval('public.claim_statuses_id_seq'::regclass);


--
-- TOC entry 4799 (class 2604 OID 210375)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 210397)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 5051 (class 0 OID 210441)
-- Dependencies: 228
-- Data for Name: claim_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.claim_attachments VALUES ('450a6207-bda5-44eb-b2d5-7cbe352dae4a', 'c0994d28-26a2-4a51-a476-3fa896f918f9', 'test.pdf', '/uploads/claims/c0994d28-26a2-4a51-a476-3fa896f918f9/1775943553116-729486195-demo.pdf', 'application/pdf', 106292, '8ee65793-ed09-4a8c-8590-74ded48e8069', '2026-04-12 04:39:13.146936', '1775943553116-729486195-demo.pdf', 'pdf', 'local');
INSERT INTO public.claim_attachments VALUES ('d7876678-319b-4226-b832-6f198c244dd0', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 'demo.pdf', '/uploads/claims/41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28/1775945360688-241287607-demo.pdf', 'application/pdf', 106292, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '2026-04-12 05:09:20.725379', '1775945360688-241287607-demo.pdf', 'pdf', 'local');
INSERT INTO public.claim_attachments VALUES ('b2ee7106-745f-44a6-ab0e-d33d470d8b7f', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', '03-2026_Research_Application.pdf', '/uploads/claims/3546ccd6-91ef-4ccb-b181-3454d75bcd57/1775959417120-181508857-03-2026_research_application.pdf', 'application/pdf', 603317, '7167ba22-26e3-4e67-bca9-223158a3ef94', '2026-04-12 09:03:37.154817', '1775959417120-181508857-03-2026_research_application.pdf', 'pdf', 'local');
INSERT INTO public.claim_attachments VALUES ('4085a3aa-c887-4274-a2b4-d86823173ad8', '8e384de8-9250-42b4-abdf-4260a1c09ec3', '03-2026_Research_Application.pdf', '/uploads/claims/8e384de8-9250-42b4-abdf-4260a1c09ec3/1775967556675-940275147-03-2026_research_application.pdf', 'application/pdf', 603317, '7167ba22-26e3-4e67-bca9-223158a3ef94', '2026-04-12 11:19:16.717025', '1775967556675-940275147-03-2026_research_application.pdf', 'pdf', 'local');


--
-- TOC entry 5052 (class 0 OID 210450)
-- Dependencies: 229
-- Data for Name: claim_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.claim_comments VALUES ('30639534-90e0-4919-b756-a0df5f5216b3', 'c0994d28-26a2-4a51-a476-3fa896f918f9', 'user_note', 'mohon dibantu', '8ee65793-ed09-4a8c-8590-74ded48e8069', '2026-04-12 03:45:57.512035');
INSERT INTO public.claim_comments VALUES ('5d649d53-6fca-485b-8a57-0aeb70980f80', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 'user_note', 'mohon dibantu', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '2026-04-12 05:10:27.638436');
INSERT INTO public.claim_comments VALUES ('7dc2d4dc-ec76-4358-9b06-f6a374a37687', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', 'user_note', 'saya butuh ini', '7167ba22-26e3-4e67-bca9-223158a3ef94', '2026-04-12 09:03:30.743546');
INSERT INTO public.claim_comments VALUES ('5e3abed7-62a3-4c73-b722-b2a41b602e4d', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', 'approval_note', 'gakkk malas', '05881df0-153f-426a-b0bb-0afbe516dd63', '2026-04-12 09:06:02.74551');
INSERT INTO public.claim_comments VALUES ('32bb6321-6dc2-4f3f-bea8-6aeb3369f8f0', '8e384de8-9250-42b4-abdf-4260a1c09ec3', 'user_note', 'Mohon di approve', '7167ba22-26e3-4e67-bca9-223158a3ef94', '2026-04-12 11:19:25.964143');


--
-- TOC entry 5050 (class 0 OID 210432)
-- Dependencies: 227
-- Data for Name: claim_status_histories; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.claim_status_histories VALUES ('9483a0ed-b14f-4762-a6a2-94fe8b17f020', '7b1e5472-a56f-4e20-a40e-9d7239e4275e', NULL, 1, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim created as draft', '2026-04-12 01:01:13.804751');
INSERT INTO public.claim_status_histories VALUES ('155fb419-2ff1-4ab4-956c-7beab5b02ac6', '03806cd9-9486-47f0-9b7c-51a3fb015c32', NULL, 1, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim created as draft', '2026-04-12 01:04:18.771493');
INSERT INTO public.claim_status_histories VALUES ('68b5fdbd-77d0-4f4e-a051-2dc8554aabf6', '2b8223d8-cb08-4137-854d-5575cc9fcfc3', NULL, 1, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim created as draft', '2026-04-12 02:26:40.584719');
INSERT INTO public.claim_status_histories VALUES ('52cee41f-a125-41ec-8ef4-c4543701c56c', '8f43866c-2aa4-4ec5-a037-b33f061182a3', NULL, 1, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim created as draft', '2026-04-12 02:26:40.593563');
INSERT INTO public.claim_status_histories VALUES ('4b32405d-fdbc-4e56-bb75-cc89ffd035b1', '8f43866c-2aa4-4ec5-a037-b33f061182a3', 1, 2, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim submitted', '2026-04-12 02:26:40.59574');
INSERT INTO public.claim_status_histories VALUES ('68cc03f5-0ec3-4b44-b81e-b9dac7aa081a', '8f43866c-2aa4-4ec5-a037-b33f061182a3', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.597763');
INSERT INTO public.claim_status_histories VALUES ('0db1cbc6-5507-4cf3-88c6-2742108ab7c1', '8f43866c-2aa4-4ec5-a037-b33f061182a3', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 02:26:40.599842');
INSERT INTO public.claim_status_histories VALUES ('043efee0-3df7-4723-859c-c36be501b6ac', 'ed5aa7b2-c9f8-4b9c-a350-106fd6b15aef', NULL, 1, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim created as draft', '2026-04-12 02:26:40.605774');
INSERT INTO public.claim_status_histories VALUES ('da5de048-e3c5-4114-a7d3-a3a9e070c249', 'ed5aa7b2-c9f8-4b9c-a350-106fd6b15aef', 1, 2, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim submitted', '2026-04-12 02:26:40.607912');
INSERT INTO public.claim_status_histories VALUES ('f3354715-bfb1-4867-9a96-987ad15024c7', 'ed5aa7b2-c9f8-4b9c-a350-106fd6b15aef', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.61005');
INSERT INTO public.claim_status_histories VALUES ('ec06cbb9-fc04-431a-9fea-1592fc2b6562', 'ed5aa7b2-c9f8-4b9c-a350-106fd6b15aef', 3, 5, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim rejected', '2026-04-12 02:26:40.612012');
INSERT INTO public.claim_status_histories VALUES ('67357683-7448-46d7-bd77-76953215b65c', 'fa8cc130-1fe6-4855-8bdc-d9015121c932', NULL, 1, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim created as draft', '2026-04-12 02:26:40.618242');
INSERT INTO public.claim_status_histories VALUES ('94502af3-f3cc-4b2b-a9ea-530224d3c59c', 'fa8cc130-1fe6-4855-8bdc-d9015121c932', 1, 2, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim submitted', '2026-04-12 02:26:40.62031');
INSERT INTO public.claim_status_histories VALUES ('9c80e49f-f820-4f5f-82df-a7ef88f5510a', '718b3734-8ecc-411f-b253-fde6a0dd7c1f', NULL, 1, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim created as draft', '2026-04-12 02:26:40.626738');
INSERT INTO public.claim_status_histories VALUES ('63ddb2a0-4263-413c-b16f-ff68578fa3ea', '718b3734-8ecc-411f-b253-fde6a0dd7c1f', 1, 2, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim submitted', '2026-04-12 02:26:40.628948');
INSERT INTO public.claim_status_histories VALUES ('0df0e875-3220-4cef-8c14-21407f4660f5', '718b3734-8ecc-411f-b253-fde6a0dd7c1f', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.631495');
INSERT INTO public.claim_status_histories VALUES ('25ccacbd-4813-4921-8c4a-43a568a3c19b', 'acf607a3-14b1-4194-ae6e-2b03cca50db6', NULL, 1, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim created as draft', '2026-04-12 02:26:40.637924');
INSERT INTO public.claim_status_histories VALUES ('d0e8b874-cc92-4b1b-afe4-1357fa32550e', 'acf607a3-14b1-4194-ae6e-2b03cca50db6', 1, 2, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim submitted', '2026-04-12 02:26:40.640025');
INSERT INTO public.claim_status_histories VALUES ('292ed0e4-d866-4a6e-bc68-102d7b903a0b', 'acf607a3-14b1-4194-ae6e-2b03cca50db6', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.641753');
INSERT INTO public.claim_status_histories VALUES ('ae72db1d-5d00-4aa3-8185-054ca67279d3', 'acf607a3-14b1-4194-ae6e-2b03cca50db6', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 02:26:40.643867');
INSERT INTO public.claim_status_histories VALUES ('f7f4dcb1-7dbb-4564-a2ac-db0c7c8f3072', '424159ac-027d-449e-86f4-19970e567575', NULL, 1, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim created as draft', '2026-04-12 02:26:40.649813');
INSERT INTO public.claim_status_histories VALUES ('7304f6b3-56c2-4653-980d-208ed2f03ffb', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', NULL, 1, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim created as draft', '2026-04-12 02:26:40.656681');
INSERT INTO public.claim_status_histories VALUES ('4ccb491f-a890-41cc-bca1-226648ab3553', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 1, 2, 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'user', 'Claim submitted', '2026-04-12 02:26:40.658874');
INSERT INTO public.claim_status_histories VALUES ('d912202a-2ca7-463f-9817-b206fb2e9807', '2cec2ca8-9af9-4e45-b0a7-21def9a96290', NULL, 1, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim created as draft', '2026-04-12 02:26:40.667402');
INSERT INTO public.claim_status_histories VALUES ('13612d1d-9b24-4a9d-afe9-f0e39ccd1c6d', '2cec2ca8-9af9-4e45-b0a7-21def9a96290', 1, 2, '551ca998-4f45-4889-adb8-d3de4cfe9308', 'user', 'Claim submitted', '2026-04-12 02:26:40.6697');
INSERT INTO public.claim_status_histories VALUES ('d1f1e7f4-e28c-4f4e-9e18-e5f48106d237', '2cec2ca8-9af9-4e45-b0a7-21def9a96290', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.671833');
INSERT INTO public.claim_status_histories VALUES ('e22ee275-cb81-4202-ad17-cd012fb1c6f9', 'eaefb01b-c8d9-4c9d-a662-fe36394ca01a', NULL, 1, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim created as draft', '2026-04-12 02:26:40.678041');
INSERT INTO public.claim_status_histories VALUES ('9120cecc-ca72-4029-8258-08df3eecaad6', 'eaefb01b-c8d9-4c9d-a662-fe36394ca01a', 1, 2, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim submitted', '2026-04-12 02:26:40.680156');
INSERT INTO public.claim_status_histories VALUES ('86a7cced-95aa-4f62-b658-d1ae8babbe4b', 'eaefb01b-c8d9-4c9d-a662-fe36394ca01a', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 02:26:40.682096');
INSERT INTO public.claim_status_histories VALUES ('0c0cd2f0-6984-477f-b426-878989895e74', 'eaefb01b-c8d9-4c9d-a662-fe36394ca01a', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 02:26:40.684504');
INSERT INTO public.claim_status_histories VALUES ('92007468-a103-41af-8fc5-32efd74b27a9', '1a6ccc55-f780-4dee-ba6e-6b7ef2ed244c', NULL, 1, '8ee65793-ed09-4a8c-8590-74ded48e8069', 'user', 'Claim created as draft', '2026-04-12 03:29:04.153573');
INSERT INTO public.claim_status_histories VALUES ('e455f66d-529a-47bc-8cc0-a51bf31e304b', 'e0b1e672-5612-41f2-9cb0-65f8e3e4b5a8', NULL, 1, '8ee65793-ed09-4a8c-8590-74ded48e8069', 'user', 'Claim created as draft', '2026-04-12 03:30:03.734891');
INSERT INTO public.claim_status_histories VALUES ('61baea64-14b4-436d-beea-9af533d87e78', 'c0994d28-26a2-4a51-a476-3fa896f918f9', NULL, 1, '8ee65793-ed09-4a8c-8590-74ded48e8069', 'user', 'Claim created as draft', '2026-04-12 03:30:21.629883');
INSERT INTO public.claim_status_histories VALUES ('ef3dee11-4531-4e52-8be5-2e76b5a0479f', 'c0994d28-26a2-4a51-a476-3fa896f918f9', 1, 2, '8ee65793-ed09-4a8c-8590-74ded48e8069', 'user', 'Submit claim after completing all required fields', '2026-04-12 03:40:08.410217');
INSERT INTO public.claim_status_histories VALUES ('dfe42135-9ade-4ab6-882b-9256966a4b31', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 05:04:40.037564');
INSERT INTO public.claim_status_histories VALUES ('1c19b6f5-4d06-4e70-9a5e-6f57f0c57591', '41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 3, 5, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim rejected', '2026-04-12 05:18:50.912002');
INSERT INTO public.claim_status_histories VALUES ('387ae14c-2dec-4ee0-a6b7-5fd450b9800b', 'abb3b722-4085-46d4-b9bb-c5d4f0bc2cd5', NULL, 1, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Claim created as draft', '2026-04-12 05:21:44.446771');
INSERT INTO public.claim_status_histories VALUES ('41a048bf-3554-4f7e-8630-32f1d8939253', 'abb3b722-4085-46d4-b9bb-c5d4f0bc2cd5', 1, 2, 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'user', 'Submit claim after completing all required fields', '2026-04-12 05:21:55.017418');
INSERT INTO public.claim_status_histories VALUES ('9e4b5a28-64d6-45a9-a225-d66ab79b961f', 'abb3b722-4085-46d4-b9bb-c5d4f0bc2cd5', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 05:22:27.956319');
INSERT INTO public.claim_status_histories VALUES ('0c716784-d180-4b74-a345-f5faffe3bb6f', 'abb3b722-4085-46d4-b9bb-c5d4f0bc2cd5', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 05:22:58.109931');
INSERT INTO public.claim_status_histories VALUES ('afc00124-c037-4c8c-bd6b-651493c268f1', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', NULL, 1, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim created as draft', '2026-04-12 09:03:17.745549');
INSERT INTO public.claim_status_histories VALUES ('8d3551a3-d19c-41f1-889d-62e1c1bc3095', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', 1, 2, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'please review and approve', '2026-04-12 09:03:57.259763');
INSERT INTO public.claim_status_histories VALUES ('d2b185db-505f-48ca-8986-c2e8bf8c51cd', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'yes oke', '2026-04-12 09:05:08.462601');
INSERT INTO public.claim_status_histories VALUES ('d65f5471-425d-40f0-ae95-db3e4e6cc6ec', 'c0994d28-26a2-4a51-a476-3fa896f918f9', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Claim reviewed', '2026-04-12 09:05:33.740836');
INSERT INTO public.claim_status_histories VALUES ('6f2ad4f4-1927-4135-9cce-aab08d33d66d', '3546ccd6-91ef-4ccb-b181-3454d75bcd57', 3, 5, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'malas', '2026-04-12 09:06:17.881811');
INSERT INTO public.claim_status_histories VALUES ('a6e73f46-bdf8-45f5-a14c-fa834cb2a020', 'c0994d28-26a2-4a51-a476-3fa896f918f9', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 09:06:25.885525');
INSERT INTO public.claim_status_histories VALUES ('c84960a3-89d9-44d9-b4bc-e7becaab6afb', '2cec2ca8-9af9-4e45-b0a7-21def9a96290', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim approved', '2026-04-12 09:06:33.022058');
INSERT INTO public.claim_status_histories VALUES ('26c09cea-1ef1-4c66-a9c0-2d61c367e6ac', '8e384de8-9250-42b4-abdf-4260a1c09ec3', NULL, 1, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim created as draft', '2026-04-12 11:18:57.960454');
INSERT INTO public.claim_status_histories VALUES ('92cb4453-347c-49bb-8ea4-baaf98c60bf8', '056c3652-2bc4-4e4b-9959-5db6e5e8cc7c', NULL, 1, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim created as draft', '2026-04-12 11:19:56.51648');
INSERT INTO public.claim_status_histories VALUES ('09394c94-794a-4e12-99ad-b7ca22afd6a4', '8e384de8-9250-42b4-abdf-4260a1c09ec3', 1, 2, '7167ba22-26e3-4e67-bca9-223158a3ef94', 'user', 'Claim submitted', '2026-04-12 11:20:23.672982');
INSERT INTO public.claim_status_histories VALUES ('824428ff-8b40-43b7-93a7-f4c8808d9b0e', '8e384de8-9250-42b4-abdf-4260a1c09ec3', 2, 3, '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'verifier', 'Yes, Oke', '2026-04-12 11:21:31.341757');
INSERT INTO public.claim_status_histories VALUES ('d6ac1c16-e8d9-4a2a-8153-4bca4c25968d', '8e384de8-9250-42b4-abdf-4260a1c09ec3', 3, 4, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'yes', '2026-04-12 11:22:42.043649');
INSERT INTO public.claim_status_histories VALUES ('b287a782-96c3-4cb2-bdad-e8a1649fdc5a', '718b3734-8ecc-411f-b253-fde6a0dd7c1f', 3, 5, '05881df0-153f-426a-b0bb-0afbe516dd63', 'approver', 'Claim rejected', '2026-04-12 11:22:53.565689');


--
-- TOC entry 5048 (class 0 OID 210412)
-- Dependencies: 225
-- Data for Name: claim_statuses; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.claim_statuses VALUES (1, 'draft', 'Draft', 1);
INSERT INTO public.claim_statuses VALUES (2, 'submitted', 'Submitted', 2);
INSERT INTO public.claim_statuses VALUES (3, 'reviewed', 'Reviewed', 3);
INSERT INTO public.claim_statuses VALUES (4, 'approved', 'Approved', 4);
INSERT INTO public.claim_statuses VALUES (5, 'rejected', 'Rejected', 4);


--
-- TOC entry 5049 (class 0 OID 210420)
-- Dependencies: 226
-- Data for Name: claims; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.claims VALUES ('03806cd9-9486-47f0-9b7c-51a3fb015c32', 'CLM-20260412-3515', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'Test Bro', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 1, NULL, NULL, NULL, NULL, NULL, NULL, 4, '2026-04-12 01:04:18.756465', '2026-04-12 09:02:52.788771', '2026-04-12 09:02:52.788771');
INSERT INTO public.claims VALUES ('7b1e5472-a56f-4e20-a40e-9d7239e4275e', 'CLM-20260412-8695', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'Klaim Rawat Jalan', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 1, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-04-12 01:01:13.786544', '2026-04-12 01:04:32.783486', '2026-04-12 01:04:32.783486');
INSERT INTO public.claims VALUES ('2b8223d8-cb08-4137-854d-5575cc9fcfc3', 'CLM-20260410-0001', 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'Klaim Rawat Jalan', 'Klaim Rawat Jalan description', 350000.00, '2026-04-08', 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-04-12 02:26:40.58138', '2026-04-12 02:26:40.58138', NULL);
INSERT INTO public.claims VALUES ('8f43866c-2aa4-4ec5-a037-b33f061182a3', 'CLM-20260410-0002', 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'Klaim Perawatan Gigi', 'Klaim Perawatan Gigi description', 750000.00, '2026-04-07', 4, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-10 17:30:00+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 1, '2026-04-12 02:26:40.58963', '2026-04-12 02:26:40.58963', NULL);
INSERT INTO public.claims VALUES ('ed5aa7b2-c9f8-4b9c-a350-106fd6b15aef', 'CLM-20260410-0003', '551ca998-4f45-4889-adb8-d3de4cfe9308', 'Klaim Kacamata', 'Klaim Kacamata description', 1200000.00, '2026-04-06', 5, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-10 17:30:00+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', 'Exceeded annual benefit limit', 1, '2026-04-12 02:26:40.603405', '2026-04-12 02:26:40.603405', NULL);
INSERT INTO public.claims VALUES ('fa8cc130-1fe6-4855-8bdc-d9015121c932', 'CLM-20260410-0004', 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'Klaim Obat Rawat Jalan', 'Klaim Obat Rawat Jalan description', 280000.00, '2026-04-05', 2, '2026-04-10 16:00:00+07', NULL, NULL, NULL, NULL, NULL, 1, '2026-04-12 02:26:40.615712', '2026-04-12 02:26:40.615712', NULL);
INSERT INTO public.claims VALUES ('acf607a3-14b1-4194-ae6e-2b03cca50db6', 'CLM-20260410-0006', '551ca998-4f45-4889-adb8-d3de4cfe9308', 'Klaim Konsultasi Umum', 'Klaim Konsultasi Umum description', 200000.00, '2026-04-03', 4, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-10 17:30:00+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 1, '2026-04-12 02:26:40.635507', '2026-04-12 02:26:40.635507', NULL);
INSERT INTO public.claims VALUES ('424159ac-027d-449e-86f4-19970e567575', 'CLM-20260410-0007', 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'Klaim Medical Checkup', 'Klaim Medical Checkup description', 950000.00, '2026-04-02', 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-04-12 02:26:40.647351', '2026-04-12 02:26:40.647351', NULL);
INSERT INTO public.claims VALUES ('eaefb01b-c8d9-4c9d-a662-fe36394ca01a', 'CLM-20260410-0010', 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'Klaim Obat Spesialis', 'Klaim Obat Spesialis description', 315000.00, '2026-03-30', 4, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-10 17:30:00+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 1, '2026-04-12 02:26:40.67555', '2026-04-12 02:26:40.67555', NULL);
INSERT INTO public.claims VALUES ('1a6ccc55-f780-4dee-ba6e-6b7ef2ed244c', 'CLM-20260412-7451', '8ee65793-ed09-4a8c-8590-74ded48e8069', 'Klaim Rawat Jalan', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 1, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-04-12 03:29:04.139473', '2026-04-12 03:29:04.139473', NULL);
INSERT INTO public.claims VALUES ('e0b1e672-5612-41f2-9cb0-65f8e3e4b5a8', 'CLM-20260412-2335', '8ee65793-ed09-4a8c-8590-74ded48e8069', 'Klaim Rawat Jalan', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 1, NULL, NULL, NULL, NULL, NULL, NULL, 3, '2026-04-12 03:30:03.721392', '2026-04-12 03:32:01.571918', '2026-04-12 03:32:01.571918');
INSERT INTO public.claims VALUES ('41ab1ce3-f887-46ae-bdb5-1d8b37ef7c28', 'CLM-20260410-0008', 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'Klaim Laboratorium', 'Klaim Laboratorium description', 430000.00, '2026-04-01', 5, '2026-04-10 16:00:00+07', '2026-04-12 05:04:40.057+07', '2026-04-12 05:18:50.938+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', 'direject direject ajaa', 3, '2026-04-12 02:26:40.653613', '2026-04-12 05:18:50.912002', NULL);
INSERT INTO public.claims VALUES ('abb3b722-4085-46d4-b9bb-c5d4f0bc2cd5', 'CLM-20260412-8032', 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 'Klaim Rawat Jalan', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 4, '2026-04-12 05:21:55.048+07', '2026-04-12 05:22:27.98+07', '2026-04-12 05:22:58.133+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 4, '2026-04-12 05:21:44.389488', '2026-04-12 05:22:58.109931', NULL);
INSERT INTO public.claims VALUES ('c0994d28-26a2-4a51-a476-3fa896f918f9', 'CLM-20260412-7084', '8ee65793-ed09-4a8c-8590-74ded48e8069', 'Klaim Rawat Jalan', 'Biaya konsultasi dan obat', 350000.00, '2026-04-08', 4, '2026-04-12 03:40:08.437+07', '2026-04-12 09:05:33.751+07', '2026-04-12 09:06:25.907+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 4, '2026-04-12 03:30:21.614318', '2026-04-12 09:06:25.885525', NULL);
INSERT INTO public.claims VALUES ('2cec2ca8-9af9-4e45-b0a7-21def9a96290', 'CLM-20260410-0009', '551ca998-4f45-4889-adb8-d3de4cfe9308', 'Klaim Fisioterapi', 'Klaim Fisioterapi description', 680000.00, '2026-03-31', 4, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-12 09:06:33.031+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 2, '2026-04-12 02:26:40.664579', '2026-04-12 09:06:33.022058', NULL);
INSERT INTO public.claims VALUES ('3546ccd6-91ef-4ccb-b181-3454d75bcd57', 'CLM-20260412-4427', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'Test Claim', 'afdadadadzsdsdsdwdf', 1220000.00, '2026-04-02', 5, '2026-04-12 09:03:57.281+07', '2026-04-12 09:05:08.474+07', '2026-04-12 09:06:17.898+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', 'malas', 5, '2026-04-12 09:03:17.714392', '2026-04-12 10:16:25.688709', '2026-04-12 10:16:25.688709');
INSERT INTO public.claims VALUES ('056c3652-2bc4-4e4b-9959-5db6e5e8cc7c', 'CLM-20260412-8994', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'Mohammad khuluq Khuluq', 'adaddaadadada', 1220000.00, '2026-04-10', 1, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-04-12 11:19:56.501142', '2026-04-12 11:20:06.897639', '2026-04-12 11:20:06.897639');
INSERT INTO public.claims VALUES ('8e384de8-9250-42b4-abdf-4260a1c09ec3', 'CLM-20260412-7414', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'Kecelakaan Di Jalan', 'Saya jatuh dari motor', 42000000.00, '2026-04-12', 4, '2026-04-12 11:20:23.695+07', '2026-04-12 11:21:31.359+07', '2026-04-12 11:22:42.062+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', NULL, 5, '2026-04-12 11:18:57.910097', '2026-04-12 11:22:42.043649', NULL);
INSERT INTO public.claims VALUES ('718b3734-8ecc-411f-b253-fde6a0dd7c1f', 'CLM-20260410-0005', 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'Klaim Pemeriksaan Mata', 'Klaim Pemeriksaan Mata description', 500000.00, '2026-04-04', 5, '2026-04-10 16:00:00+07', '2026-04-10 17:00:00+07', '2026-04-12 11:22:53.575+07', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', '05881df0-153f-426a-b0bb-0afbe516dd63', 'tidak valid', 2, '2026-04-12 02:26:40.624122', '2026-04-12 11:22:53.565689', NULL);


--
-- TOC entry 5053 (class 0 OID 210459)
-- Dependencies: 230
-- Data for Name: idempotency_keys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5042 (class 0 OID 210372)
-- Dependencies: 219
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.migrations VALUES (1, 1713000000000, 'InitSchema1713000000000');
INSERT INTO public.migrations VALUES (2, 1713000001000, 'AddUserTokensAndEmailVerified1713000001000');
INSERT INTO public.migrations VALUES (3, 1713000002000, 'AddInsuranceUserProfileFields1713000002000');
INSERT INTO public.migrations VALUES (4, 1713000003000, 'EnhanceClaimAttachments1713000003000');
INSERT INTO public.migrations VALUES (5, 1713000004000, 'FixClaimAttachmentsColumns1713000004000');
INSERT INTO public.migrations VALUES (6, 1713000004000, 'CreateUserSettings1713000004000');


--
-- TOC entry 5045 (class 0 OID 210394)
-- Dependencies: 222
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.roles VALUES (1, 'user', 'User');
INSERT INTO public.roles VALUES (2, 'verifier', 'Verifier');
INSERT INTO public.roles VALUES (3, 'approver', 'Approver');
INSERT INTO public.roles VALUES (4, 'superadmin', 'Super Admin');


--
-- TOC entry 5046 (class 0 OID 210402)
-- Dependencies: 223
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_roles VALUES ('fe5fe722-f328-4e4a-b6d7-8e11a77a1676', '7167ba22-26e3-4e67-bca9-223158a3ef94', 1, '2026-04-12 00:54:04.6125');
INSERT INTO public.user_roles VALUES ('ee130d3a-06fe-4e16-840d-415f6c1fae04', 'c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 1, '2026-04-12 02:26:40.539301');
INSERT INTO public.user_roles VALUES ('53889dfe-1e76-444b-baa0-2908d62bdb21', '551ca998-4f45-4889-adb8-d3de4cfe9308', 1, '2026-04-12 02:26:40.547095');
INSERT INTO public.user_roles VALUES ('62957156-4979-4126-aa9d-46dfcc23d3cc', 'cece2cee-bc7a-410e-abb6-8b648893e9a0', 1, '2026-04-12 02:26:40.553847');
INSERT INTO public.user_roles VALUES ('5463b850-3388-4b2d-b03f-8db9391b782c', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 2, '2026-04-12 02:26:40.559648');
INSERT INTO public.user_roles VALUES ('40c0c5e9-3d43-4bb8-ad88-7f39adb9c3d4', '05881df0-153f-426a-b0bb-0afbe516dd63', 3, '2026-04-12 02:26:40.566681');
INSERT INTO public.user_roles VALUES ('c753f824-f5d8-4235-8fb7-8642e2095a40', 'a5a31c1b-dd75-4dc7-a6fc-971b758e8030', 4, '2026-04-12 02:26:40.572129');
INSERT INTO public.user_roles VALUES ('05ae2ff2-c493-42ff-a020-3c54c6ac1811', '8ee65793-ed09-4a8c-8590-74ded48e8069', 1, '2026-04-12 03:13:55.431434');
INSERT INTO public.user_roles VALUES ('c6f29c78-f8b6-4c29-bb1a-68b0afcfa463', '21f3a161-8c22-4a1b-a6b4-17dfb7eeba92', 3, '2026-04-12 05:33:15.024176');
INSERT INTO public.user_roles VALUES ('fec343e2-01ed-4858-aa7c-2afe6fc989b2', '937ff720-d886-4d13-96f5-e8ebf5b8fa92', 1, '2026-04-12 08:22:50.071459');


--
-- TOC entry 5055 (class 0 OID 210651)
-- Dependencies: 232
-- Data for Name: user_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_settings VALUES ('a5f21175-1229-4b11-b64a-3a800e58a01a', 'a5a31c1b-dd75-4dc7-a6fc-971b758e8030', true, false, true, true, true, 'light', 'jp', 'dashboard', 25, true, false, true, true, '2026-04-12 09:47:08.916495+07', '2026-04-12 09:56:17.561823+07');
INSERT INTO public.user_settings VALUES ('94634535-429e-4552-a836-80e84e5b22e1', '7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', true, false, true, true, true, 'light', 'en', 'dashboard', 25, true, false, true, true, '2026-04-12 10:00:13.078269+07', '2026-04-12 10:00:13.078269+07');
INSERT INTO public.user_settings VALUES ('cd649a9a-c0db-47cb-baae-c339b158c50f', '05881df0-153f-426a-b0bb-0afbe516dd63', true, false, true, true, true, 'light', 'en', 'dashboard', 25, true, false, true, true, '2026-04-12 11:23:15.891388+07', '2026-04-12 11:23:15.891388+07');


--
-- TOC entry 5054 (class 0 OID 210629)
-- Dependencies: 231
-- Data for Name: user_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_tokens VALUES ('48085f54-490e-4d6a-b33e-54dfb90e6e0e', '8ee65793-ed09-4a8c-8590-74ded48e8069', 'email_verification', '9f7c6c4e-4925-4a21-bd65-585ae7733294', false, '2026-04-13 03:13:52.137+07', '2026-04-12 03:13:52.138297');
INSERT INTO public.user_tokens VALUES ('38004836-9f24-49e0-8a4c-203824345d5e', '8ee65793-ed09-4a8c-8590-74ded48e8069', 'reset_password', '2d6d091c-5149-4678-bc89-d9716298fee6', true, '2026-04-12 03:52:45.82+07', '2026-04-12 03:22:45.824383');
INSERT INTO public.user_tokens VALUES ('ae54ad46-f6c4-439e-8296-a7b6812adbad', '21f3a161-8c22-4a1b-a6b4-17dfb7eeba92', 'email_verification', '15d018c1-15fa-4e46-b942-b15071decbac', false, '2026-04-13 05:27:15.159+07', '2026-04-12 05:27:15.161581');
INSERT INTO public.user_tokens VALUES ('1fda8161-b1bb-4098-b0f2-601bfbdf5193', '937ff720-d886-4d13-96f5-e8ebf5b8fa92', 'email_verification', '00b7a58d-5588-42db-8d3e-600369c887f5', false, '2026-04-13 08:22:45.741+07', '2026-04-12 08:22:45.746397');
INSERT INTO public.user_tokens VALUES ('bbcf9ec5-609e-41b1-ad05-260ec154ddf2', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'reset_password', 'bc3ec927-1273-43a1-80cd-4b5b3b1d8684', false, '2026-04-12 08:58:05.338+07', '2026-04-12 08:28:05.342656');
INSERT INTO public.user_tokens VALUES ('a8109323-9696-4249-87c6-85666f2cfc94', '7167ba22-26e3-4e67-bca9-223158a3ef94', 'reset_password', '38f32415-ee0f-409c-9ef5-708003b3a888', true, '2026-04-12 11:53:35.989+07', '2026-04-12 11:23:35.991396');


--
-- TOC entry 5043 (class 0 OID 210380)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('c804d1a8-6bb9-4de6-8d6a-da095d1c409c', 'Budi Santoso', 'budi@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.52+07', '081234567890', '3515123456789001', 'Surabaya', '1999-05-12', 'Jl. Melati No. 10 RT 01 RW 02', 'Surabaya', 'Jawa Timur', '60231', '2026-04-12 02:26:40.523515+07', '2026-04-12 02:26:40.523515+07');
INSERT INTO public.users VALUES ('551ca998-4f45-4889-adb8-d3de4cfe9308', 'Citra Rahma', 'citra@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.543+07', '081234567891', '3515123456789002', 'Sidoarjo', '2000-02-20', 'Jl. Anggrek No. 21 RT 03 RW 01', 'Sidoarjo', 'Jawa Timur', '61211', '2026-04-12 02:26:40.544227+07', '2026-04-12 02:26:40.544227+07');
INSERT INTO public.users VALUES ('cece2cee-bc7a-410e-abb6-8b648893e9a0', 'Dewi Anggraini', 'dewi@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.55+07', '081234567892', '3515123456789003', 'Gresik', '1998-08-15', 'Jl. Kenanga No. 5 RT 02 RW 04', 'Gresik', 'Jawa Timur', '61121', '2026-04-12 02:26:40.55125+07', '2026-04-12 02:26:40.55125+07');
INSERT INTO public.users VALUES ('7193f5d8-5e0b-4539-b7aa-fc18c59b0e2c', 'Sinta Verifier', 'verifier@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.557+07', '081234567893', '3515123456789004', 'Malang', '1995-11-03', 'Jl. Mawar No. 8 RT 01 RW 05', 'Malang', 'Jawa Timur', '65111', '2026-04-12 02:26:40.557324+07', '2026-04-12 02:26:40.557324+07');
INSERT INTO public.users VALUES ('05881df0-153f-426a-b0bb-0afbe516dd63', 'Andi Approver', 'approver@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.563+07', '081234567894', '3515123456789005', 'Pasuruan', '1994-01-25', 'Jl. Dahlia No. 18 RT 04 RW 02', 'Pasuruan', 'Jawa Timur', '67112', '2026-04-12 02:26:40.563644+07', '2026-04-12 02:26:40.563644+07');
INSERT INTO public.users VALUES ('a5a31c1b-dd75-4dc7-a6fc-971b758e8030', 'Super Admin', 'superadmin@example.com', '$2b$10$gHQSlggpbw52laCNiK04le4zZ/pVEUFYLDcn5qnbDKWv7tpG.mKfC', true, '2026-04-12 02:26:40.569+07', '081234567899', '3515123456789999', 'Jakarta', '1990-09-09', 'Jl. Sudirman No. 1', 'Jakarta Selatan', 'DKI Jakarta', '12190', '2026-04-12 02:26:40.570154+07', '2026-04-12 02:26:40.570154+07');
INSERT INTO public.users VALUES ('8ee65793-ed09-4a8c-8590-74ded48e8069', 'Sidescript Developer', 'esesdedev@gmail.com', '$2b$10$ShR.o.xcP90IpfMKoj9gfeTC6Y0lUY.2i/wy04V2T.N436FLsyLZ.', true, NULL, '089463832632', '48739362825275', 'Malang', '2002-02-03', 'Jl Remaja', 'Surabaya', 'East Java', '601112', '2026-04-12 03:13:52.068547+07', '2026-04-12 03:23:58.304674+07');
INSERT INTO public.users VALUES ('21f3a161-8c22-4a1b-a6b4-17dfb7eeba92', 'John', 'john@gmail.com', '$2b$10$9t1O8rIvh1tHSPR3X4qfYePFtADDXc.hTsGGIFAwYlH37Zo.yEDCy', false, NULL, NULL, NULL, NULL, NULL, 'Purwosari', 'Pasuruan', NULL, NULL, '2026-04-12 05:27:15.134821+07', '2026-04-12 05:34:57.024969+07');
INSERT INTO public.users VALUES ('937ff720-d886-4d13-96f5-e8ebf5b8fa92', 'Ilham', 'irmaandini16@gmail.com', '$2b$10$AhG3uJI.1y4sqcyCgLPXFuWiBct8Vgm57B7eWEJ/qWKmIYZfHtrIy', true, NULL, '089037393256', '363823527', 'Pasuruan', '2026-04-12', 'Village: Mohammad khuluq Khuluq, District: Surabaya, Province: Mulyosari/Mulyorejo, Country: Indonesia', 'Surabaya', 'Mulyosari/Mulyorejo', '60112', '2026-04-12 08:22:45.50224+07', '2026-04-12 08:22:45.50224+07');
INSERT INTO public.users VALUES ('7167ba22-26e3-4e67-bca9-223158a3ef94', 'Mohammad Khusnul Khuluq', 'khusnul.ninno15@gmail.com', '$2b$10$mxWcCRjcfPeq37TS/gDCxOxJCqK5SgXV32QW3ATHFCwOdwB/2xa/K', true, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-12 02:10:09.761844+07', '2026-04-12 11:23:59.072678+07');


--
-- TOC entry 5065 (class 0 OID 0)
-- Dependencies: 224
-- Name: claim_statuses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.claim_statuses_id_seq', 6, true);


--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 218
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 6, true);


--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 221
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 4840 (class 2606 OID 210379)
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- TOC entry 4865 (class 2606 OID 210449)
-- Name: claim_attachments PK_claim_attachments_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_attachments
    ADD CONSTRAINT "PK_claim_attachments_id" PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 210458)
-- Name: claim_comments PK_claim_comments_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_comments
    ADD CONSTRAINT "PK_claim_comments_id" PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 210440)
-- Name: claim_status_histories PK_claim_status_histories_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_histories
    ADD CONSTRAINT "PK_claim_status_histories_id" PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 210417)
-- Name: claim_statuses PK_claim_statuses_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_statuses
    ADD CONSTRAINT "PK_claim_statuses_id" PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 210429)
-- Name: claims PK_claims_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "PK_claims_id" PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 210467)
-- Name: idempotency_keys PK_idempotency_keys_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idempotency_keys
    ADD CONSTRAINT "PK_idempotency_keys_id" PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 210399)
-- Name: roles PK_roles_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_roles_id" PRIMARY KEY (id);


--
-- TOC entry 4852 (class 2606 OID 210408)
-- Name: user_roles PK_user_roles_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_user_roles_id" PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 210671)
-- Name: user_settings PK_user_settings_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "PK_user_settings_id" PRIMARY KEY (id);


--
-- TOC entry 4872 (class 2606 OID 210638)
-- Name: user_tokens PK_user_tokens_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT "PK_user_tokens_id" PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 210390)
-- Name: users PK_users_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_users_id" PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 210419)
-- Name: claim_statuses UQ_claim_statuses_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_statuses
    ADD CONSTRAINT "UQ_claim_statuses_code" UNIQUE (code);


--
-- TOC entry 4850 (class 2606 OID 210401)
-- Name: roles UQ_roles_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_roles_code" UNIQUE (code);


--
-- TOC entry 4878 (class 2606 OID 210673)
-- Name: user_settings UQ_user_settings_user_id; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "UQ_user_settings_user_id" UNIQUE (user_id);


--
-- TOC entry 4874 (class 2606 OID 210640)
-- Name: user_tokens UQ_user_tokens_token; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT "UQ_user_tokens_token" UNIQUE (token);


--
-- TOC entry 4844 (class 2606 OID 210392)
-- Name: users UQ_users_email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_email" UNIQUE (email);


--
-- TOC entry 4846 (class 2606 OID 210647)
-- Name: users UQ_users_nik; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_users_nik" UNIQUE (nik);


--
-- TOC entry 4854 (class 2606 OID 210553)
-- Name: user_roles uq_user_roles_user_role; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role_id);


--
-- TOC entry 4868 (class 1259 OID 210551)
-- Name: IDX_0afd83cbf08c9d12089a9bffc5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_0afd83cbf08c9d12089a9bffc5" ON public.idempotency_keys USING btree (key);


--
-- TOC entry 4859 (class 1259 OID 210550)
-- Name: IDX_383f456e8c7dda0114c49d47c5; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "IDX_383f456e8c7dda0114c49d47c5" ON public.claims USING btree (claim_number);


--
-- TOC entry 4891 (class 2606 OID 210599)
-- Name: claim_comments FK_170f13a3e6471b47f1cb6327374; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_comments
    ADD CONSTRAINT "FK_170f13a3e6471b47f1cb6327374" FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4881 (class 2606 OID 210609)
-- Name: claims FK_232e9b9399df201bb5ed7fb8963; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "FK_232e9b9399df201bb5ed7fb8963" FOREIGN KEY (current_status_id) REFERENCES public.claim_statuses(id) ON DELETE RESTRICT;


--
-- TOC entry 4885 (class 2606 OID 210579)
-- Name: claim_status_histories FK_2eb98659870b0bdf90dfe578fdf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_histories
    ADD CONSTRAINT "FK_2eb98659870b0bdf90dfe578fdf" FOREIGN KEY (action_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4886 (class 2606 OID 210564)
-- Name: claim_status_histories FK_3d02024277029d8473fe1ad5acc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_histories
    ADD CONSTRAINT "FK_3d02024277029d8473fe1ad5acc" FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE CASCADE;


--
-- TOC entry 4892 (class 2606 OID 210594)
-- Name: claim_comments FK_635fdea1aee993016389f7713ad; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_comments
    ADD CONSTRAINT "FK_635fdea1aee993016389f7713ad" FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE CASCADE;


--
-- TOC entry 4882 (class 2606 OID 210604)
-- Name: claims FK_6b6d7ad7d8c3982b44194fd542c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "FK_6b6d7ad7d8c3982b44194fd542c" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4883 (class 2606 OID 210614)
-- Name: claims FK_6c5e93ffaf645b7d0e6b439876b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "FK_6c5e93ffaf645b7d0e6b439876b" FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4889 (class 2606 OID 210589)
-- Name: claim_attachments FK_725e9d29873a9109a3f08d76650; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_attachments
    ADD CONSTRAINT "FK_725e9d29873a9109a3f08d76650" FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4890 (class 2606 OID 210584)
-- Name: claim_attachments FK_72bc6efcd1422bc7c4200192f2b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_attachments
    ADD CONSTRAINT "FK_72bc6efcd1422bc7c4200192f2b" FOREIGN KEY (claim_id) REFERENCES public.claims(id) ON DELETE CASCADE;


--
-- TOC entry 4884 (class 2606 OID 210619)
-- Name: claims FK_82c46bddd60b97d26e32019eaab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT "FK_82c46bddd60b97d26e32019eaab" FOREIGN KEY (decided_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- TOC entry 4879 (class 2606 OID 210554)
-- Name: user_roles FK_87b8888186ca9769c960e926870; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4893 (class 2606 OID 210624)
-- Name: idempotency_keys FK_a2af91410963bee3a8e0146d194; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.idempotency_keys
    ADD CONSTRAINT "FK_a2af91410963bee3a8e0146d194" FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4880 (class 2606 OID 210559)
-- Name: user_roles FK_b23c65e50a758245a33ee35fda1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- TOC entry 4887 (class 2606 OID 210574)
-- Name: claim_status_histories FK_eaa7b2f731c09c8ce5fcaca7851; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_histories
    ADD CONSTRAINT "FK_eaa7b2f731c09c8ce5fcaca7851" FOREIGN KEY (to_status_id) REFERENCES public.claim_statuses(id) ON DELETE RESTRICT;


--
-- TOC entry 4888 (class 2606 OID 210569)
-- Name: claim_status_histories FK_fb5a69b0e531dcf3041f01b5f97; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.claim_status_histories
    ADD CONSTRAINT "FK_fb5a69b0e531dcf3041f01b5f97" FOREIGN KEY (from_status_id) REFERENCES public.claim_statuses(id) ON DELETE RESTRICT;


--
-- TOC entry 4895 (class 2606 OID 210674)
-- Name: user_settings FK_user_settings_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT "FK_user_settings_user_id" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4894 (class 2606 OID 210641)
-- Name: user_tokens FK_user_tokens_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_tokens
    ADD CONSTRAINT "FK_user_tokens_user" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-04-12 11:34:02

--
-- PostgreSQL database dump complete
--

