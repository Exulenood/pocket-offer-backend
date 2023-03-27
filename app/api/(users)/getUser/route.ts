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
import { getUserDatabyId, UserData } from '../../../../database/usersDtb';
import {
  createTokenFromSecret,
  validateTokenWithSecret,
} from '../../../../utils/csrf';

const getUserSchema = z.object({
  getDetails: z.string(),
});

export async function POST(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = getUserSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'User Log / Get Request Denied: missing at least one key in auth request header',
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
    console.log('User Log / Get Request Denied: Auth request header empty');
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
    console.log('User Log / Get Request Denied: invalid token');
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
    console.log('User Log / Get Request Denied: invalid csrf token');
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

  const userData: UserData = await getUserDatabyId(session.userId);

  return NextResponse.json({
    userData: userData,
  });
}
