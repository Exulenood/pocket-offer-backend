import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createSession,
  deleteSessionsByUserId,
} from '../../../../database/sessionsDtb';
import { getUserByNameInclPasswordHash } from '../../../../database/usersDtb';
import { createCsrfSecret } from '../../../../utils/csrf';

const userLoginSchema = z.object({
  userName: z.string(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = userLoginSchema.safeParse(body);

  if (!result.success) {
    console.log(result.error.issues);
    return NextResponse.json(
      {
        error: result.error.issues,
      },
      { status: 400 },
    );
  }

  if (!result.data.userName || !result.data.password) {
    console.log('Login Log / Denied: missing user or password');
    return NextResponse.json(
      {
        errors: [
          {
            message:
              'Please check again: \n Username and/or password is missing!',
          },
        ],
      },
      { status: 400 },
    );
  }
  const userInclPasswordhash = await getUserByNameInclPasswordHash(
    result.data.userName,
  );

  if (!userInclPasswordhash) {
    console.log('Login Log / Denied: username doesnt exist');
    return NextResponse.json(
      {
        errors: [
          {
            message: `Invalid username and/or password! \n Please check spelling or sign up!`,
          },
        ],
      },
      { status: 401 },
    );
  }

  const isPasswordCorrect: boolean = await bcrypt.compare(
    result.data.password,
    userInclPasswordhash.passwordHash,
  );

  if (!isPasswordCorrect) {
    console.log('Login Log / Denied: invalid password');
    return NextResponse.json(
      {
        errors: [
          {
            message: `Invalid username and/or password! \n Please check spelling or sign up!`,
          },
        ],
      },
      { status: 401 },
    );
  }

  const clearedSessions = await deleteSessionsByUserId(userInclPasswordhash.id);
  console.log(
    `Login Log / ${clearedSessions} after leaving without logging out`,
  );

  const token = crypto.randomBytes(60).toString('base64');
  const csrfSecret = createCsrfSecret();

  const session = await createSession(
    token,
    csrfSecret,
    userInclPasswordhash.id,
  );

  console.log(
    `Login Log / User ${userInclPasswordhash.userName} successfully logged in`,
  );

  return NextResponse.json({
    user: { username: userInclPasswordhash.userName, token: session.token },
  });
}
