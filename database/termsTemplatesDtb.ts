import { sql } from '../connect';

export type GetTermsReturn = {
  termTitle: string;
  termUpper: string;
  termLower: string;
  leadTime: string;
};

export async function getTermByUserId(userId: number) {
  const [term] = await sql<GetTermsReturn[]>`
  SELECT
    term_title,
    term_upper,
    term_lower,
    lead_time
  FROM
    template_terms
  WHERE
    user_id = ${userId}
    `;
  return term;
}

export async function updateTermByUserId(
  termsData: GetTermsReturn,
  userId: number,
) {
  const [term] = await sql<GetTermsReturn[]>`
  SELECT
    *
  FROM
    template_terms
  WHERE
    user_id = ${userId}
    `;

  if (term) {
    await sql`
    UPDATE template_terms
    SET term_title = ${termsData.termTitle},
        term_upper = ${termsData.termUpper},
        term_lower = ${termsData.termLower},
        lead_time = ${termsData.leadTime}
  	WHERE
        user_id=${userId}
    `;

    return `Template Log / Terms of user ${userId} has been updated successfully `;
  } else {
    await sql`
    INSERT INTO template_terms
      (user_id, term_title, term_upper, term_lower, lead_time)
    VALUES
      (${userId},${termsData.termTitle},${termsData.termUpper},${termsData.termLower},${termsData.leadTime})
    `;
    return `Template Log / Terms of user ${userId} has been created successfully`;
  }
}
