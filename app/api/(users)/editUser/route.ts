/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createOffer,
  getOfferIdByOfferDefinedId,
  getPositionIdByOfferRowId,
  OfferToCreate,
  PositionToEdit,
  updatePositionByOfferRowId,
} from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import { updateUserById, UserData } from '../../../../database/usersDtb';
import { validateTokenWithSecret } from '../../../../utils/csrf';

const editUserSchema = z.object({
  userCompanyNameL1: z.string(),
  userCompanyNameL2: z.string(),
  userFirstName: z.string(),
  userLastName: z.string(),
  userAddrStreet: z.string(),
  userAddrHouseNo: z.string(),
  userAddrL2: z.string(),
  userPostCode: z.string(),
  userLocation: z.string(),
  userEmail: z.string(),
  userPhone: z.string(),
});

export async function PUT(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = editUserSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'User Log / Creation denied: missing at least one key in auth request header',
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
    console.log('User Log  / Creation denied: Auth request header empty');
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
    console.log('User Log  / Creation denied: invalid token');
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
    console.log('User Log  / Creation denied: invalid csrf token');
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

  const userData: UserData = result.data;

  const updatedPosition = await updateUserById(session.userId, userData);

  console.log(updatedPosition);

  return NextResponse.json({
    isEdited: true,
  });
}
