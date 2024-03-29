/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ClientToCreate,
  createClient,
  getClientIdByClientDefinedId,
} from '../../../../database/clientsDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import { validateTokenWithSecret } from '../../../../utils/csrf';

const addClientSchema = z.object({
  clientDefinedId: z.string(),
  clientFirstName: z.string(),
  clientLastName: z.string(),
  clientAddrStreet: z.string(),
  clientAddrHouseNo: z.string(),
  clientAddrL2: z.string().optional(),
  clientAddrPostCode: z.string(),
  clientAddrLocality: z.string(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = addClientSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Client Log / Creation denied: missing at least one key in auth request header',
      );
      return NextResponse.json(
        {
          errors: [
            {
              message: 'Denied: failed authenication',
            },
          ],
        },
        { status: 401 },
      );
    }
  } else {
    console.log('Client Log  / Creation denied: Auth request header empty');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Denied: failed authenication',
          },
        ],
      },
      { status: 401 },
    );
  }

  const session = await getValidSessionByToken(token);

  if (!session) {
    console.log('Client Log  / Creation denied: invalid token');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Denied: failed authenication',
          },
        ],
      },
      { status: 401 },
    );
  }

  const isCsrfValid = validateTokenWithSecret(session.csrfSecret, csrfToken);

  if (!isCsrfValid) {
    console.log('Client Log  / Creation denied: invalid csrf token');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Denied: failed authenication',
          },
        ],
      },
      { status: 401 },
    );
  }

  if (!result.success) {
    console.log(result.error.issues);
    return NextResponse.json(
      {
        error: result.error.issues,
      },
      { status: 400 },
    );
  }
  const doesDefIdExist = await getClientIdByClientDefinedId(
    result.data.clientDefinedId,
  );

  if (doesDefIdExist) {
    console.log('Client Log  / Creation denied: Defined ID already exists')
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Existing Defined Id',
          },
        ],
      },
      { status: 400 },
    );
  }

  const clientData: ClientToCreate = {
    userId: session.userId,
    clientDefinedId: parseInt(result.data.clientDefinedId),
    clientFirstName: result.data.clientFirstName,
    clientLastName: result.data.clientLastName,
    clientAddrStreet: result.data.clientAddrStreet,
    clientAddrHouseNo: result.data.clientAddrHouseNo,
    clientAddrL2: result.data.clientAddrL2,
    clientAddrPostCode: result.data.clientAddrPostCode,
    clientAddrLocality: result.data.clientAddrLocality,
  };

  const newClient = await createClient(clientData);

  console.log(
    `Client Log / Client ${newClient.id} has been successfully created for User ${session.userId}`,
  );

  return NextResponse.json({
    client: {
      clientId: newClient.id,
      clientDefinedId: newClient.clientDefinedId,
      clientFirstName: newClient.clientFirstName,
      clientLastName: newClient.clientLastName,
      clientAddrPostCode: newClient.clientAddrPostCode,
      clientAddLocality: newClient.clientAddrLocality,
    },
  });
}
