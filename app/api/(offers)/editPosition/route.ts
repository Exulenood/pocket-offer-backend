/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ClientToCreate,
  createClient,
  getClientIdByClientDefinedId,
} from '../../../../database/clientsDtb';
import {
  createOffer,
  getOfferIdByOfferDefinedId,
  getPositionIdByOfferRowId,
  OfferToCreate,
  PositionToEdit,
  updatePositionByOfferRowId,
} from '../../../../database/offersDtb';
import { getValidSessionByToken } from '../../../../database/sessionsDtb';
import { validateTokenWithSecret } from '../../../../utils/csrf';

const editPositionSchema = z.object({
  offerRowId: z.string(),
  positionId: z.string(),
  quantity: z.number(),
  quantityUnit: z.string(),
  positionIsOptional: z.boolean(),
  itemId: z.nullable(z.string()),
  itemTitle: z.string(),
  itemText: z.string(),
  itemSalesPrice: z.number(),
  itemSalesDiscount: z.number(),
  itemCost: z.number(),
  itemIsModified: z.boolean(),
});

export async function PUT(request: NextRequest) {
  const getKeys = await request.headers.get('Authorization');
  const body = await request.json();
  const result = editPositionSchema.safeParse(body);

  let token;
  let csrfToken;

  if (getKeys) {
    if (JSON.parse(getKeys).keyA && JSON.parse(getKeys).keyB) {
      token = JSON.parse(getKeys).keyA;
      csrfToken = JSON.parse(getKeys).keyB;
    } else {
      console.log(
        'Client Log / Creation denied: missing at least one key in auth request header',
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
    console.log('Client Log  / Creation denied: Auth request header empty');
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
    console.log('Client Log  / Creation denied: invalid token');
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
    console.log('Client Log  / Creation denied: invalid csrf token');
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
  const sentPositionId = await getPositionIdByOfferRowId(
    result.data.offerRowId,
  );

  if (!sentPositionId) {
    console.log('Offer Log  / Editing denied: Position doesn`t exist');
    return NextResponse.json(
      {
        errors: [
          {
            message: 'Position doesnt exist',
          },
        ],
      },
      { status: 400 },
    );
  }

  const positionData: PositionToEdit = {
    offerRowId: result.data.offerRowId,
    positionId: result.data.positionId,
    quantity: result.data.quantity,
    quantityUnit: result.data.quantityUnit,
    positionIsOptional: result.data.positionIsOptional,
    itemId: result.data.itemId,
    itemTitle: result.data.itemTitle,
    itemText: result.data.itemText,
    itemSalesPrice: result.data.itemSalesPrice,
    itemSalesDiscount: result.data.itemSalesDiscount,
    itemCost: result.data.itemCost,
    itemIsModified: result.data.itemIsModified,
  };

  const updatedPosition = await updatePositionByOfferRowId(positionData);

  console.log(
    `Offer Log / Position ${sentPositionId.positionId} (now ${updatedPosition.positionId}) of offer ${updatedPosition.offerDefinedId} for User ${session.userId} has been edited`,
  );

  return NextResponse.json({
    isEdited: true,
    offerDefinedId: updatedPosition.offerDefinedId,
  });
}
