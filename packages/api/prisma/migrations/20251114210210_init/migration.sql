-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forms" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "communication_method" TEXT,
    "pickup_date" TEXT,
    "pickup_time" TEXT,
    "rush_order" BOOLEAN NOT NULL DEFAULT false,
    "package_type" TEXT,
    "rice_krispies" INTEGER NOT NULL DEFAULT 0,
    "oreos" INTEGER NOT NULL DEFAULT 0,
    "pretzels" INTEGER NOT NULL DEFAULT 0,
    "marshmallows" INTEGER NOT NULL DEFAULT 0,
    "referral_source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submitted_at" TIMESTAMP(3),
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_number" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_options" (
    "id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treat_options" (
    "id" TEXT NOT NULL,
    "treat_key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treat_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "start_hour" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "start_time_of_day" TEXT NOT NULL,
    "end_hour" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "end_time_of_day" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unavailable_periods" (
    "id" TEXT NOT NULL,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unavailable_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");

-- CreateIndex
CREATE INDEX "forms_pickup_date_pickup_time_idx" ON "forms"("pickup_date", "pickup_time");

-- CreateIndex
CREATE INDEX "forms_rush_order_idx" ON "forms"("rush_order");

-- CreateIndex
CREATE INDEX "forms_referral_source_idx" ON "forms"("referral_source");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE UNIQUE INDEX "orders_form_id_key" ON "orders"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "package_options_package_id_key" ON "package_options"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "treat_options_treat_key_key" ON "treat_options"("treat_key");

-- CreateIndex
CREATE INDEX "time_slots_day_of_week_is_active_idx" ON "time_slots"("day_of_week", "is_active");

-- CreateIndex
CREATE INDEX "unavailable_periods_start_date_end_date_is_active_idx" ON "unavailable_periods"("start_date", "end_date", "is_active");

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
