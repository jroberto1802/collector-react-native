import {
  archiveCollection,
  createCollection,
  deleteCollection,
  listCollections,
  unarchiveCollection,
} from '../database/database';
import type { CollectionFilter } from '../models/collections/Collection';

export class CollectionRepository {
  list(filter: CollectionFilter, search: string) {
    return listCollections(filter, search);
  }

  create(name: string) {
    return createCollection(name);
  }

  archive(id: number) {
    return archiveCollection(id);
  }

  unarchive(id: number) {
    return unarchiveCollection(id);
  }

  delete(id: number) {
    return deleteCollection(id);
  }
}
