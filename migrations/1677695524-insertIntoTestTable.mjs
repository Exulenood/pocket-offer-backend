export async function up(sql) {
  await sql`
    INSERT INTO testTable
      (test_value_A, test_value_B)
    VALUES
      ('me first Value',11111),
      ('me second Value',22222)
    `;
}
