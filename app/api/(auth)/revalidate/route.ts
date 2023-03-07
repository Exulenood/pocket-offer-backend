import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import { createUser, getUserAndIdByName } from '../../../../database/usersDtb';
import { createTokenFromSecret } from '../../../../utils/csrf';

const revalidationObject = z.object({
  token: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = revalidationObject.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.issues,
      },
      { status: 400 },
    );
  }
  if (!result.data.token) {
    console.log('Revalidation Log / Denied: missing token');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Denied: missing token',
          },
        ],
      },
      { status: 400 },
    );
  }

  const session = await getValidSessionByToken(result.data.token);

  if (!session) {
    console.log('Revalidation Log / Denied: invalid token');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Denied: invalid token',
          },
        ],
      },
      { status: 401 },
    );
  }

  console.log(
    `Revalidation Log / Session Id ${session.id} successfully revalidated`,
  );

  const cToken = createTokenFromSecret(session.csrfSecret);

  return NextResponse.json({
    validation: { cToken: cToken },
  });
}
