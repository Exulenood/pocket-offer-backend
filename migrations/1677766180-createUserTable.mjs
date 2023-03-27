export async function up(sql) {
  await sql`
  CREATE TABLE users(
    id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_name varchar(50) NOT NULL UNIQUE,
    password_hash varchar(70) NOT NULL,
    user_company_name_l1 varchar(100),
    user_company_name_l2 varchar(100),
    user_first_name varchar(80),
    user_last_name varchar(80),
    user_addr_street varchar(80),
    user_addr_house_no varchar(80),
    user_addr_l2 varchar(80),
    user_post_code varchar(8),
    user_location varchar(30),
    user_logo_file varchar(80),
    user_email varchar(80),
    user_phone varchar(80)
  )`;
}

export async function down(sql) {
  await sql`
  DROP TABLE users
`;
}
