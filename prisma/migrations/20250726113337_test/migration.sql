-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "check_in_date" DATE NOT NULL,
    "check_out_date" DATE NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "contact" VARCHAR(100) NOT NULL,
    "preferences" JSONB DEFAULT '{}',
    "stay_history" JSONB DEFAULT '{}',
    "loyalty_points" INTEGER DEFAULT 0,
    "dietary_needs" VARCHAR(255) DEFAULT '',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "housekeeping_tasks" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "task_name" VARCHAR(255) NOT NULL,
    "task_status" VARCHAR(50) DEFAULT 'Pending',
    "scheduled_date" DATE NOT NULL,
    "start_time" TIMESTAMPTZ(6) NOT NULL,
    "end_time" TIMESTAMPTZ(6) NOT NULL,
    "assigned_to" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "manual_override" BOOLEAN DEFAULT false,
    "last_updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "manual_status_override" BOOLEAN DEFAULT false,
    "last_manual_update" TIMESTAMPTZ(6),

    CONSTRAINT "housekeeping_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_items" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "is_available" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "dietary_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "image_paths" TEXT[],

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_logs" (
    "log_id" SERIAL NOT NULL,
    "order_id" INTEGER,
    "updated_at" TIMESTAMP(6),
    "old_status" VARCHAR(50),
    "new_status" VARCHAR(50),

    CONSTRAINT "order_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "order_updates" (
    "id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "old_status" VARCHAR(50),
    "new_status" VARCHAR(50),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "items" JSONB NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "room_number" VARCHAR(50) NOT NULL,
    "special_notes" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" SERIAL NOT NULL,
    "room_number" VARCHAR(10) NOT NULL,
    "room_type" VARCHAR(50),
    "status" VARCHAR(50),
    "price" DECIMAL(10,2),
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "capacity" INTEGER,
    "bed_type" VARCHAR(50),
    "amenities" JSONB DEFAULT '[]',
    "room_size" VARCHAR(50),
    "view_type" VARCHAR(50),
    "floor_number" INTEGER,
    "description" TEXT,
    "image_urls" TEXT[],
    "room_category" VARCHAR(50),
    "maintenance_status" VARCHAR(50),
    "is_smoking" BOOLEAN DEFAULT false,
    "base_price" DECIMAL(10,2),
    "seasonal_pricing" JSONB DEFAULT '{}',
    "tax_rate" DECIMAL(5,2),
    "discount_rules" JSONB DEFAULT '{}',

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_records" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER,
    "month" INTEGER,
    "year" INTEGER,
    "base_salary" DECIMAL(10,2),
    "regular_hours" DECIMAL(10,2),
    "overtime_hours" DECIMAL(10,2),
    "regular_pay" DECIMAL(10,2),
    "overtime_pay" DECIMAL(10,2),
    "total_salary" DECIMAL(10,2),
    "status" VARCHAR(20),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "completed_tasks" JSONB,
    "applied_hourly_rate" DECIMAL(10,2),

    CONSTRAINT "salary_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_images" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "image_url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "role" VARCHAR(10) NOT NULL DEFAULT 'staff',
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "last_login" TIMESTAMP(6),
    "firstname" VARCHAR(255),
    "lastname" VARCHAR(255),
    "email" VARCHAR(255),
    "mobile" VARCHAR(15),
    "address" TEXT,
    "hourly_rate" DECIMAL(10,2),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_housekeeping_assigned_to" ON "housekeeping_tasks"("assigned_to");

-- CreateIndex
CREATE INDEX "idx_housekeeping_room_id" ON "housekeeping_tasks"("room_id");

-- CreateIndex
CREATE INDEX "idx_housekeeping_tasks_manual_override" ON "housekeeping_tasks"("manual_override");

-- CreateIndex
CREATE UNIQUE INDEX "rooms_room_number_key" ON "rooms"("room_number");

-- CreateIndex
CREATE INDEX "idx_user_images_user_id" ON "user_images"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "fk_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "fk_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "housekeeping_tasks" ADD CONSTRAINT "fk_room" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "housekeeping_tasks" ADD CONSTRAINT "fk_user" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salary_records" ADD CONSTRAINT "salary_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_images" ADD CONSTRAINT "user_images_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
