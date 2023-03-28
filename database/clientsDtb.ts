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

export type ClientData = {
  clientDefinedId: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddrStreet: string;
  clientAddrHouseNo: string;
  clientAddrL2: any;
  clientAddrPostCode: string;
  clientAddrLocality: string;
};

type ClientDefIdAndNameReturn = {
  clientDefinedId: number;
  clientFirstName: string;
  clientLastName: string;
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

export async function getClientIdByClientDefinedId(clientDefinedId: string) {
  const [client] = await sql<{ id: string }[]>`
    SELECT
      id
    FROM
      clients
    WHERE
    client_defined_id=${clientDefinedId}
    `;
  return client;
}

export async function getClientDefIdAndNamebyId(clientId: string) {
  const [client] = await sql<ClientDefIdAndNameReturn[]>`
    SELECT
    client_defined_id,
    client_first_name,
    client_last_name
    FROM
      clients
    WHERE
    id=${clientId}
    `;
  return client;
}

export async function getClientDataById(clientId: number) {
  const [client] = await sql<ClientData[]>`
    SELECT
    client_defined_id,
    client_first_name,
    client_last_name,
    client_addr_street,
    client_addr_house_no,
    client_addr_l2,
    client_addr_post_code,
    client_addr_locality
    FROM
      clients
    WHERE
    id=${clientId}
    `;
  return client;
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
     clients.id,
     clients.client_defined_id,
     clients.client_first_name,
     clients.client_last_name,
     clients.client_addr_street,
     clients.client_addr_house_no,
     clients.client_addr_l2,
     clients.client_addr_post_code,
     clients.client_addr_locality
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
     clients.id,
     clients.client_defined_id,
     clients.client_first_name,
     clients.client_last_name,
     clients.client_addr_street,
     clients.client_addr_house_no,
     clients.client_addr_l2,
     clients.client_addr_post_code,
     clients.client_addr_locality
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
     clients.id,
     clients.client_defined_id,
     clients.client_first_name,
     clients.client_last_name,
     clients.client_addr_street,
     clients.client_addr_house_no,
     clients.client_addr_l2,
     clients.client_addr_post_code,
     clients.client_addr_locality
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

export async function deleteClientByIdAndUserId(id: string, userId: number) {
  await sql`
    DELETE FROM
      clients
    WHERE
      id=${id}
      AND
      user_id=${userId}
    `;
  return `Client Log / Client ${id} of User ${userId} has been successfully deleted`;
}
