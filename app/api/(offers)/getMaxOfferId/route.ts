/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMaxOfferDefinedIDbyUserId } from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import { validateTokenWithSecret } from '../../../../utils/csrf';

const getClientSchema = z.object({
  request: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = getClientSchema.safeParse(body);

  if (result) {
    console.log(result);
  }

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
    console.log('Client Log / Get Request Denied: invalid csrf token');
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

  const maxClientDefinedId = await getMaxOfferDefinedIDbyUserId(session.userId);

  return NextResponse.json({
    offer: {
      maxClientDefinedId: maxClientDefinedId.max,
    },
  });
}
