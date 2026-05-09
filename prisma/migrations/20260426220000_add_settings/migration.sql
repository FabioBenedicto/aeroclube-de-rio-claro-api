CREATE TABLE "settings" (
  "id"                    INTEGER NOT NULL DEFAULT 1,
  "instructor_percentage" DECIMAL(5,2) NOT NULL,
  "partner_monthly_dues"  DECIMAL(10,2) NOT NULL,

  CONSTRAINT "settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "settings_singleton" CHECK ("id" = 1)
);
