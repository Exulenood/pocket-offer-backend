export async function up(sql) {
  await sql`
  CREATE TABLE clients(
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 23000001),
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    client_first_name varchar(50) NOT NULL,
    client_last_name varchar(50) NOT NULL,
    client_addr_street varchar(50) NOT NULL,
    client_addr_house_no varchar(20) NOT NULL,
    client_addr_l2 varchar(50),
    client_addr_post_code varchar(20) NOT NULL,
    client_addr_locality varchar(50) NOT NULL
  )`;
}

export async function down(sql) {
  await sql`
  DROP TABLE clients
`;
}
