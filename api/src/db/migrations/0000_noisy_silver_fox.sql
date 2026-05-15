CREATE TYPE "public"."effort" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."goal_status" AS ENUM('active', 'hit', 'missed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('primary', 'secondary');--> statement-breakpoint
CREATE TYPE "public"."habit_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'fired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reminder_type" AS ENUM('one_shot', 'recurring_until_done');--> statement-breakpoint
CREATE TYPE "public"."return_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_assignment" AS ENUM('this_week', 'backlog');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('open', 'done', 'archived');--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "goal_type" NOT NULL,
	"status" "goal_status" DEFAULT 'active' NOT NULL,
	"target_date" date NOT NULL,
	"why" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	CONSTRAINT "goals_user_id_title_theme_id_unique" UNIQUE("user_id","title","theme_id")
);
--> statement-breakpoint
CREATE TABLE "habit_week_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"habit_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"count_achieved" integer DEFAULT 0 NOT NULL,
	"target_at_time" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "habit_week_records_habit_id_week_start_unique" UNIQUE("habit_id","week_start")
);
--> statement-breakpoint
CREATE TABLE "habits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	"goal_id" uuid,
	"title" text NOT NULL,
	"weekly_target" integer NOT NULL,
	"status" "habit_status" DEFAULT 'active' NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"best_ever_streak" integer DEFAULT 0 NOT NULL,
	"last_nudged_at" timestamp,
	"deleted_at" timestamp,
	"undo_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "habits_user_id_title_theme_id_unique" UNIQUE("user_id","title","theme_id")
);
--> statement-breakpoint
CREATE TABLE "reminders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "reminder_type" NOT NULL,
	"fire_at" timestamp,
	"daily_time" time,
	"status" "reminder_status" DEFAULT 'pending' NOT NULL,
	"last_fired_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"theme_id" uuid NOT NULL,
	"goal_id" uuid,
	"title" text NOT NULL,
	"effort" "effort" DEFAULT 'medium' NOT NULL,
	"return_level" "return_level" DEFAULT 'medium' NOT NULL,
	"week_assignment" "task_assignment" DEFAULT 'this_week' NOT NULL,
	"status" "task_status" DEFAULT 'open' NOT NULL,
	"archived_week_start" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "themes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#8C967A' NOT NULL,
	"icon" text DEFAULT 'circle' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "themes_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"nudge_enabled" boolean DEFAULT true NOT NULL,
	"expo_push_token" text,
	"last_week_start" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "week_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"week_start" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "week_records_user_id_week_start_unique" UNIQUE("user_id","week_start")
);
