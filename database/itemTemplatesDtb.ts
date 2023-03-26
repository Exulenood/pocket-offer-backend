import { sql } from '../connect';

export type GetItemsReturn = {
  itemId: string;
  itemTitle: string;
  itemText: string;
  itemSalesPrice: number;
  itemCost: number;
};

export type ItemToAdd = {
  userId: number;
  itemId: string;
  itemTitle: string;
  itemText: string;
  itemSalesPrice: number;
  itemCost: number;
};

export async function getItemsByUserId(userId: number) {
  const offers = await sql<GetItemsReturn[]>`
  SELECT
   id,
   item_id,
   item_title,
   item_text,
   item_sales_price,
   item_cost
  FROM
    template_items
  WHERE
    user_id = ${userId}
    `;
  return offers;
}

export async function addItem(itemData: ItemToAdd) {
  const [item] = await sql<{ id: string }[]>`
    INSERT INTO template_items
      (user_id, item_id, item_title,item_text,item_sales_price,item_cost)
    VALUES
      (${itemData.userId},${itemData.itemId},${itemData.itemTitle},${itemData.itemText},${itemData.itemSalesPrice},${itemData.itemCost})
    RETURNING
      id
    `;
  return item;
}

export async function deleteTemplateItemByRowIdAndUserId(
  id: number,
  userId: number,
) {
  await sql`
    DELETE FROM
      template_items
    WHERE
      id=${id}
      AND
      user_id=${userId}
    `;
  return `Template Log / ItemRow ${id} of User ${userId} has been successfully deleted`;
}
