import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJowarEntityAddedMoisterAndPriceInPoOrder1758091792973 implements MigrationInterface {
    name = 'AddJowarEntityAddedMoisterAndPriceInPoOrder1758091792973'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crops" ADD "moisturePercent" double precision`);
        await queryRunner.query(`CREATE TYPE "public"."crops_jowarvariety_enum" AS ENUM('Jowar White', 'Local', 'Jowar Hybrid', 'Jowar Sorghum')`);
        await queryRunner.query(`ALTER TABLE "crops" ADD "jowarVariety" "public"."crops_jowarvariety_enum"`);
        await queryRunner.query(`ALTER TABLE "po" ADD "price" double precision`);
        await queryRunner.query(`ALTER TYPE "public"."crops_cropname_enum" RENAME TO "crops_cropname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."crops_cropname_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "crops" ALTER COLUMN "cropName" TYPE "public"."crops_cropname_enum" USING "cropName"::"text"::"public"."crops_cropname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."crops_cropname_enum_old"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "crops" ADD "quantity" double precision`);
        await queryRunner.query(`ALTER TYPE "public"."crops_table_enum" RENAME TO "crops_table_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."crops_table_enum" AS ENUM('tender_coconut', 'turmeric', 'banana', 'dry_coconut', 'sunflower', 'maize', 'jowar')`);
        await queryRunner.query(`ALTER TABLE "crops" ALTER COLUMN "table" TYPE "public"."crops_table_enum" USING "table"::"text"::"public"."crops_table_enum"`);
        await queryRunner.query(`DROP TYPE "public"."crops_table_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."users_cropnames_enum" RENAME TO "users_cropnames_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_cropnames_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" TYPE "public"."users_cropnames_enum"[] USING "cropNames"::"text"::"public"."users_cropnames_enum"[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."users_cropnames_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."daily_prices_cropname_enum" RENAME TO "daily_prices_cropname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."daily_prices_cropname_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "daily_prices" ALTER COLUMN "cropName" TYPE "public"."daily_prices_cropname_enum" USING "cropName"::"text"::"public"."daily_prices_cropname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."daily_prices_cropname_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."markets_cropnames_enum" RENAME TO "markets_cropnames_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."markets_cropnames_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" TYPE "public"."markets_cropnames_enum"[] USING "cropNames"::"text"::"public"."markets_cropnames_enum"[]`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."markets_cropnames_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."market_prices_cropname_enum" RENAME TO "market_prices_cropname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."market_prices_cropname_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "market_prices" ALTER COLUMN "cropName" TYPE "public"."market_prices_cropname_enum" USING "cropName"::"text"::"public"."market_prices_cropname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."market_prices_cropname_enum_old"`);
        await queryRunner.query(`ALTER TYPE "public"."po_cropname_enum" RENAME TO "po_cropname_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."po_cropname_enum" AS ENUM('Tender Coconut', 'Turmeric', 'Banana', 'Dry Coconut', 'Sunflower', 'Maize', 'Jowar')`);
        await queryRunner.query(`ALTER TABLE "po" ALTER COLUMN "cropName" TYPE "public"."po_cropname_enum" USING "cropName"::"text"::"public"."po_cropname_enum"`);
        await queryRunner.query(`DROP TYPE "public"."po_cropname_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."po_cropname_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "po" ALTER COLUMN "cropName" TYPE "public"."po_cropname_enum_old" USING "cropName"::"text"::"public"."po_cropname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."po_cropname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."po_cropname_enum_old" RENAME TO "po_cropname_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."market_prices_cropname_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "market_prices" ALTER COLUMN "cropName" TYPE "public"."market_prices_cropname_enum_old" USING "cropName"::"text"::"public"."market_prices_cropname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."market_prices_cropname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."market_prices_cropname_enum_old" RENAME TO "market_prices_cropname_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."markets_cropnames_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" TYPE "public"."markets_cropnames_enum_old"[] USING "cropNames"::"text"::"public"."markets_cropnames_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "markets" ALTER COLUMN "cropNames" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."markets_cropnames_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."markets_cropnames_enum_old" RENAME TO "markets_cropnames_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."daily_prices_cropname_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "daily_prices" ALTER COLUMN "cropName" TYPE "public"."daily_prices_cropname_enum_old" USING "cropName"::"text"::"public"."daily_prices_cropname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."daily_prices_cropname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."daily_prices_cropname_enum_old" RENAME TO "daily_prices_cropname_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."users_cropnames_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" TYPE "public"."users_cropnames_enum_old"[] USING "cropNames"::"text"::"public"."users_cropnames_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "cropNames" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."users_cropnames_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_cropnames_enum_old" RENAME TO "users_cropnames_enum"`);
        await queryRunner.query(`CREATE TYPE "public"."crops_table_enum_old" AS ENUM('banana', 'dry_coconut', 'maize', 'sunflower', 'tender_coconut', 'turmeric')`);
        await queryRunner.query(`ALTER TABLE "crops" ALTER COLUMN "table" TYPE "public"."crops_table_enum_old" USING "table"::"text"::"public"."crops_table_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."crops_table_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."crops_table_enum_old" RENAME TO "crops_table_enum"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "quantity"`);
        await queryRunner.query(`ALTER TABLE "crops" ADD "quantity" integer`);
        await queryRunner.query(`CREATE TYPE "public"."crops_cropname_enum_old" AS ENUM('Banana', 'Dry Coconut', 'Maize', 'Sunflower', 'Tender Coconut', 'Turmeric')`);
        await queryRunner.query(`ALTER TABLE "crops" ALTER COLUMN "cropName" TYPE "public"."crops_cropname_enum_old" USING "cropName"::"text"::"public"."crops_cropname_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."crops_cropname_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."crops_cropname_enum_old" RENAME TO "crops_cropname_enum"`);
        await queryRunner.query(`ALTER TABLE "po" DROP COLUMN "price"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "jowarVariety"`);
        await queryRunner.query(`DROP TYPE "public"."crops_jowarvariety_enum"`);
        await queryRunner.query(`ALTER TABLE "crops" DROP COLUMN "moisturePercent"`);
    }

}
