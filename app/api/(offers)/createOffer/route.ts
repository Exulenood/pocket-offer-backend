/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { useState } from 'react';
import { z } from 'zod';
import { ClientToCreate, createClient } from '../../../../database/clientsDtb';
import {
  createOffer,
  getOfferIdByOfferDefinedId,
  OfferToCreate,
} from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import {
  createTokenFromSecret,
  validateTokenWithSecret,
} from '../../../../utils/csrf';

const addOfferSchema = z.object({
  offerTitle: z.string(),
  offerDefinedId: z.string(),
  clientId: z.string(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = addOfferSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Offer Log / Creation denied: missing at least one key in auth request header',
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
    console.log('Offer Log  / Creation denied: Auth request header empty');
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
    console.log('Offer Log  / Creation denied: invalid token');
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
    console.log('Offer Log  / Creation denied: invalid csrf token');
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
  const doesDefIdExist = await getOfferIdByOfferDefinedId(
    result.data.offerDefinedId,
  );

  if (doesDefIdExist) {
    console.log('Offer Log  / Creation denied: Defined ID already exists');
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

  const offerData: OfferToCreate = {
    userId: session.userId,
    offerTitle: result.data.offerTitle,
    offerDefinedId: parseInt(result.data.offerDefinedId),
    clientId: parseInt(result.data.clientId),
  };

  const newOffer = await createOffer(offerData);

  console.log(
    `Offer Log / Offer ${newOffer.id} has been successfully created for Client ${result.data.clientId} (User: ${session.userId})`,
  );

  return NextResponse.json({
    offer: {
      newOffer: newOffer.id,
    },
  });
}
