# Database Migrations Guide

This project uses TypeORM for database migrations. Here's how to work with migrations:

## Setup

The migration system is already configured with:
- Data source: `src/data-source.ts`
- Migrations directory: `src/migrations/`
- TypeORM CLI configured in `package.json`

## Available Commands

### Generate Migration
Generate a migration based on entity changes:
```bash
npm run migration:generate src/migrations/MigrationName
```

### Create Empty Migration
Create an empty migration file:
```bash
npm run migration:create src/migrations/MigrationName
```

### Run Migrations
Apply all pending migrations:
```bash
npm run migration:run
```

### Revert Last Migration
Revert the most recent migration:
```bash
npm run migration:revert
```

### Show Migration Status
View which migrations have been applied:
```bash
npm run migration:show
```

## Migration File Structure

Each migration file should follow this pattern:
```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationName1700000000000 implements MigrationInterface {
    name = 'MigrationName1700000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Migration logic here
        // Example: await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL PRIMARY KEY, "email" VARCHAR NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Rollback logic here
        // Example: await queryRunner.query(`DROP TABLE "users"`);
    }
}
```

## Best Practices

1. **Always test migrations** in a development environment first
2. **Include rollback logic** in the `down()` method
3. **Use descriptive names** for migration files
4. **Keep migrations small** and focused on one change
5. **Never modify existing migrations** that have been applied to production
6. **Use transactions** for complex migrations when possible

## Environment Variables

Make sure these environment variables are set:
- `DB_HOST`: Database host
- `DB_PORT`: Database port (default: 5432)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

## Example Workflow

1. Make changes to your entities
2. Generate migration: `npm run migration:generate src/migrations/AddUserTable`
3. Review the generated migration file
4. Run migration: `npm run migration:run`
5. Test your application

## Troubleshooting

- If migrations fail, check the database connection in `src/data-source.ts`
- Ensure all entities are properly imported in the data source
- Check that the migrations directory path is correct
- Verify that the database user has sufficient permissions 