-- Existing local test inquiries predate explicit consent and are not backfilled.
-- The table can be altered safely because production has not been launched.
ALTER TABLE "inquiries"
ADD COLUMN "consent_given_at" TIMESTAMPTZ(3),
ADD COLUMN "consent_version" TEXT,
ADD COLUMN "consent_form_id" TEXT;

UPDATE "inquiries"
SET
  "consent_given_at" = "created_at",
  "consent_version" = 'prelaunch-legacy',
  "consent_form_id" = 'prelaunch-legacy'
WHERE "consent_given_at" IS NULL;

ALTER TABLE "inquiries"
ALTER COLUMN "consent_given_at" SET NOT NULL,
ALTER COLUMN "consent_given_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "consent_version" SET NOT NULL,
ALTER COLUMN "consent_form_id" SET NOT NULL;
