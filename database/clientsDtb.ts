import { sql } from '../connect';

export type ClientToCreate = {
  userId: number;
  clientDefinedId: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddrStreet: string;
  clientAddrHouseNo: string;
  clientAddrL2: any;
  clientAddrPostCode: string;
  clientAddrLocality: string;
};

type ClientExisting = {
  id: string;
  userId: number;
  clientDefinedId: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddrStreet: string;
  clientAddrHouseNo: string;
  clientAddrL2: any;
  clientAddrPostCode: string;
  clientAddrLocality: string;
};

export async function getMaxClientDefinedIDbyUserId(userId: number) {
  const [clientDefinedId] = await sql<{ max: number }[]>`
  SELECT MAX (client_defined_id)
  FROM
    clients
    WHERE
    user_id=${userId}
    `;
  return clientDefinedId;
}

export async function getClientsByUserId(
  userId: number,
  clientDefinedId: string | undefined,
  clientLastName: string | undefined,
) {
  if (clientDefinedId) {
    const definedId = parseInt(clientDefinedId);
    const client = await sql`
    SELECT
      *
    FROM
      clients
    WHERE
      user_id=${userId}
    AND
      client_defined_id=${definedId}
    `;
    return client;
  }
  if (clientLastName) {
    const client = await sql`
    SELECT
      *
    FROM
      clients
    WHERE
      user_id=${userId}
    AND
    client_last_name=${clientLastName}
    `;
    return client;
  }

  const client = await sql`
    SELECT
      *
    FROM
      clients
    WHERE
      user_id=${userId}
    `;
  return client;
}

export async function createClient(clientData: ClientToCreate) {
  const [client] = await sql<ClientExisting[]>`
    INSERT INTO clients
      (user_id, client_defined_id, client_first_name,client_last_name,client_addr_street,client_addr_house_no,client_addr_l2,client_addr_post_code,client_addr_locality)
    VALUES
      (${clientData.userId},${clientData.clientDefinedId}, ${clientData.clientFirstName}, ${clientData.clientLastName}, ${clientData.clientAddrStreet}, ${clientData.clientAddrHouseNo}, ${clientData.clientAddrL2}, ${clientData.clientAddrPostCode}, ${clientData.clientAddrLocality})
    RETURNING
      *
    `;
  return client;
}
