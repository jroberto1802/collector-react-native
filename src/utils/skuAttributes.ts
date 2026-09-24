import type { ProductSkuAttribute } from '../models/products/Product';

export type GradeAttributes = {
  size: string;
  color: string;
};

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNumber(value: unknown) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

/** Normaliza sku_attributes da API (PT) ou do banco (EN). */
export function normalizeSkuAttributes(
  value: unknown,
): ProductSkuAttribute[] {
  if (typeof value === 'string') {
    try {
      return normalizeSkuAttributes(JSON.parse(value));
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((attribute) => {
    const item = asRecord(attribute);

    return {
      id: asNumber(item.id),
      name: asString(item.nome ?? item.name),
      itemId: asNumber(item.item_id ?? item.itemId),
      itemName: asString(item.item_nome ?? item.itemName),
    };
  });
}

/**
 * Extrai tamanho e cor de sku_attributes (nome COR / TAMANHO).
 * Somente visualização — não são editáveis.
 */
export function extractGradeAttributes(
  attributes: ProductSkuAttribute[] | unknown,
): GradeAttributes {
  const list = Array.isArray(attributes)
    ? normalizeSkuAttributes(attributes)
    : normalizeSkuAttributes(attributes);

  let size = '';
  let color = '';

  for (const attribute of list) {
    const name = attribute.name.trim().toUpperCase();
    const value = attribute.itemName.trim();

    if (name === 'TAMANHO' || name === 'SIZE') {
      size = value;
    }

    if (name === 'COR' || name === 'COLOR' || name === 'COLOUR') {
      color = value;
    }
  }

  return { size, color };
}
