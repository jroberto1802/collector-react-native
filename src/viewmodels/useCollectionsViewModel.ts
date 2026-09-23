import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  Collection,
  CollectionFilter,
} from '../models/collections/Collection';
import { CollectionRepository } from '../repositories/CollectionRepository';

const collectionRepository = new CollectionRepository();

export function useCollectionsViewModel() {
  const [filter, setFilter] = useState<CollectionFilter>('recentes');
  const [search, setSearch] = useState('');
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewCollectionVisible, setNewCollectionVisible] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);
  const [collectionPendingDelete, setCollectionPendingDelete] =
    useState<Collection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCollections = useCallback(async () => {
    setIsLoading(true);

    try {
      const items = await collectionRepository.list(filter, search);
      setCollections(items);
    } finally {
      setIsLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const emptyCopy = useMemo(() => {
    if (filter === 'arquivadas') {
      return {
        title: 'Nenhuma coleta arquivada!',
        description: 'As coletas arquivadas aparecerão aqui.',
      };
    }

    if (filter === 'todas') {
      return {
        title: 'Nenhuma coleta encontrada!',
        description: 'Toque no botão (+) para realizar uma nova coleta',
      };
    }

    return {
      title: 'Nenhuma coleta recente!',
      description: 'Toque no botão (+) para realizar uma nova coleta',
    };
  }, [filter]);

  const openNewCollection = useCallback(() => {
    setNewCollectionName('');
    setCreateError('');
    setNewCollectionVisible(true);
  }, []);

  const closeNewCollection = useCallback(() => {
    if (isCreating) {
      return;
    }

    setNewCollectionVisible(false);
    setNewCollectionName('');
    setCreateError('');
  }, [isCreating]);

  const createCollection = useCallback(async () => {
    const trimmedName = newCollectionName.trim();

    if (!trimmedName) {
      setCreateError('Informe o nome da coleta.');
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      await collectionRepository.create(trimmedName);
      setNewCollectionVisible(false);
      setNewCollectionName('');
      await loadCollections();
    } catch (error) {
      setCreateError(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar a coleta.',
      );
    } finally {
      setIsCreating(false);
    }
  }, [loadCollections, newCollectionName]);

  const openCollectionMenu = useCallback((collection: Collection) => {
    setMenuCollection(collection);
  }, []);

  const closeCollectionMenu = useCallback(() => {
    setMenuCollection(null);
  }, []);

  const archiveSelectedCollection = useCallback(async () => {
    if (!menuCollection) {
      return;
    }

    const collectionId = menuCollection.id;
    setMenuCollection(null);
    await collectionRepository.archive(collectionId);
    await loadCollections();
  }, [loadCollections, menuCollection]);

  const unarchiveSelectedCollection = useCallback(async () => {
    if (!menuCollection) {
      return;
    }

    const collectionId = menuCollection.id;
    setMenuCollection(null);
    await collectionRepository.unarchive(collectionId);
    await loadCollections();
  }, [loadCollections, menuCollection]);

  const requestDeleteCollection = useCallback(() => {
    if (!menuCollection) {
      return;
    }

    setCollectionPendingDelete(menuCollection);
    setMenuCollection(null);
  }, [menuCollection]);

  const cancelDeleteCollection = useCallback(() => {
    if (isDeleting) {
      return;
    }

    setCollectionPendingDelete(null);
  }, [isDeleting]);

  const confirmDeleteCollection = useCallback(async () => {
    if (!collectionPendingDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      await collectionRepository.delete(collectionPendingDelete.id);
      setCollectionPendingDelete(null);
      await loadCollections();
    } finally {
      setIsDeleting(false);
    }
  }, [collectionPendingDelete, loadCollections]);

  return {
    archiveSelectedCollection,
    cancelDeleteCollection,
    closeCollectionMenu,
    closeNewCollection,
    collectionPendingDelete,
    collections,
    confirmDeleteCollection,
    createCollection,
    createError,
    emptyCopy,
    filter,
    isCreating,
    isDeleting,
    isLoading,
    isNewCollectionVisible,
    menuCollection,
    newCollectionName,
    openCollectionMenu,
    openNewCollection,
    requestDeleteCollection,
    search,
    setFilter,
    setNewCollectionName,
    setSearch,
    unarchiveSelectedCollection,
  };
}
