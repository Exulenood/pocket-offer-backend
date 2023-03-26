/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { useState } from 'react';
import { z } from 'zod';
import { deleteTemplateItemByRowIdAndUserId } from '../../../../database/itemTemplatesDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import {
  createTokenFromSecret,
  validateTokenWithSecret,
} from '../../../../utils/csrf';

const deleteTemplateItemSchema = z.object({
  templateItemRowId: z.number(),
});

export async function DELETE(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = deleteTemplateItemSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Template Log / Deletion denied: missing at least one key in auth request header',
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
    console.log('Template Log  / Deletion denied: Auth request header empty');
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
    console.log('Template Log  / Deletion denied: invalid token');
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
    console.log('Template Log  / Deletion denied: invalid csrf token');
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

  const deletePosition = await deleteTemplateItemByRowIdAndUserId(
    result.data.templateItemRowId,
    session.userId,
  );
  console.log(deletePosition);

  return NextResponse.json({
    isdeleted: true,
  });
}
