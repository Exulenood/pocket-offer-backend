/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUser, getUserAndIdByName } from '../../../../database/usersDtb';

const userLoginSchema = z.object({
  userName: z.string(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = userLoginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.issues,
      },
      { status: 400 },
    );
  }
  if (!result.data.userName || !result.data.password) {
    console.log('Registration Log / Denied: missing user or password');
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
  const user = await getUserAndIdByName(result.data.userName);

  if (user) {
    console.log('Registration Log / Denied: username already exists');
    return NextResponse.json(
      {
        errors: [
          {
            message:
              'Sorry! This username already exists - please choose another!',
          },
        ],
      },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(result.data.password, 12);

  const newUser = await createUser(result.data.userName, passwordHash);

  console.log(`Registration Log / User ${newUser.userName} was created`);

  return NextResponse.json({ user: { username: newUser.userName } });
}
