import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('kk');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor', 'reviewer');
  CREATE TYPE "public"."enum_categories_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__categories_v_published_locale" AS ENUM('kk');
  CREATE TYPE "public"."enum_sources_source_type" AS ENUM('government', 'legal-act', 'official-provider', 'reference');
  CREATE TYPE "public"."enum_sources_trust_tier" AS ENUM('primary-official', 'official-provider', 'secondary');
  CREATE TYPE "public"."enum_sources_language" AS ENUM('kk', 'ru', 'en');
  CREATE TYPE "public"."enum_calculator_rule_sets_calculator_key" AS ENUM('maternity-benefit', 'childcare-benefit', 'vehicle-tax', 'auto-loan', 'salary');
  CREATE TYPE "public"."enum_calculator_rule_sets_verification_status" AS ENUM('unverified', 'in-review', 'verified', 'stale');
  CREATE TYPE "public"."enum_calculator_rule_sets_verification_risk_level" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_calculator_rule_sets_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__calculator_rule_sets_v_version_calculator_key" AS ENUM('maternity-benefit', 'childcare-benefit', 'vehicle-tax', 'auto-loan', 'salary');
  CREATE TYPE "public"."enum__calculator_rule_sets_v_version_verification_status" AS ENUM('unverified', 'in-review', 'verified', 'stale');
  CREATE TYPE "public"."enum__calculator_rule_sets_v_version_verification_risk_level" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum__calculator_rule_sets_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__calculator_rule_sets_v_published_locale" AS ENUM('kk');
  CREATE TYPE "public"."enum_scenarios_cost_kind" AS ENUM('free', 'fixed', 'range', 'calculated', 'varies');
  CREATE TYPE "public"."enum_scenarios_verification_status" AS ENUM('unverified', 'in-review', 'verified', 'stale');
  CREATE TYPE "public"."enum_scenarios_verification_risk_level" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum_scenarios_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__scenarios_v_version_cost_kind" AS ENUM('free', 'fixed', 'range', 'calculated', 'varies');
  CREATE TYPE "public"."enum__scenarios_v_version_verification_status" AS ENUM('unverified', 'in-review', 'verified', 'stale');
  CREATE TYPE "public"."enum__scenarios_v_version_verification_risk_level" AS ENUM('high', 'medium', 'low');
  CREATE TYPE "public"."enum__scenarios_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__scenarios_v_published_locale" AS ENUM('kk');
  CREATE TABLE "users_roles" (
    "order" integer NOT NULL,
    "parent_id" integer NOT NULL,
    "value" "enum_users_roles",
    "id" serial PRIMARY KEY NOT NULL
  );

  CREATE TABLE "users_sessions" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "created_at" timestamp(3) with time zone,
    "expires_at" timestamp(3) with time zone NOT NULL
  );

  CREATE TABLE "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "email" varchar NOT NULL,
    "reset_password_token" varchar,
    "reset_password_expiration" timestamp(3) with time zone,
    "salt" varchar,
    "hash" varchar,
    "login_attempts" numeric DEFAULT 0,
    "lock_until" timestamp(3) with time zone
  );

  CREATE TABLE "categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar,
    "order" numeric DEFAULT 100,
    "seo_no_index" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_categories_status" DEFAULT 'draft'
  );

  CREATE TABLE "categories_locales" (
    "title" varchar,
    "description" varchar,
    "seo_title" varchar,
    "seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_categories_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_slug" varchar,
    "version_order" numeric DEFAULT 100,
    "version_seo_no_index" boolean DEFAULT false,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__categories_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__categories_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE "_categories_v_locales" (
    "version_title" varchar,
    "version_description" varchar,
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "sources" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "publisher" varchar NOT NULL,
    "url" varchar NOT NULL,
    "source_type" "enum_sources_source_type" NOT NULL,
    "trust_tier" "enum_sources_trust_tier" DEFAULT 'secondary' NOT NULL,
    "document_number" varchar,
    "publisher_updated_at" timestamp(3) with time zone,
    "language" "enum_sources_language" DEFAULT 'kk' NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "calculator_rule_sets_source_references" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "source_id" integer,
    "is_primary" boolean DEFAULT false,
    "claims_supported" varchar,
    "evidence_summary" varchar,
    "checked_at" timestamp(3) with time zone,
    "valid_from" timestamp(3) with time zone,
    "valid_until" timestamp(3) with time zone
  );

  CREATE TABLE "calculator_rule_sets" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "slug" varchar,
    "calculator_key" "enum_calculator_rule_sets_calculator_key",
    "version" varchar,
    "effective_from" timestamp(3) with time zone,
    "effective_until" timestamp(3) with time zone,
    "parameters" jsonb,
    "verification_status" "enum_calculator_rule_sets_verification_status" DEFAULT 'unverified',
    "verification_risk_level" "enum_calculator_rule_sets_verification_risk_level" DEFAULT 'high',
    "verification_reviewed_at" timestamp(3) with time zone,
    "verification_reviewed_by_id" integer,
    "verification_next_review_at" timestamp(3) with time zone,
    "verification_notes" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_calculator_rule_sets_status" DEFAULT 'draft'
  );

  CREATE TABLE "_calculator_rule_sets_v_version_source_references" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "source_id" integer,
    "is_primary" boolean DEFAULT false,
    "claims_supported" varchar,
    "evidence_summary" varchar,
    "checked_at" timestamp(3) with time zone,
    "valid_from" timestamp(3) with time zone,
    "valid_until" timestamp(3) with time zone,
    "_uuid" varchar
  );

  CREATE TABLE "_calculator_rule_sets_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_title" varchar,
    "version_slug" varchar,
    "version_calculator_key" "enum__calculator_rule_sets_v_version_calculator_key",
    "version_version" varchar,
    "version_effective_from" timestamp(3) with time zone,
    "version_effective_until" timestamp(3) with time zone,
    "version_parameters" jsonb,
    "version_verification_status" "enum__calculator_rule_sets_v_version_verification_status" DEFAULT 'unverified',
    "version_verification_risk_level" "enum__calculator_rule_sets_v_version_verification_risk_level" DEFAULT 'high',
    "version_verification_reviewed_at" timestamp(3) with time zone,
    "version_verification_reviewed_by_id" integer,
    "version_verification_next_review_at" timestamp(3) with time zone,
    "version_verification_notes" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__calculator_rule_sets_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__calculator_rule_sets_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE "scenarios_eligibility" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "scenarios_eligibility_locales" (
    "condition" varchar,
    "explanation" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_requirements" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "scenarios_requirements_locales" (
    "item" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_documents" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "optional" boolean DEFAULT false
  );

  CREATE TABLE "scenarios_documents_locales" (
    "name" varchar,
    "note" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_steps" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "action_url" varchar
  );

  CREATE TABLE "scenarios_steps_locales" (
    "title" varchar,
    "description" varchar,
    "action_label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_official_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "url" varchar,
    "publisher" varchar
  );

  CREATE TABLE "scenarios_official_links_locales" (
    "label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL
  );

  CREATE TABLE "scenarios_faq_locales" (
    "question" varchar,
    "answer" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE "scenarios_source_references" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "source_id" integer,
    "is_primary" boolean DEFAULT false,
    "claims_supported" varchar,
    "evidence_summary" varchar,
    "checked_at" timestamp(3) with time zone,
    "valid_from" timestamp(3) with time zone,
    "valid_until" timestamp(3) with time zone
  );

  CREATE TABLE "scenarios" (
    "id" serial PRIMARY KEY NOT NULL,
    "slug" varchar,
    "published_slug" varchar,
    "category_id" integer,
    "cost_kind" "enum_scenarios_cost_kind" DEFAULT 'varies',
    "cost_amount" numeric,
    "cost_min_amount" numeric,
    "cost_max_amount" numeric,
    "cost_as_of" timestamp(3) with time zone,
    "calculator_rule_set_id" integer,
    "verification_status" "enum_scenarios_verification_status" DEFAULT 'unverified',
    "verification_risk_level" "enum_scenarios_verification_risk_level" DEFAULT 'high',
    "verification_reviewed_at" timestamp(3) with time zone,
    "verification_reviewed_by_id" integer,
    "verification_next_review_at" timestamp(3) with time zone,
    "verification_notes" varchar,
    "seo_no_index" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_scenarios_status" DEFAULT 'draft'
  );

  CREATE TABLE "scenarios_locales" (
    "title" varchar,
    "short_answer" varchar,
    "who_is_it_for" varchar,
    "cost_explanation" varchar,
    "processing_time_value" varchar,
    "processing_time_explanation" varchar,
    "seo_title" varchar,
    "seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "scenarios_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "scenarios_id" integer
  );

  CREATE TABLE "_scenarios_v_version_eligibility" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_eligibility_locales" (
    "condition" varchar,
    "explanation" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_requirements" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_requirements_locales" (
    "item" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_documents" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "optional" boolean DEFAULT false,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_documents_locales" (
    "name" varchar,
    "note" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_steps" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "action_url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_steps_locales" (
    "title" varchar,
    "description" varchar,
    "action_label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_official_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "url" varchar,
    "publisher" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_official_links_locales" (
    "label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v_version_faq_locales" (
    "question" varchar,
    "answer" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_version_source_references" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "source_id" integer,
    "is_primary" boolean DEFAULT false,
    "claims_supported" varchar,
    "evidence_summary" varchar,
    "checked_at" timestamp(3) with time zone,
    "valid_from" timestamp(3) with time zone,
    "valid_until" timestamp(3) with time zone,
    "_uuid" varchar
  );

  CREATE TABLE "_scenarios_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_slug" varchar,
    "version_published_slug" varchar,
    "version_category_id" integer,
    "version_cost_kind" "enum__scenarios_v_version_cost_kind" DEFAULT 'varies',
    "version_cost_amount" numeric,
    "version_cost_min_amount" numeric,
    "version_cost_max_amount" numeric,
    "version_cost_as_of" timestamp(3) with time zone,
    "version_calculator_rule_set_id" integer,
    "version_verification_status" "enum__scenarios_v_version_verification_status" DEFAULT 'unverified',
    "version_verification_risk_level" "enum__scenarios_v_version_verification_risk_level" DEFAULT 'high',
    "version_verification_reviewed_at" timestamp(3) with time zone,
    "version_verification_reviewed_by_id" integer,
    "version_verification_next_review_at" timestamp(3) with time zone,
    "version_verification_notes" varchar,
    "version_seo_no_index" boolean DEFAULT false,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__scenarios_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__scenarios_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE "_scenarios_v_locales" (
    "version_title" varchar,
    "version_short_answer" varchar,
    "version_who_is_it_for" varchar,
    "version_cost_explanation" varchar,
    "version_processing_time_value" varchar,
    "version_processing_time_explanation" varchar,
    "version_seo_title" varchar,
    "version_seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_scenarios_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "scenarios_id" integer
  );

  CREATE TABLE "payload_kv" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "data" jsonb NOT NULL
  );

  CREATE TABLE "payload_locked_documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "global_slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_locked_documents_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer,
    "categories_id" integer,
    "sources_id" integer,
    "calculator_rule_sets_id" integer,
    "scenarios_id" integer
  );

  CREATE TABLE "payload_preferences" (
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "value" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "payload_preferences_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "users_id" integer
  );

  CREATE TABLE "payload_migrations" (
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "batch" numeric,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "site_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "site_name" varchar DEFAULT 'QALAI' NOT NULL,
    "editorial_contact" varchar,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE "site_settings_locales" (
    "tagline" varchar DEFAULT 'Қазақстандағы күнделікті істерді түсінікті тілмен шешіңіз.' NOT NULL,
    "default_seo_description" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculator_rule_sets_source_references" ADD CONSTRAINT "calculator_rule_sets_source_references_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "calculator_rule_sets_source_references" ADD CONSTRAINT "calculator_rule_sets_source_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "calculator_rule_sets" ADD CONSTRAINT "calculator_rule_sets_verification_reviewed_by_id_users_id_fk" FOREIGN KEY ("verification_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_calculator_rule_sets_v_version_source_references" ADD CONSTRAINT "_calculator_rule_sets_v_version_source_references_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_calculator_rule_sets_v_version_source_references" ADD CONSTRAINT "_calculator_rule_sets_v_version_source_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_calculator_rule_sets_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_calculator_rule_sets_v" ADD CONSTRAINT "_calculator_rule_sets_v_parent_id_calculator_rule_sets_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_calculator_rule_sets_v" ADD CONSTRAINT "_calculator_rule_sets_v_version_verification_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_verification_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenarios_eligibility" ADD CONSTRAINT "scenarios_eligibility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_eligibility_locales" ADD CONSTRAINT "scenarios_eligibility_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_eligibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_requirements" ADD CONSTRAINT "scenarios_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_requirements_locales" ADD CONSTRAINT "scenarios_requirements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_documents" ADD CONSTRAINT "scenarios_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_documents_locales" ADD CONSTRAINT "scenarios_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_steps" ADD CONSTRAINT "scenarios_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_steps_locales" ADD CONSTRAINT "scenarios_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_official_links" ADD CONSTRAINT "scenarios_official_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_official_links_locales" ADD CONSTRAINT "scenarios_official_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_official_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_faq" ADD CONSTRAINT "scenarios_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_faq_locales" ADD CONSTRAINT "scenarios_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_source_references" ADD CONSTRAINT "scenarios_source_references_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenarios_source_references" ADD CONSTRAINT "scenarios_source_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_calculator_rule_set_id_calculator_rule_sets_id_fk" FOREIGN KEY ("calculator_rule_set_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_verification_reviewed_by_id_users_id_fk" FOREIGN KEY ("verification_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "scenarios_locales" ADD CONSTRAINT "scenarios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_rels" ADD CONSTRAINT "scenarios_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "scenarios_rels" ADD CONSTRAINT "scenarios_rels_scenarios_fk" FOREIGN KEY ("scenarios_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_eligibility" ADD CONSTRAINT "_scenarios_v_version_eligibility_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_eligibility_locales" ADD CONSTRAINT "_scenarios_v_version_eligibility_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_eligibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_requirements" ADD CONSTRAINT "_scenarios_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_requirements_locales" ADD CONSTRAINT "_scenarios_v_version_requirements_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_requirements"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_documents" ADD CONSTRAINT "_scenarios_v_version_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_documents_locales" ADD CONSTRAINT "_scenarios_v_version_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_steps" ADD CONSTRAINT "_scenarios_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_steps_locales" ADD CONSTRAINT "_scenarios_v_version_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_official_links" ADD CONSTRAINT "_scenarios_v_version_official_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_official_links_locales" ADD CONSTRAINT "_scenarios_v_version_official_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_official_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_faq" ADD CONSTRAINT "_scenarios_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_faq_locales" ADD CONSTRAINT "_scenarios_v_version_faq_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v_version_faq"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_source_references" ADD CONSTRAINT "_scenarios_v_version_source_references_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenarios_v_version_source_references" ADD CONSTRAINT "_scenarios_v_version_source_references_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v" ADD CONSTRAINT "_scenarios_v_parent_id_scenarios_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."scenarios"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenarios_v" ADD CONSTRAINT "_scenarios_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenarios_v" ADD CONSTRAINT "_scenarios_v_version_calculator_rule_set_id_calculator_rule_sets_id_fk" FOREIGN KEY ("version_calculator_rule_set_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenarios_v" ADD CONSTRAINT "_scenarios_v_version_verification_reviewed_by_id_users_id_fk" FOREIGN KEY ("version_verification_reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_scenarios_v_locales" ADD CONSTRAINT "_scenarios_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_rels" ADD CONSTRAINT "_scenarios_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_scenarios_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_scenarios_v_rels" ADD CONSTRAINT "_scenarios_v_rels_scenarios_fk" FOREIGN KEY ("scenarios_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sources_fk" FOREIGN KEY ("sources_id") REFERENCES "public"."sources"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_calculator_rule_sets_fk" FOREIGN KEY ("calculator_rule_sets_id") REFERENCES "public"."calculator_rule_sets"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_scenarios_fk" FOREIGN KEY ("scenarios_id") REFERENCES "public"."scenarios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE INDEX "categories__status_idx" ON "categories" USING btree ("_status");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_version_version__status_idx" ON "_categories_v" USING btree ("version__status");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE INDEX "_categories_v_snapshot_idx" ON "_categories_v" USING btree ("snapshot");
  CREATE INDEX "_categories_v_published_locale_idx" ON "_categories_v" USING btree ("published_locale");
  CREATE INDEX "_categories_v_latest_idx" ON "_categories_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_categories_v_locales_locale_parent_id_unique" ON "_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "sources_url_idx" ON "sources" USING btree ("url");
  CREATE INDEX "sources_updated_at_idx" ON "sources" USING btree ("updated_at");
  CREATE INDEX "sources_created_at_idx" ON "sources" USING btree ("created_at");
  CREATE INDEX "calculator_rule_sets_source_references_order_idx" ON "calculator_rule_sets_source_references" USING btree ("_order");
  CREATE INDEX "calculator_rule_sets_source_references_parent_id_idx" ON "calculator_rule_sets_source_references" USING btree ("_parent_id");
  CREATE INDEX "calculator_rule_sets_source_references_source_idx" ON "calculator_rule_sets_source_references" USING btree ("source_id");
  CREATE UNIQUE INDEX "calculator_rule_sets_slug_idx" ON "calculator_rule_sets" USING btree ("slug");
  CREATE INDEX "calculator_rule_sets_verification_verification_reviewed__idx" ON "calculator_rule_sets" USING btree ("verification_reviewed_by_id");
  CREATE INDEX "calculator_rule_sets_updated_at_idx" ON "calculator_rule_sets" USING btree ("updated_at");
  CREATE INDEX "calculator_rule_sets_created_at_idx" ON "calculator_rule_sets" USING btree ("created_at");
  CREATE INDEX "calculator_rule_sets__status_idx" ON "calculator_rule_sets" USING btree ("_status");
  CREATE INDEX "_calculator_rule_sets_v_version_source_references_order_idx" ON "_calculator_rule_sets_v_version_source_references" USING btree ("_order");
  CREATE INDEX "_calculator_rule_sets_v_version_source_references_parent_id_idx" ON "_calculator_rule_sets_v_version_source_references" USING btree ("_parent_id");
  CREATE INDEX "_calculator_rule_sets_v_version_source_references_source_idx" ON "_calculator_rule_sets_v_version_source_references" USING btree ("source_id");
  CREATE INDEX "_calculator_rule_sets_v_parent_idx" ON "_calculator_rule_sets_v" USING btree ("parent_id");
  CREATE INDEX "_calculator_rule_sets_v_version_version_slug_idx" ON "_calculator_rule_sets_v" USING btree ("version_slug");
  CREATE INDEX "_calculator_rule_sets_v_version_verification_version_ver_idx" ON "_calculator_rule_sets_v" USING btree ("version_verification_reviewed_by_id");
  CREATE INDEX "_calculator_rule_sets_v_version_version_updated_at_idx" ON "_calculator_rule_sets_v" USING btree ("version_updated_at");
  CREATE INDEX "_calculator_rule_sets_v_version_version_created_at_idx" ON "_calculator_rule_sets_v" USING btree ("version_created_at");
  CREATE INDEX "_calculator_rule_sets_v_version_version__status_idx" ON "_calculator_rule_sets_v" USING btree ("version__status");
  CREATE INDEX "_calculator_rule_sets_v_created_at_idx" ON "_calculator_rule_sets_v" USING btree ("created_at");
  CREATE INDEX "_calculator_rule_sets_v_updated_at_idx" ON "_calculator_rule_sets_v" USING btree ("updated_at");
  CREATE INDEX "_calculator_rule_sets_v_snapshot_idx" ON "_calculator_rule_sets_v" USING btree ("snapshot");
  CREATE INDEX "_calculator_rule_sets_v_published_locale_idx" ON "_calculator_rule_sets_v" USING btree ("published_locale");
  CREATE INDEX "_calculator_rule_sets_v_latest_idx" ON "_calculator_rule_sets_v" USING btree ("latest");
  CREATE INDEX "scenarios_eligibility_order_idx" ON "scenarios_eligibility" USING btree ("_order");
  CREATE INDEX "scenarios_eligibility_parent_id_idx" ON "scenarios_eligibility" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_eligibility_locales_locale_parent_id_unique" ON "scenarios_eligibility_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_requirements_order_idx" ON "scenarios_requirements" USING btree ("_order");
  CREATE INDEX "scenarios_requirements_parent_id_idx" ON "scenarios_requirements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_requirements_locales_locale_parent_id_unique" ON "scenarios_requirements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_documents_order_idx" ON "scenarios_documents" USING btree ("_order");
  CREATE INDEX "scenarios_documents_parent_id_idx" ON "scenarios_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_documents_locales_locale_parent_id_unique" ON "scenarios_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_steps_order_idx" ON "scenarios_steps" USING btree ("_order");
  CREATE INDEX "scenarios_steps_parent_id_idx" ON "scenarios_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_steps_locales_locale_parent_id_unique" ON "scenarios_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_official_links_order_idx" ON "scenarios_official_links" USING btree ("_order");
  CREATE INDEX "scenarios_official_links_parent_id_idx" ON "scenarios_official_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_official_links_locales_locale_parent_id_unique" ON "scenarios_official_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_faq_order_idx" ON "scenarios_faq" USING btree ("_order");
  CREATE INDEX "scenarios_faq_parent_id_idx" ON "scenarios_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "scenarios_faq_locales_locale_parent_id_unique" ON "scenarios_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_source_references_order_idx" ON "scenarios_source_references" USING btree ("_order");
  CREATE INDEX "scenarios_source_references_parent_id_idx" ON "scenarios_source_references" USING btree ("_parent_id");
  CREATE INDEX "scenarios_source_references_source_idx" ON "scenarios_source_references" USING btree ("source_id");
  CREATE UNIQUE INDEX "scenarios_slug_idx" ON "scenarios" USING btree ("slug");
  CREATE INDEX "scenarios_category_idx" ON "scenarios" USING btree ("category_id");
  CREATE INDEX "scenarios_calculator_rule_set_idx" ON "scenarios" USING btree ("calculator_rule_set_id");
  CREATE INDEX "scenarios_verification_verification_reviewed_by_idx" ON "scenarios" USING btree ("verification_reviewed_by_id");
  CREATE INDEX "scenarios_updated_at_idx" ON "scenarios" USING btree ("updated_at");
  CREATE INDEX "scenarios_created_at_idx" ON "scenarios" USING btree ("created_at");
  CREATE INDEX "scenarios__status_idx" ON "scenarios" USING btree ("_status");
  CREATE UNIQUE INDEX "scenarios_locales_locale_parent_id_unique" ON "scenarios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "scenarios_rels_order_idx" ON "scenarios_rels" USING btree ("order");
  CREATE INDEX "scenarios_rels_parent_idx" ON "scenarios_rels" USING btree ("parent_id");
  CREATE INDEX "scenarios_rels_path_idx" ON "scenarios_rels" USING btree ("path");
  CREATE INDEX "scenarios_rels_scenarios_id_idx" ON "scenarios_rels" USING btree ("scenarios_id");
  CREATE INDEX "_scenarios_v_version_eligibility_order_idx" ON "_scenarios_v_version_eligibility" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_eligibility_parent_id_idx" ON "_scenarios_v_version_eligibility" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_eligibility_locales_locale_parent_id_un" ON "_scenarios_v_version_eligibility_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_requirements_order_idx" ON "_scenarios_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_requirements_parent_id_idx" ON "_scenarios_v_version_requirements" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_requirements_locales_locale_parent_id_u" ON "_scenarios_v_version_requirements_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_documents_order_idx" ON "_scenarios_v_version_documents" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_documents_parent_id_idx" ON "_scenarios_v_version_documents" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_documents_locales_locale_parent_id_uniq" ON "_scenarios_v_version_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_steps_order_idx" ON "_scenarios_v_version_steps" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_steps_parent_id_idx" ON "_scenarios_v_version_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_steps_locales_locale_parent_id_unique" ON "_scenarios_v_version_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_official_links_order_idx" ON "_scenarios_v_version_official_links" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_official_links_parent_id_idx" ON "_scenarios_v_version_official_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_official_links_locales_locale_parent_id" ON "_scenarios_v_version_official_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_faq_order_idx" ON "_scenarios_v_version_faq" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_faq_parent_id_idx" ON "_scenarios_v_version_faq" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_scenarios_v_version_faq_locales_locale_parent_id_unique" ON "_scenarios_v_version_faq_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_version_source_references_order_idx" ON "_scenarios_v_version_source_references" USING btree ("_order");
  CREATE INDEX "_scenarios_v_version_source_references_parent_id_idx" ON "_scenarios_v_version_source_references" USING btree ("_parent_id");
  CREATE INDEX "_scenarios_v_version_source_references_source_idx" ON "_scenarios_v_version_source_references" USING btree ("source_id");
  CREATE INDEX "_scenarios_v_parent_idx" ON "_scenarios_v" USING btree ("parent_id");
  CREATE INDEX "_scenarios_v_version_version_slug_idx" ON "_scenarios_v" USING btree ("version_slug");
  CREATE INDEX "_scenarios_v_version_version_category_idx" ON "_scenarios_v" USING btree ("version_category_id");
  CREATE INDEX "_scenarios_v_version_version_calculator_rule_set_idx" ON "_scenarios_v" USING btree ("version_calculator_rule_set_id");
  CREATE INDEX "_scenarios_v_version_verification_version_verification_r_idx" ON "_scenarios_v" USING btree ("version_verification_reviewed_by_id");
  CREATE INDEX "_scenarios_v_version_version_updated_at_idx" ON "_scenarios_v" USING btree ("version_updated_at");
  CREATE INDEX "_scenarios_v_version_version_created_at_idx" ON "_scenarios_v" USING btree ("version_created_at");
  CREATE INDEX "_scenarios_v_version_version__status_idx" ON "_scenarios_v" USING btree ("version__status");
  CREATE INDEX "_scenarios_v_created_at_idx" ON "_scenarios_v" USING btree ("created_at");
  CREATE INDEX "_scenarios_v_updated_at_idx" ON "_scenarios_v" USING btree ("updated_at");
  CREATE INDEX "_scenarios_v_snapshot_idx" ON "_scenarios_v" USING btree ("snapshot");
  CREATE INDEX "_scenarios_v_published_locale_idx" ON "_scenarios_v" USING btree ("published_locale");
  CREATE INDEX "_scenarios_v_latest_idx" ON "_scenarios_v" USING btree ("latest");
  CREATE INDEX "_scenarios_v_autosave_idx" ON "_scenarios_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_scenarios_v_locales_locale_parent_id_unique" ON "_scenarios_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_scenarios_v_rels_order_idx" ON "_scenarios_v_rels" USING btree ("order");
  CREATE INDEX "_scenarios_v_rels_parent_idx" ON "_scenarios_v_rels" USING btree ("parent_id");
  CREATE INDEX "_scenarios_v_rels_path_idx" ON "_scenarios_v_rels" USING btree ("path");
  CREATE INDEX "_scenarios_v_rels_scenarios_id_idx" ON "_scenarios_v_rels" USING btree ("scenarios_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_sources_id_idx" ON "payload_locked_documents_rels" USING btree ("sources_id");
  CREATE INDEX "payload_locked_documents_rels_calculator_rule_sets_id_idx" ON "payload_locked_documents_rels" USING btree ("calculator_rule_sets_id");
  CREATE INDEX "payload_locked_documents_rels_scenarios_id_idx" ON "payload_locked_documents_rels" USING btree ("scenarios_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_locales" CASCADE;
  DROP TABLE "sources" CASCADE;
  DROP TABLE "calculator_rule_sets_source_references" CASCADE;
  DROP TABLE "calculator_rule_sets" CASCADE;
  DROP TABLE "_calculator_rule_sets_v_version_source_references" CASCADE;
  DROP TABLE "_calculator_rule_sets_v" CASCADE;
  DROP TABLE "scenarios_eligibility" CASCADE;
  DROP TABLE "scenarios_eligibility_locales" CASCADE;
  DROP TABLE "scenarios_requirements" CASCADE;
  DROP TABLE "scenarios_requirements_locales" CASCADE;
  DROP TABLE "scenarios_documents" CASCADE;
  DROP TABLE "scenarios_documents_locales" CASCADE;
  DROP TABLE "scenarios_steps" CASCADE;
  DROP TABLE "scenarios_steps_locales" CASCADE;
  DROP TABLE "scenarios_official_links" CASCADE;
  DROP TABLE "scenarios_official_links_locales" CASCADE;
  DROP TABLE "scenarios_faq" CASCADE;
  DROP TABLE "scenarios_faq_locales" CASCADE;
  DROP TABLE "scenarios_source_references" CASCADE;
  DROP TABLE "scenarios" CASCADE;
  DROP TABLE "scenarios_locales" CASCADE;
  DROP TABLE "scenarios_rels" CASCADE;
  DROP TABLE "_scenarios_v_version_eligibility" CASCADE;
  DROP TABLE "_scenarios_v_version_eligibility_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_requirements" CASCADE;
  DROP TABLE "_scenarios_v_version_requirements_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_documents" CASCADE;
  DROP TABLE "_scenarios_v_version_documents_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_steps" CASCADE;
  DROP TABLE "_scenarios_v_version_steps_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_official_links" CASCADE;
  DROP TABLE "_scenarios_v_version_official_links_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_faq" CASCADE;
  DROP TABLE "_scenarios_v_version_faq_locales" CASCADE;
  DROP TABLE "_scenarios_v_version_source_references" CASCADE;
  DROP TABLE "_scenarios_v" CASCADE;
  DROP TABLE "_scenarios_v_locales" CASCADE;
  DROP TABLE "_scenarios_v_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_categories_status";
  DROP TYPE "public"."enum__categories_v_version_status";
  DROP TYPE "public"."enum__categories_v_published_locale";
  DROP TYPE "public"."enum_sources_source_type";
  DROP TYPE "public"."enum_sources_trust_tier";
  DROP TYPE "public"."enum_sources_language";
  DROP TYPE "public"."enum_calculator_rule_sets_calculator_key";
  DROP TYPE "public"."enum_calculator_rule_sets_verification_status";
  DROP TYPE "public"."enum_calculator_rule_sets_verification_risk_level";
  DROP TYPE "public"."enum_calculator_rule_sets_status";
  DROP TYPE "public"."enum__calculator_rule_sets_v_version_calculator_key";
  DROP TYPE "public"."enum__calculator_rule_sets_v_version_verification_status";
  DROP TYPE "public"."enum__calculator_rule_sets_v_version_verification_risk_level";
  DROP TYPE "public"."enum__calculator_rule_sets_v_version_status";
  DROP TYPE "public"."enum__calculator_rule_sets_v_published_locale";
  DROP TYPE "public"."enum_scenarios_cost_kind";
  DROP TYPE "public"."enum_scenarios_verification_status";
  DROP TYPE "public"."enum_scenarios_verification_risk_level";
  DROP TYPE "public"."enum_scenarios_status";
  DROP TYPE "public"."enum__scenarios_v_version_cost_kind";
  DROP TYPE "public"."enum__scenarios_v_version_verification_status";
  DROP TYPE "public"."enum__scenarios_v_version_verification_risk_level";
  DROP TYPE "public"."enum__scenarios_v_version_status";
  DROP TYPE "public"."enum__scenarios_v_published_locale";`)
}
