export async function up(sql) {
  await sql`
  CREATE TABLE offers(
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 11000001),
    user_id integer REFERENCES users(id) ON DELETE CASCADE,
    client_id bigint REFERENCES clients(id) ON DELETE CASCADE,
    offer_defined_id integer NOT NULL,
    offer_title varchar (50) NOT NULL,
    position_id varchar (20) NOT NULL,
    quantity integer,
    quantity_unit varchar(20),
    position_is_optional boolean NOT NULL,
    item_id varchar (50),
    item_title varchar (50),
    item_text varchar (280),
    item_sales_price decimal,
    item_sales_discount decimal,
    item_cost decimal,
    item_is_modified boolean,
    created_at timestamp
  )`;
}

export async function down(sql) {
  await sql`
  DROP TABLE offers
`;
}
