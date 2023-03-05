import { sql } from '../connect';

type User = {
  id: number;
  userName: string;
  passwordHash: string;
};

export async function getUserByName(userName: string) {
  const [user] = await sql<User[]>`
    SELECT
      *
    FROM
      users
    WHERE
      user_name=${userName}
    `;
  return user;
}

export async function createUser(userName: string, passwordHash: string) {
  const [user] = await sql<{ id: number; userName: string }[]>`
    INSERT INTO users
      (user_name, password_hash)
    VALUES
      (${userName}, ${passwordHash})
    RETURNING
      id,
      user_name
    `;
  return user;
}

export async function createUserDtbClients(userName: string, id: number) {
  await sql`
    CREATE TABLE clients_1 (
      id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (START WITH 99000001 INCREMENT BY 1),
      client_company varchar(80),
      client_first_name varchar(80) NOT NULL,
      client_last_name varchar(80) NOT NULL,
      client_addr_street varchar(80) NOT NULL,
      client_addr_house_no varchar(80) NOT NULL,
      client_addr_l2 varchar(80),
      client_addr_post_code varchar(70) NOT NULL,
      client_addr_location varchar(70) NOT NULL
    )
    `;
  return `Client Database of User ${userName} created`;
}
