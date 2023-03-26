export async function up(sql) {
  await sql`
  CREATE TABLE template_items(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    item_id varchar(70),
    item_title varchar(70),
    item_text varchar(70),
    item_sales_price decimal,
    item_cost decimal
  )`;
}

export async function down(sql) {
  await sql`
  DROP TABLE template_items
`;
}
