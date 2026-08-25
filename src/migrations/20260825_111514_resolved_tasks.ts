import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_resolved_tasks_task_type" AS ENUM('scenario', 'calculator');
  CREATE TYPE "public"."enum_resolved_tasks_resolution_method" AS ENUM('calculation', 'official-transition', 'helpful-feedback');
  CREATE TABLE "resolved_tasks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"dedupe_key" varchar NOT NULL,
  	"session_hash" varchar NOT NULL,
  	"task_type" "enum_resolved_tasks_task_type" NOT NULL,
  	"task_key" varchar NOT NULL,
  	"resolution_method" "enum_resolved_tasks_resolution_method" NOT NULL,
  	"resolved_at" timestamp(3) with time zone NOT NULL,
  	"schema_version" numeric DEFAULT 1 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE UNIQUE INDEX "resolved_tasks_dedupe_key_idx" ON "resolved_tasks" USING btree ("dedupe_key");
  CREATE INDEX "resolved_tasks_session_hash_idx" ON "resolved_tasks" USING btree ("session_hash");
  CREATE INDEX "resolved_tasks_updated_at_idx" ON "resolved_tasks" USING btree ("updated_at");
  CREATE INDEX "resolved_tasks_created_at_idx" ON "resolved_tasks" USING btree ("created_at");`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "resolved_tasks" CASCADE;
  DROP TYPE "public"."enum_resolved_tasks_task_type";
  DROP TYPE "public"."enum_resolved_tasks_resolution_method";`)
}
