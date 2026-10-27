# AGENTS.md

## Project
SST v2 monorepo (notes app). pnpm workspaces (`packages/*`), TypeScript, deployed to AWS via `sst`.

## Layout
- `stacks/` - SST stack definitions (StorageStack, ApiStack, AuthStack, FrontendStack). `sst.config.ts` wires them in order: Storage -> Api -> Auth -> Frontend.
- `packages/core/` - Shared code (`src/dynamodb.ts`, `src/handler.ts`, `src/cost.ts`) + tests (`test/`). Uses `@notes/core`.
- `packages/functions/` - Lambda handlers (`src/create.ts`, `src/get.ts`, `src/list.ts`, `src/update.ts`, `src/delete.ts`, `src/billing.ts`) mapped in `stacks/ApiStack.ts`. Uses `@notes/functions`.
- `packages/frontend/` - React frontend app.

## Commands (repo root)
- `pnpm install` - Install dependencies
- `pnpm run dev` - `sst dev` (local dev with live AWS resources)
- `pnpm run build` - `sst build`
- `pnpm run deploy` - `sst deploy` (deploys all stacks)
- `pnpm run remove` - `sst remove`
- `pnpm run console` - `sst console`
- `pnpm run typecheck` - `tsc --noEmit` (root level)
- `pnpm run test` - `sst bind vitest run` (runs tests with SST bindings/env)

## Package-level commands
From `packages/core/` or `packages/functions/`:
- `pnpm test` - `sst bind vitest`
- `pnpm typecheck` - `tsc -noEmit`

## Architecture notes
- **Storage**: DynamoDB table `Notes` (PK `userId`, SK `noteId`) in `StorageStack`; S3 bucket `Uploads` with CORS for uploads.
- **API**: REST API in `ApiStack` with IAM auth (`authorizer: "iam"`) by default. Routes map to `packages/functions/src/*.main`. API functions get `table` and `STRIPE_SECRET_KEY` bound. `STRIPE_SECRET_KEY` is an SST `Config.Secret`.
- **Auth**: `AuthStack` sets up Cognito auth.
- **Frontend**: `FrontendStack` deploys frontend.

## Testing
- Tests use `vitest`. Core has unit test `packages/core/test/cost.test.ts`. Run from root with `sst bind` (needs SST context/bindings) - not plain `vitest` without bindings in this setup.
- When running tests that need AWS resource bindings, use `sst bind vitest ...` (root `test` script does this).
