// Comisión de gestión de Google Ads según la inversión mensual en anuncios (CLP, sin IVA).
// Hasta $1.000.000 es el 30% de la inversión; sobre eso es un monto fijo por tramo.
// Sobre el último tramo no hay precio publicado: se cotiza (null).
export const ADS_PERCENT = 0.3;
export const ADS_PERCENT_LIMIT = 1_000_000;

export const ADS_TIERS: { max: number; fee: number }[] = [
  { max: 1_499_999, fee: 250_000 },
  { max: 1_999_999, fee: 275_000 },
  { max: 2_999_999, fee: 320_000 },
  { max: 3_999_999, fee: 370_000 },
  { max: 4_999_999, fee: 420_000 },
  { max: 5_999_999, fee: 480_000 },
  { max: 6_999_999, fee: 530_000 },
];

/** Inversión mínima sugerida por plan (mismo orden que los planes de src/content/plan-sets/google-ads.yaml). */
export const ADS_PLAN_MIN = [100_000, 1_000_000, 3_000_000];

/** Comisión mensual sin IVA, o null si la inversión supera el último tramo. */
export function adsFee(budget: number): number | null {
  if (budget <= ADS_PERCENT_LIMIT) return Math.round(budget * ADS_PERCENT);
  return ADS_TIERS.find((t) => budget <= t.max)?.fee ?? null;
}

/** Cómo se calcula la comisión para ese monto, para mostrarlo junto al precio. */
export function adsFeeLabel(budget: number): string {
  if (budget <= ADS_PERCENT_LIMIT) return 'Gestión (30% de la inversión)';
  return adsFee(budget) === null ? 'Gestión (desde $7.000.000 se cotiza)' : 'Gestión (tarifa fija por tramo)';
}
