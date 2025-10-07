# Training Management System (TMS)

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up database:
   ```bash
   # Update apps/backend/.env with your Mac username
   # Then create database
   createdb tms_dev
   ```

3. Initialize database:
   ```bash
   cd apps/backend
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   cd ../..
   ```

4. Start development:
   ```bash
   pnpm dev
   ```

Visit http://localhost:3000

## Project Structure

- `apps/backend` - Express.js API server
- `apps/frontend` - React frontend application
- `packages/shared` - Shared types and utilities

## Next Steps

1. Copy code from Claude's artifacts into the empty source files
2. Update DATABASE_URL in apps/backend/.env with your Mac username
3. Follow the setup steps above

See full documentation in the artifacts provided by Claude.
