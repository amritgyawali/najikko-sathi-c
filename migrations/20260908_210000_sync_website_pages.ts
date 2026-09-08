import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { ensureRoutePagesImported } from '../cms/site-pages'

/**
 * Puts any of the website's pages that are still missing into the dashboard.
 *
 * 20260906_110000_import_website_pages did this once, and two migrations after
 * it repeated it as they added sections. Every page added to the website since
 * the last of those has therefore relied on someone pressing "add the website's
 * pages" on the dashboard home, or running `npm run sync:pages` - and a page
 * nobody thought to import is a page an owner cannot edit, with nothing on the
 * website to say why.
 *
 * This closes that gap for the pages the site has today, and is the migration
 * to copy the next time one is added: importing is per page and skips the ones
 * already there, so running it again costs a query and changes nothing.
 *
 * Nothing on the website changes either way. A page is created holding exactly
 * the copy it already shows, so a visitor sees the same page before and after;
 * a page an editor has already changed is left completely alone.
 */

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const report = await ensureRoutePagesImported(payload, req)
  if (!report) return

  if (report.imported.length > 0) {
    payload.logger.info(`[pages] now editable in the dashboard: ${report.imported.join(', ')}`)
  }
  if (report.alreadyThere.length > 0) {
    payload.logger.info(`[pages] already in the dashboard: ${report.alreadyThere.join(', ')}`)
  }
  for (const failure of report.failed) {
    payload.logger.error(`[pages] could not add ${failure.path}: ${failure.reason}`)
  }
}

/**
 * Rolling back does nothing, deliberately.
 *
 * This migration only fills in pages that were missing, and it cannot tell
 * afterwards which of them it created. Taking pages back out would throw away
 * whatever an editor has written into them since, which is far worse than
 * leaving a page in a dashboard that is happy to have it. Rolling the import
 * back altogether is what 20260906_110000_import_website_pages.down is for.
 */
export async function down({ payload }: MigrateDownArgs): Promise<void> {
  payload.logger.info('[pages] leaving the website\'s pages in the dashboard; nothing to undo.')
}
