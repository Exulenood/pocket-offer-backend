/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { useState } from 'react';
import { z } from 'zod';
import {
  ClientToCreate,
  createClient,
  getClientsByUserId,
  getMaxClientDefinedIDbyUserId,
} from '../../../../database/clientsDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import {
  createTokenFromSecret,
  validateTokenWithSecret,
} from '../../../../utils/csrf';

const getClientSchema = z.object({
  clientDefinedId: z.string().optional(),
  clientLastName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = getClientSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Client creation Log / Denied: missing at least one key in auth request header',
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
    console.log('Client creation Log / Denied: Auth request header empty');
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
    console.log('Client creation Log / Denied: invalid token');
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

  const isCsrfValid = await validateTokenWithSecret(
    session.csrfSecret,
    csrfToken,
  );

  if (!isCsrfValid) {
    console.log('Client creation Log / Denied: invalid csrf token');
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

  const clientDefinedIdFilterValue = result.data.clientDefinedId;
  const clientLastNameFilterValue = result.data.clientLastName;
  const maxClientDefinedId = await getMaxClientDefinedIDbyUserId(
    session.userId,
  );
  const clients = await getClientsByUserId(
    session.userId,
    clientDefinedIdFilterValue,
    clientLastNameFilterValue,
  );

  // console.log(`ClientDefId Filter: ${clientDefinedIdFilterValue}`);
  // console.log(`LastName Filter: ${clientLastNameFilterValue}`);
  // console.log(`MaxclientDefId: ${maxClientDefinedId.max}`);

  return NextResponse.json({
    clients: clients,
    maxClientDefinedId: maxClientDefinedId.max,
  });
}
