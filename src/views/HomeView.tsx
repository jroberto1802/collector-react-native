import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CollectorLogo from '../../assets/images/logo-collector.svg';
import { CollectionCard } from '../components/CollectionCard';
import { CollectionOptionsMenu } from '../components/CollectionOptionsMenu';
import { DeleteCollectionModal } from '../components/DeleteCollectionModal';
import { MenuSheet } from '../components/MenuSheet';
import { NewCollectionModal } from '../components/NewCollectionModal';
import { ProductSyncModal } from '../components/ProductSyncModal';
import { SyncConfirmationModal } from '../components/SyncConfirmationModal';
import type { CollectionFilter } from '../models/collections/Collection';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { useCollectionsViewModel } from '../viewmodels/useCollectionsViewModel';
import { useHomeViewModel } from '../viewmodels/useHomeViewModel';

type HomeViewProps = {
  initialSyncRequired: boolean;
  onInitialSyncCompleted: () => void;
  onLogout: () => void;
  onOpenCollection: (collectionId: number) => void;
  onOpenProducts: () => void;
  onOpenSettings: () => void;
};

const FILTERS: Array<{ key: CollectionFilter; label: string }> = [
  { key: 'recentes', label: 'Recentes' },
  { key: 'todas', label: 'Todas' },
  { key: 'arquivadas', label: 'Arquivadas' },
];

export function HomeView({
  initialSyncRequired,
  onInitialSyncCompleted,
  onLogout,
  onOpenCollection,
  onOpenProducts,
  onOpenSettings,
}: HomeViewProps) {
  const {
    cancelSync,
    closeMenu,
    confirmSync,
    finishProductSync,
    isMenuVisible,
    isProductSyncVisible,
    isSyncConfirmationVisible,
    logout,
    openMenu,
    openProducts,
    openSettings,
    requestSync,
  } = useHomeViewModel({
    initialSyncRequired,
    onInitialSyncCompleted,
    onLogout,
    onOpenProducts,
    onOpenSettings,
  });

  const {
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
  } = useCollectionsViewModel();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={openMenu} style={styles.headerActionMuted}>
            <Ionicons color="#444444" name="menu" size={21} />
          </Pressable>
          <CollectorLogo height={35} width={169} />
          <Pressable onPress={openNewCollection} style={styles.headerActionPrimary}>
            <Ionicons color={colors.white} name="add" size={27} />
          </Pressable>
        </View>

        <Text style={styles.heading}>Minhas Coletas</Text>

        <TextInput
          onChangeText={setSearch}
          placeholder="Pesquise uma coleta"
          placeholderTextColor="#AAAAAA"
          selectionColor={colors.orange}
          style={styles.searchInput}
          value={search}
        />

        <View style={styles.tabs}>
          {FILTERS.map((item) => {
            const isActive = filter === item.key;

            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.tab, isActive ? styles.activeTab : null]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.activeTabLabel : null,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : (
          <FlatList
            contentContainerStyle={
              collections.length === 0
                ? styles.emptyListContent
                : styles.listContent
            }
            data={collections}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Image
                  resizeMode="contain"
                  source={require('../../assets/images/empty-state-coleta.png')}
                  style={styles.emptyImage}
                />
                <Text style={styles.emptyTitle}>{emptyCopy.title}</Text>
                <Text style={styles.emptyDescription}>
                  {emptyCopy.description}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <CollectionCard
                collection={item}
                onOpen={() => onOpenCollection(item.id)}
                onOpenOptions={openCollectionMenu}
              />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}

        <Image
          resizeMode="contain"
          source={require('../../assets/images/logo-by-softcom.png')}
          style={styles.footerLogo}
        />
      </View>

      <MenuSheet
        onClose={closeMenu}
        onLogout={() => void logout()}
        onOpenProducts={openProducts}
        onOpenSettings={openSettings}
        onSynchronize={requestSync}
        visible={isMenuVisible}
      />

      <SyncConfirmationModal
        onCancel={cancelSync}
        onConfirm={confirmSync}
        visible={isSyncConfirmationVisible}
      />

      <ProductSyncModal
        onCompleted={finishProductSync}
        visible={isProductSyncVisible}
      />

      <NewCollectionModal
        errorMessage={createError}
        isSubmitting={isCreating}
        name={newCollectionName}
        onChangeName={setNewCollectionName}
        onClose={closeNewCollection}
        onSubmit={() => void createCollection()}
        visible={isNewCollectionVisible}
      />

      <CollectionOptionsMenu
        collection={menuCollection}
        onArchive={() => void archiveSelectedCollection()}
        onClose={closeCollectionMenu}
        onDelete={requestDeleteCollection}
        onUnarchive={() => void unarchiveSelectedCollection()}
        visible={menuCollection !== null}
      />

      <DeleteCollectionModal
        collection={collectionPendingDelete}
        isSubmitting={isDeleting}
        onCancel={cancelDeleteCollection}
        onConfirm={() => void confirmDeleteCollection()}
        visible={collectionPendingDelete !== null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenHorizontalPadding,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: layout.screenTopPadding,
  },
  headerActionMuted: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    width: layout.headerActionSize,
  },
  headerActionPrimary: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    width: layout.headerActionSize,
  },
  heading: {
    color: colors.text,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 25,
  },
  searchInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    fontSize: 13,
    height: 46,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },
  tab: {
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    borderRadius: 18,
    height: 31,
    justifyContent: 'center',
    minWidth: 65,
    paddingHorizontal: 15,
  },
  activeTab: {
    backgroundColor: '#FFF0E7',
  },
  tabLabel: {
    color: '#8C8C8C',
    fontSize: 12,
  },
  activeTabLabel: {
    color: colors.orange,
  },
  divider: {
    backgroundColor: '#E6E6E6',
    height: StyleSheet.hairlineWidth,
    marginTop: 12,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
    paddingTop: 14,
  },
  emptyListContent: {
    flexGrow: 1,
    paddingBottom: 12,
    paddingTop: 14,
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 28,
  },
  emptyImage: {
    height: 218,
    width: 220,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 11,
  },
  emptyDescription: {
    color: '#999999',
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  footerLogo: {
    alignSelf: 'center',
    height: 27,
    marginBottom: 1,
    marginTop: 12,
    width: 166,
  },
});
