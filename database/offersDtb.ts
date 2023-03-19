import { sql } from '../connect';

export type OfferToCreate = {
  userId: number;
  offerTitle: string;
  offerDefinedId: number;
  clientId: number;
};

export type PositionExisting = {
  id: string;
  clientId: number;
  offerDefinedId: number;
  offerTitle: string;
  positionId: string;
  quantity: number | undefined | null;
  quantityUnit: string | undefined | null;
  positionIsOptional: boolean;
  itemId: number | undefined | null;
  itemTitle: string | undefined | null;
  itemText: string | undefined | null;
  itemSalesPrice: number | undefined | null;
  itemSalesDiscount: number | undefined | null;
  itemCost: number | undefined | null;
  itemIsModified: boolean | undefined | null;
  createdAt: string;
};

export async function getMaxOfferDefinedIDbyUserId(userId: number) {
  const [offerDefinedId] = await sql<{ max: number }[]>`
  SELECT MAX (offer_defined_id)
  FROM
    offers
    WHERE
    user_id=${userId}
    `;
  return offerDefinedId;
}

export async function getPositionsByOfferDefIdAndUserId(
  offerDefinedId: string,
  userId: number,
) {
  const [positions] = await sql<PositionExisting[]>`
    SELECT
      offers.id
      offers.client_id,
      offers.offer_defined_id,
      offers.offer_title,
      offers.position_id,
      offers.quantity,
      offers.quantity_unit,
      offers.position_is_optional,
      offers.item_id,
      offers.item_title,
      offers.item_text,
      offers.item_sales_price,
      offers.item_sales_discount,
      offers.item_cost,
      offers.item_is_modified,
      offers.created_at
    FROM
      offers
    WHERE
    offer_defined_id=${offerDefinedId}
    AND
    user_id=${userId}
    `;
  return positions;
}

export async function getOfferIdByOfferDefinedId(offerDefinedId: string) {
  const [offer] = await sql<{ id: string }[]>`
    SELECT
      id
    FROM
      offers
    WHERE
    offer_defined_id=${offerDefinedId}
    `;
  return offer;
}

export async function createOffer(offerData: OfferToCreate) {
  const [offer] = await sql<{ id: string }[]>`
    INSERT INTO offers
      (user_id, client_id, offer_defined_id, offer_title,position_id,position_is_optional,item_text, created_at)
    VALUES
      (${offerData.userId},${offerData.clientId},${offerData.offerDefinedId},${offerData.offerTitle},'10',false,'Press to edit the first item',current_date)
    RETURNING
      id
    `;
  return offer;
}
