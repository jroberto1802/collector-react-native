export const SEARCH_TYPE = {
  REFERENCE: 'reference',
  BARCODE: 'barcode',
} as const;

export type SearchType = (typeof SEARCH_TYPE)[keyof typeof SEARCH_TYPE];

export const PRICE_TYPE = {
  PURCHASE: 'purchase',
  SALE: 'sale',
} as const;

export type PriceType = (typeof PRICE_TYPE)[keyof typeof PRICE_TYPE];

export type SettingOption<T extends string> = {
  label: string;
  value: T;
};

export const SEARCH_TYPE_OPTIONS: SettingOption<SearchType>[] = [
  { value: SEARCH_TYPE.REFERENCE, label: 'Referência' },
  { value: SEARCH_TYPE.BARCODE, label: 'Barras' },
];

export const PRICE_TYPE_OPTIONS: SettingOption<PriceType>[] = [
  { value: PRICE_TYPE.PURCHASE, label: 'Compra' },
  { value: PRICE_TYPE.SALE, label: 'Venda' },
];

export type AppSettings = {
  /** Lançamento de itens ao capturar código */
  quickCollection: boolean;
  /** Solicitar lote/serial e datas */
  lotSerial: boolean;
  /** Solicitar atributos de cor e tamanho */
  grade: boolean;
  /** Tipo de busca de produto */
  searchType: SearchType;
  /** Tipo de preço exibido/usado */
  priceType: PriceType;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  quickCollection: false,
  lotSerial: false,
  grade: false,
  searchType: SEARCH_TYPE.BARCODE,
  priceType: PRICE_TYPE.PURCHASE,
};

export function labelForSearchType(value: SearchType) {
  return (
    SEARCH_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    'Selecione'
  );
}

export function labelForPriceType(value: PriceType) {
  return (
    PRICE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    'Selecione'
  );
}
