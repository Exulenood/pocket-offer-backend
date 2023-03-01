export async function up(sql) {
  await sql`
  CREATE TABLE testTable(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    test_value_A varchar(30) NOT NULL,
    test_value_B integer NOT NULL
  )`;
}

export async function down(sql) {
  await sql`
    DROP TABLE testTable
  `;
}
