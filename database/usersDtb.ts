import { sql } from '../connect';

type UserLogData = {
  id: number;
  userName: string;
  passwordHash: string;
};

export type UserData = {
  userCompanyNameL1: string;
  userCompanyNameL2: string;
  userFirstName: string;
  userLastName: string;
  userAddrStreet: string;
  userAddrHouseNo: string;
  userAddrL2: string;
  userPostCode: string;
  userLocation: string;
  userEmail: string;
  userPhone: string;
};

export async function getUserByNameInclPasswordHash(userName: string) {
  const [user] = await sql<UserLogData[]>`
    SELECT
    id,
    user_name,
    password_hash
    FROM
      users
    WHERE
      user_name=${userName}
    `;
  return user;
}

export async function getUserDatabyId(userId: number) {
  const [user] = await sql<UserData[]>`
    SELECT
      user_company_name_l1,
      user_company_name_l2,
      user_first_name,
      user_last_name,
      user_addr_street,
      user_addr_house_no,
      user_addr_l2,
      user_post_code,
      user_location,
      user_email,
      user_phone
    FROM
      users
    WHERE
      id=${userId}
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

export async function updateUserById(userId: number, userData: UserData) {
  await sql`
    UPDATE users
    SET user_company_name_l1 = ${userData.userCompanyNameL1},
        user_company_name_l2 = ${userData.userCompanyNameL2},
        user_first_name = ${userData.userFirstName},
        user_last_name = ${userData.userLastName},
        user_addr_street = ${userData.userAddrStreet},
        user_addr_house_no = ${userData.userAddrHouseNo},
        user_addr_l2 = ${userData.userAddrL2},
        user_post_code = ${userData.userPostCode},
        user_location = ${userData.userLocation},
        user_email = ${userData.userEmail},
        user_phone = ${userData.userPhone}
  	WHERE
        id=${userId}
    `;
  return `User Log / Data of user ${userId} has been updated successfully `;
}
