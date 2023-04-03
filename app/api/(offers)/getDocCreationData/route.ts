/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ClientData, getClientDataById } from '../../../../database/clientsDtb';
import {
  getClientIdbyOfferDefId,
  getCreationDateByOfferDefinedId,
  getPositionsByOfferDefIdAndUserId,
} from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import {
  getTermByUserId,
  GetTermsReturn,
} from '../../../../database/termsTemplatesDtb';
import { getUserDatabyId, UserData } from '../../../../database/usersDtb';
import { validateTokenWithSecret } from '../../../../utils/csrf';

const getDocCreationDataSchema = z.object({
  offerDefinedId: z.string(),
  termsId: z.string(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = getDocCreationDataSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Offer Log / Get Request Denied: missing at least one key in auth request header',
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
    console.log('Offer Log / Get Request Denied: Auth request header empty');
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
    console.log('Offer Log / Get Request Denied: invalid token');
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
    console.log('Offer Log / Get Request Denied: invalid csrf token');
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

  const clientId = await getClientIdbyOfferDefId(result.data.offerDefinedId);

  const client: ClientData = await getClientDataById(clientId.clientId);

  const user: UserData = await getUserDatabyId(session.userId);

  const offerPositions = await getPositionsByOfferDefIdAndUserId(
    result.data.offerDefinedId,
    session.userId,
  );

  const creationDate = await getCreationDateByOfferDefinedId(
    result.data.offerDefinedId,
  );

  const terms: GetTermsReturn = await getTermByUserId(session.userId);

  return NextResponse.json({
    client: client,
    user: user,
    offerPositions: offerPositions,
    terms: terms,
    creationDate: creationDate.toChar,
  });
}
