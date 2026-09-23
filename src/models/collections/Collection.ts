export type CollectionStatus = 'Não sincronizado' | 'Sincronizado';

export type CollectionFilter = 'recentes' | 'todas' | 'arquivadas';

export type Collection = {
  id: number;
  name: string;
  status: CollectionStatus;
  archived: boolean;
  itemCount: number;
  createdAt: number;
};

export const DEFAULT_COLLECTION_STATUS: CollectionStatus = 'Não sincronizado';

export function formatCollectionDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, '0');

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} às ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatCollectionHeader(collection: Collection) {
  return `Coleta nº ${collection.id} - ${formatCollectionDateTime(collection.createdAt)}`;
}

export function formatCollectionItemCount(itemCount: number) {
  return `${itemCount} ${itemCount === 1 ? 'produto' : 'produtos'}`;
}
