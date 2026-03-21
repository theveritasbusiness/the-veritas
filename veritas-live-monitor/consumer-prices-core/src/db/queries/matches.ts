import { query } from '../client.js';

export async function upsertProductMatch(input: {
  retailerProductId: string;
  canonicalProductId: string;
  basketItemId: string;
  matchScore: number;
  matchStatus: 'auto' | 'approved';
}): Promise<void> {
  await query(
    `INSERT INTO product_matches
       (retailer_product_id, canonical_product_id, basket_item_id, match_score, match_status, evidence_json)
     VALUES ($1,$2,$3,$4,$5,'{}')
     ON CONFLICT (retailer_product_id, canonical_product_id)
     DO UPDATE SET
       basket_item_id = EXCLUDED.basket_item_id,
       match_score    = EXCLUDED.match_score,
       match_status   = EXCLUDED.match_status`,
    [
      input.retailerProductId,
      input.canonicalProductId,
      input.basketItemId,
      input.matchScore,
      input.matchStatus,
    ],
  );
}

export async function getBasketItemId(basketSlug: string, canonicalName: string): Promise<string | null> {
  const result = await query<{ id: string }>(
    `SELECT bi.id FROM basket_items bi
     JOIN baskets b ON b.id = bi.basket_id
     JOIN canonical_products cp ON cp.id = bi.canonical_product_id
     WHERE b.slug = $1 AND cp.canonical_name = $2 AND bi.active = true
     LIMIT 1`,
    [basketSlug, canonicalName],
  );
  return result.rows[0]?.id ?? null;
}
