import { router } from './_core/trpc';
import { catalogueRouter } from './catalogue/router';

export const appRouter = router({
  catalogue: catalogueRouter,
});

export type AppRouter = typeof appRouter;
