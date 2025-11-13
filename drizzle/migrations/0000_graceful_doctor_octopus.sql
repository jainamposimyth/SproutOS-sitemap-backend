CREATE TABLE "Sitemap" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectName" text NOT NULL,
	"prompt" text,
	"nodes" jsonb NOT NULL,
	"edges" jsonb NOT NULL,
	"language" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp NOT NULL
);
