import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Sets the header menu to Home, Services, Our Work, Contact, About Us.
 *
 * The navbar is editable in the dashboard, so the code default alone would not
 * change a site whose CMS already holds the previous seven-item menu. This
 * rewrites the stored menu to match; Production, Training and Right Sanchar
 * keep their pages and are reached from Our Work.
 */

const menu = (items: [string, string][]) => sql.raw(`
  INSERT INTO "public"."navigation"
    ("cta_label", "cta_href", "cta_enabled", "show_utility_bar", "updated_at", "created_at")
  SELECT 'Start a conversation', '/contact', true, true, now(), now()
  WHERE NOT EXISTS (SELECT 1 FROM "public"."navigation");

  DELETE FROM "public"."navigation_items";

  INSERT INTO "public"."navigation_items" ("_order", "_parent_id", "id", "label", "href", "new_tab")
  SELECT item.ord, nav.id, gen_random_uuid()::text, item.label, item.href, false
  FROM "public"."navigation" nav
  CROSS JOIN (VALUES
    ${items.map(([label, href], index) => `(${index + 1}, '${label.replaceAll("'", "''")}', '${href}')`).join(",\n    ")}
  ) AS item(ord, label, href);
`);

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(menu([
    ["Home", "/"],
    ["Services", "/services"],
    ["Our Work", "/our-work"],
    ["Contact", "/contact"],
    ["About Us", "/about"],
  ]));
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(menu([
    ["Home", "/"],
    ["About Us", "/about"],
    ["Services", "/services"],
    ["Production", "/production"],
    ["Training", "/training"],
    ["Right Sanchar", "/right-sanchar"],
    ["Contact", "/contact"],
  ]));
}
