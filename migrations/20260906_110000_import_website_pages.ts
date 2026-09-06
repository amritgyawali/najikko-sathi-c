import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { importRoutePages, restoreRoutePages, routePages } from '../cms/site-pages'

/**
 * Puts the website's own pages into the dashboard.
 *
 * Every built-in page - Home, Services, Our Work, Contact, About and the
 * discipline pages - could already be imported by hand, from the button on the
 * dashboard home or with `npm run sync:pages`. That left an owner looking at a
 * dashboard where the front page was the only page they could change, with no
 * obvious reason why. This does the import once, on the deploy that carries it,
 * so all of them are simply there to edit.
 *
 * Nothing on the website changes: each document is created holding exactly the
 * copy its page already shows. Deleting one still puts that page back to the
 * copy it ships with, and this migration will not recreate it - it runs once.
 *
 * A page that cannot be imported (an address already taken by a page built in
 * the dashboard, say) is reported and skipped rather than failing the deploy:
 * the site runs perfectly well on the copy it ships with, and the button on the
 * dashboard is still there to try again.
 */

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const report = await importRoutePages(payload, undefined, req);

  if (report.imported.length > 0) {
    payload.logger.info(`[pages] now editable in the dashboard: ${report.imported.join(', ')}`);
  }
  if (report.alreadyThere.length > 0) {
    payload.logger.info(`[pages] already in the dashboard: ${report.alreadyThere.join(', ')}`);
  }
  for (const failure of report.failed) {
    payload.logger.error(`[pages] could not add ${failure.path}: ${failure.reason}`);
  }
}

/**
 * Rolling back takes the pages out of the dashboard again, which puts every one
 * of them back to the copy it ships with - including any wording an editor has
 * since changed. That is what rolling this back means, so it is the same thing
 * the "restore" button does, applied to all of them.
 */
export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const report = await restoreRoutePages(payload, routePages.map((page) => page.path), req);

  if (report.restored.length > 0) {
    payload.logger.info(`[pages] back to the copy they ship with: ${report.restored.join(', ')}`);
  }
  for (const failure of report.failed) {
    payload.logger.error(`[pages] could not restore ${failure.path}: ${failure.reason}`);
  }
}
