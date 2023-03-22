/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { useState } from 'react';
import { z } from 'zod';
import {
  deletePositionByRowIdAndUserId,
  getAmountOfRowsByOfferDefinedId,
  getOfferDefIdByOfferRowId,
  resetPositionByOfferRowId,
} from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import {
  createTokenFromSecret,
  validateTokenWithSecret,
} from '../../../../utils/csrf';

const deletePositionSchema = z.object({
  offerRowId: z.string(),
});

export async function DELETE(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = deletePositionSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Client Log / Deletion denied: missing at least one key in auth request header',
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
    console.log('Client Log  / Deletion denied: Auth request header empty');
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
    console.log('Client Log  / Deletion denied: invalid token');
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
    console.log('Client Log  / Deletion denied: invalid csrf token');
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

  const offerDefinedId = await getOfferDefIdByOfferRowId(
    result.data.offerRowId,
  );

  const amountOfRows = await getAmountOfRowsByOfferDefinedId(
    offerDefinedId.offerDefinedId,
  );

  if (amountOfRows.count === '1') {
    const setbackPosition = await resetPositionByOfferRowId(
      result.data.offerRowId,
      session.userId,
    );
    console.log(setbackPosition);
  } else {
    const deletePosition = await deletePositionByRowIdAndUserId(
      result.data.offerRowId,
      session.userId,
    );
    console.log(deletePosition);
  }

  return NextResponse.json({
    isdeleted: true,
  });
}
