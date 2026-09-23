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

import { ProductSyncModal } from '../components/ProductSyncModal';
import { SyncConfirmationModal } from '../components/SyncConfirmationModal';
import type { ProductListItem } from '../models/products/Product';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { useProductsViewModel } from '../viewmodels/useProductsViewModel';

type ProductsViewProps = {
  onBack: () => void;
};

export function ProductsView({ onBack }: ProductsViewProps) {
  const {
    cancelSync,
    confirmSync,
    finishProductSync,
    goToNextPage,
    goToPreviousPage,
    isLoading,
    isProductSyncVisible,
    isSyncConfirmationVisible,
    page,
    pageSize,
    products,
    range,
    requestSync,
    search,
    setSearch,
    total,
    totalPages,
  } = useProductsViewModel();

  function renderProduct({ item }: { item: ProductListItem }) {
    return (
      <View style={styles.productRow}>
        <Text style={styles.productCode}>{item.productId || item.id}</Text>
        <Text numberOfLines={2} style={styles.productName}>
          {item.name}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable hitSlop={8} onPress={onBack} style={styles.backButton}>
            <Ionicons color="#444444" name="chevron-back" size={20} />
          </Pressable>
          <Text style={styles.title}>Produtos</Text>
          <View style={styles.headerSpacer} />
        </View>

        <TextInput
          autoCapitalize="none"
          onChangeText={setSearch}
          placeholder="Pesquise por nome ou código"
          placeholderTextColor="#666666"
          returnKeyType="search"
          style={styles.searchInput}
          value={search}
        />

        <View style={styles.divider} />
        <View style={styles.tableHeader}>
          <Text style={styles.codeHeader}>Código</Text>
          <Text style={styles.nameHeader}>Produto</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.orange} size="large" />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhum produto encontrado.</Text>
            }
            renderItem={renderProduct}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}

        <View style={styles.pagination}>
          <View style={styles.pageSizeInfo}>
            <Text style={styles.paginationMuted}>Linhas:</Text>
            <Text style={styles.paginationValue}>{pageSize}</Text>
          </View>
          <Text style={styles.rangeText}>
            {range.from} – {range.to} de {total}
          </Text>
          <Pressable
            disabled={page <= 1}
            hitSlop={10}
            onPress={goToPreviousPage}
            style={styles.pageButton}
          >
            <Ionicons
              color={page <= 1 ? '#C7C7C7' : '#808080'}
              name="chevron-back"
              size={20}
            />
          </Pressable>
          <Pressable
            disabled={page >= totalPages}
            hitSlop={10}
            onPress={goToNextPage}
            style={styles.pageButton}
          >
            <Ionicons
              color={page >= totalPages ? '#C7C7C7' : '#808080'}
              name="chevron-forward"
              size={20}
            />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Image
            resizeMode="contain"
            source={require('../../assets/images/logo-by-softcom.png')}
            style={styles.footerLogo}
          />

          <Pressable onPress={requestSync} style={styles.syncButton}>
            <Ionicons color={colors.white} name="sync" size={26} />
          </Pressable>
        </View>
      </View>

      <SyncConfirmationModal
        onCancel={cancelSync}
        onConfirm={confirmSync}
        visible={isSyncConfirmationVisible}
      />
      <ProductSyncModal
        onCompleted={finishProductSync}
        visible={isProductSyncVisible}
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
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    width: layout.headerActionSize,
  },
  headerSpacer: {
    height: layout.headerActionSize,
    width: layout.headerActionSize,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 7,
    color: colors.text,
    fontSize: 13,
    height: 47,
    marginTop: 29,
    paddingHorizontal: 12,
  },
  divider: {
    backgroundColor: '#E5E5E5',
    height: StyleSheet.hairlineWidth,
    marginTop: 11,
  },
  tableHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: layout.listHorizontalPadding,
  },
  codeHeader: {
    color: '#8B8B95',
    fontSize: 13,
    width: 78,
  },
  nameHeader: {
    color: '#8B8B95',
    flex: 1,
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  productRow: {
    alignItems: 'flex-start',
    borderBottomColor: '#E2E2E2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 73,
    paddingHorizontal: layout.listHorizontalPadding,
    paddingVertical: 20,
  },
  productCode: {
    color: '#505050',
    fontSize: 13,
    width: 78,
  },
  productName: {
    color: '#414141',
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999999',
    fontSize: 13,
    marginTop: 50,
    textAlign: 'center',
  },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 45,
    justifyContent: 'flex-end',
    paddingRight: 0,
  },
  footer: {
    alignItems: 'center',
    height: 72,
    justifyContent: 'center',
    paddingBottom: 12,
  },
  pageSizeInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 24,
  },
  paginationMuted: {
    color: '#8B8B8B',
    fontSize: 10,
  },
  paginationValue: {
    color: '#777777',
    fontSize: 10,
    marginLeft: 13,
  },
  rangeText: {
    color: '#777777',
    fontSize: 10,
    marginRight: 27,
  },
  pageButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginLeft: 18,
    width: 28,
  },
  footerLogo: {
    alignSelf: 'center',
    height: 27,
    width: 166,
  },
  syncButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 27,
    bottom: 10,
    elevation: 5,
    height: 54,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 54,
  },
});
