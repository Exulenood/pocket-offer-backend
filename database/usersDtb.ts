import { sql } from '../connect';

type User = {
  id: number;
  userName: string;
  passwordHash: string;
};

export async function getUserByNameInclPasswordHash(userName: string) {
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

export async function getUserAndIdByName(userName: string) {
  const [user] = await sql<{ id: number; userName: string }[]>`
    SELECT
      id,
      user_name
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
