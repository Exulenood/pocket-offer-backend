import { sql } from '../connect';

export type OfferToCreate = {
  userId: number;
  offerTitle: string;
  offerDefinedId: number;
  clientId: number;
};

export type PositionToEdit = {
  offerRowId: string;
  positionId: string;
  quantity: number;
  quantityUnit: string;
  positionIsOptional: boolean;
  itemId: string | null;
  itemTitle: string;
  itemText: string;
  itemSalesPrice: number;
  itemSalesDiscount: number | null;
  itemCost: number;
  itemIsModified: boolean;
};

type PositionEditReturn = {
  id: string;
  offerDefinedId: number;
  positionId: string;
  itemTitle: string;
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
  itemId: string | undefined | null;
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

export async function getCreationDateByOfferDefinedId(offerDefinedId: string) {
  const [creationDate] = await sql`
  SELECT TO_CHAR((created_at)::DATE,'dd.mm.yyyy')
  FROM
    offers
  WHERE
    created_at = (
      SELECT MIN (created_at)
      FROM
      offers
      WHERE
      offer_defined_id=${offerDefinedId}
    )
    `;
  return creationDate;
}

export async function getPositionsByOfferDefIdAndUserId(
  offerDefinedId: string,
  userId: number,
) {
  const positions = await sql`
    SELECT
      offers.id,
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
      offers.item_is_modified
    FROM
      offers
    WHERE
      offer_defined_id=${offerDefinedId}
    AND
      user_id=${userId}
    ORDER BY
      position_id ASC
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

export async function getPositionIdByOfferRowId(offerRowId: string) {
  const [offerPositionId] = await sql<{ positionId: string }[]>`
    SELECT
      offers.position_id
    FROM
      offers
    WHERE
      id=${offerRowId}
    `;
  return offerPositionId;
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

export async function updatePositionByOfferRowId(positionData: PositionToEdit) {
  const [position] = await sql<PositionEditReturn[]>`
    UPDATE offers
    SET position_id = ${positionData.positionId},
        quantity = ${positionData.quantity},
        quantity_unit = ${positionData.quantityUnit},
        position_is_optional = ${positionData.positionIsOptional},
        item_id = ${positionData.itemId},
        item_title = ${positionData.itemTitle},
        item_text = ${positionData.itemText},
        item_sales_price = ${positionData.itemSalesPrice},
        item_sales_discount = ${positionData.itemSalesDiscount},
        item_cost = ${positionData.itemCost},
        item_is_modified = ${positionData.itemIsModified}
  	WHERE
        id=${positionData.offerRowId}
    RETURNING
      id,
      offer_defined_id,
      position_id,
      item_title
    `;
  return position;
}
