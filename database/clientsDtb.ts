import { sql } from '../connect';

export type ClientToCreate = {
  userId: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddrStreet: string;
  clientAddrHouseNo: string;
  clientAddrl2: any;
  clientAddrPostCode: string;
  clientAddrLocality: string;
};

type ClientCreated = {
  id: string;
  userId: number;
  clientFirstName: string;
  clientLastName: string;
  clientAddrStreet: string;
  clientAddrHouseNo: string;
  clientAddrl2: any;
  clientAddrPostCode: string;
  clientAddrLocality: string;
};

export async function createClient(clientData: ClientToCreate) {
  const [client] = await sql<ClientCreated[]>`
    INSERT INTO clients
      (user_id, client_first_name,client_last_name,client_addr_street,client_addr_house_no,client_addr_l2,client_addr_post_code,client_addr_locality)
    VALUES
      (${clientData.userId}, ${clientData.clientFirstName}, ${clientData.clientLastName}, ${clientData.clientAddrStreet}, ${clientData.clientAddrHouseNo}, ${clientData.clientAddrl2}, ${clientData.clientAddrPostCode}, ${clientData.clientAddrLocality})
    RETURNING
      *
    `;
  return client;
}
