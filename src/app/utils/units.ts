/**
 * Utilidades para conversión de unidades de superficie
 */

/**
 * Convierte metros cuadrados a hectáreas
 */
export function m2ToHa(m2: number): number {
  return m2 / 10000;
}

/**
 * Convierte hectáreas a metros cuadrados
 */
export function haToM2(ha: number): number {
  return ha * 10000;
}

/**
 * Formatea superficie en m² a texto legible
 * Si es mayor a 10,000 m² lo muestra en ha
 */
export function formatSuperficie(m2: number): string {
  if (m2 >= 10000) {
    const ha = m2ToHa(m2);
    return `${ha.toFixed(2)} ha`;
  }
  return `${m2.toLocaleString()} m²`;
}

/**
 * Formatea superficie siempre en hectáreas
 */
export function formatSuperficieHa(m2: number): string {
  const ha = m2ToHa(m2);
  return `${ha.toFixed(2)} ha`;
}