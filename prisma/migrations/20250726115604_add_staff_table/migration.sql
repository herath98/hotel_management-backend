-- CreateTable
CREATE TABLE "staff" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department" VARCHAR(50) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "salary" DECIMAL(10,2) NOT NULL,
    "performance_score" DECIMAL(5,2) NOT NULL,
    "shift" VARCHAR(20) NOT NULL,
    "joined_date" DATE NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_id_key" ON "staff"("user_id");

-- CreateIndex
CREATE INDEX "idx_staff_user_id" ON "staff"("user_id");

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
