import { FEATURE_GROUPS, FEATURES, packageStats, products } from '@www/compare/matrix';

// required for `output: 'export'` - emitted as a static file at build time
export const dynamic = 'force-static';

/**
 * The comparison data as JSON, for anyone who wants to reuse or check it.
 */
export function GET() {
  return Response.json({
    description:
      'Feature, licensing, pricing and framework data for Infinite Table and other data grids. Every competitor claim has a source URL; see lastVerified per product.',
    source:
      'https://github.com/infinite-table/infinite-react/blob/master/www/src/compare/matrix.ts',
    corrections:
      'https://github.com/infinite-table/infinite-react/issues/new?template=compare_page_correction.md',
    features: FEATURES,
    featureGroups: FEATURE_GROUPS,
    products,
    packageStats,
  });
}
