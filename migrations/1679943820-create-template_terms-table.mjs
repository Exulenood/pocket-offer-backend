export async function up(sql) {
  await sql`
  CREATE TABLE template_terms(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    term_title varchar(70),
    term_upper varchar(300),
    term_lower varchar(300),
    lead_time varchar(70)
  )`;
}

export async function down(sql) {
  await sql`
  DROP TABLE template_terms
`;
}
