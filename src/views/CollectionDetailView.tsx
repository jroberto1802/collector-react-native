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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { CollectionActionsMenu } from '../components/CollectionActionsMenu';
import { CollectionItemCard } from '../components/CollectionItemCard';
import { CollectionItemOptionsMenu } from '../components/CollectionItemOptionsMenu';
import { EditCollectionItemModal } from '../components/EditCollectionItemModal';
import { ProductSearchBottomSheet } from '../components/ProductSearchBottomSheet';
import { colors } from '../theme/colors';
import { layout } from '../theme/layout';
import { useCollectionDetailViewModel } from '../viewmodels/useCollectionDetailViewModel';

type CollectionDetailViewProps = {
  collectionId: number;
  onBack: () => void;
};

export function CollectionDetailView({
  collectionId,
  onBack,
}: CollectionDetailViewProps) {
  const insets = useSafeAreaInsets();
  const {
    addItem,
    applyBarcode,
    closeActions,
    closeEditItem,
    closeItemMenu,
    closeProductSearch,
    closeScanner,
    collection,
    decreaseQuantity,
    editError,
    editExpirationDateText,
    editLotText,
    editManufacturingDateText,
    editQuantityText,
    editingItem,
    expirationDateText,
    feedback,
    increaseQuantity,
    isActionsVisible,
    isAdding,
    isGrade,
    isLoading,
    isLotSerial,
    isProductSearchVisible,
    isQuickCollection,
    isSavingEdit,
    isScannerVisible,
    items,
    loadError,
    lotText,
    manufacturingDateText,
    menuItem,
    openActions,
    openItemMenu,
    openProductSearch,
    openScanner,
    priceType,
    productQuery,
    quantityText,
    removeSelectedItem,
    requestEditItem,
    saveEditedItem,
    searchType,
    selectProductFromSearch,
    selectedProduct,
    setEditExpirationDateText,
    setEditLotText,
    setEditManufacturingDateText,
    setEditQuantityText,
    setExpirationDateText,
    setLotText,
    setManufacturingDateText,
    setProductQuery,
    setQuantityText,
    toastMessage,
  } = useCollectionDetailViewModel({ collectionId });

  const fabBottom = toastMessage
    ? Math.max(insets.bottom, 12) + 56
    : Math.max(insets.bottom, 12) + 16;
  const listBottomPadding = fabBottom + 72;

  const quantityControls = (
    <View
      style={[
        styles.quantityRow,
        isQuickCollection ? styles.quantityRowQuick : null,
        isLotSerial && !isQuickCollection ? styles.quantityRowLot : null,
      ]}
    >
      <Pressable onPress={decreaseQuantity} style={styles.stepButton}>
        <Text style={styles.stepLabel}>-</Text>
      </Pressable>

      <View style={styles.quantityField}>
        <Text style={styles.quantityLabel}>Qtde</Text>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={setQuantityText}
          selectionColor={colors.orange}
          style={styles.quantityInput}
          value={quantityText}
        />
      </View>

      <Pressable onPress={increaseQuantity} style={styles.stepButton}>
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>

      {!isQuickCollection ? (
        <Pressable
          disabled={isAdding}
          onPress={() => void addItem()}
          style={[styles.addButton, isAdding ? styles.addButtonDisabled : null]}
        >
          <Text style={styles.addButtonLabel}>
            {isAdding ? 'Adicionando...' : 'Adicionar'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );

  const searchControls = (
    <View
      style={[
        styles.searchRow,
        isQuickCollection ? styles.searchRowQuick : null,
      ]}
    >
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={setProductQuery}
        placeholder="Produto"
        placeholderTextColor="#A8A8A8"
        selectionColor={colors.orange}
        style={styles.productInput}
        value={productQuery}
      />
      <Pressable onPress={openScanner} style={styles.iconButton}>
        <Ionicons color={colors.white} name="barcode-outline" size={22} />
      </Pressable>
      <Pressable onPress={openProductSearch} style={styles.iconButton}>
        <Ionicons color={colors.white} name="search" size={21} />
      </Pressable>
    </View>
  );

  const lotSerialControls = isLotSerial && !isQuickCollection ? (
    <>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        onChangeText={setLotText}
        placeholder="Lote/Serial"
        placeholderTextColor="#A8A8A8"
        selectionColor={colors.orange}
        style={styles.lotInput}
        value={lotText}
      />
      <View style={styles.dateRow}>
        <TextInput
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={setManufacturingDateText}
          placeholder="Fabricação"
          placeholderTextColor="#A8A8A8"
          selectionColor={colors.orange}
          style={styles.dateInput}
          value={manufacturingDateText}
        />
        <TextInput
          keyboardType="number-pad"
          maxLength={10}
          onChangeText={setExpirationDateText}
          placeholder="Validade"
          placeholderTextColor="#A8A8A8"
          selectionColor={colors.orange}
          style={styles.dateInput}
          value={expirationDateText}
        />
      </View>
    </>
  ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <Ionicons color="#555555" name="chevron-back" size={20} />
          </Pressable>
          <Text style={styles.title} numberOfLines={1}>
            {collection?.name ?? 'Coleta'}
          </Text>
        </View>

        {isQuickCollection ? (
          <>
            {quantityControls}
            {searchControls}
          </>
        ) : (
          <>
            {searchControls}
            {!isQuickCollection && selectedProduct ? (
              <View style={styles.selectedProductBox}>
                <Text style={styles.selectedProductName} numberOfLines={2}>
                  {selectedProduct.name}
                </Text>
              </View>
            ) : null}
            {lotSerialControls}
            {quantityControls}
          </>
        )}

        {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

        <View style={styles.divider} />

        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.orange} />
          </View>
        ) : loadError ? (
          <View style={styles.centered}>
            <Text style={styles.emptyTitle}>{loadError}</Text>
          </View>
        ) : (
          <FlatList
            contentContainerStyle={[
              items.length === 0 ? styles.emptyListContent : styles.listContent,
              { paddingBottom: listBottomPadding },
            ]}
            data={items}
            keyExtractor={(item) => String(item.id)}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <View style={styles.emptyImageWrap}>
                  <Image
                    resizeMode="contain"
                    source={require('../../assets/images/empty-state-itens-coleta.png')}
                    style={styles.emptyImage}
                  />
                </View>
                <Text style={styles.emptyTitle}>Nenhum produto adicionado</Text>
                <Text style={styles.emptyDescription}>
                  {isQuickCollection
                    ? 'Informe a quantidade e selecione o produto para lançar automaticamente!'
                    : isLotSerial
                      ? 'Informe produto, lote/serial, datas e quantidade para começar!'
                      : 'Informe a quantidade e digite o código de barras do produto para começar!'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <CollectionItemCard
                isGrade={isGrade}
                item={item}
                onOpenOptions={openItemMenu}
                priceType={priceType}
                searchType={searchType}
              />
            )}
            showsVerticalScrollIndicator={false}
            style={styles.list}
          />
        )}
      </View>

      <Pressable
        onPress={openActions}
        style={[styles.fab, { bottom: fabBottom }]}
      >
        <Ionicons color={colors.white} name="menu" size={24} />
      </Pressable>

      <BarcodeScannerModal
        onClose={closeScanner}
        onScanned={(barcode) => void applyBarcode(barcode)}
        visible={isScannerVisible}
      />

      <ProductSearchBottomSheet
        onClose={closeProductSearch}
        onSelect={selectProductFromSearch}
        priceType={priceType}
        searchType={searchType}
        visible={isProductSearchVisible}
      />

      <CollectionActionsMenu
        onClose={closeActions}
        onSave={onBack}
        visible={isActionsVisible}
      />

      <CollectionItemOptionsMenu
        item={menuItem}
        onClose={closeItemMenu}
        onEdit={requestEditItem}
        onRemove={() => void removeSelectedItem()}
        visible={menuItem !== null}
      />

      <EditCollectionItemModal
        errorMessage={editError}
        expirationDate={editExpirationDateText}
        isGrade={isGrade}
        isLotSerial={isLotSerial}
        isSubmitting={isSavingEdit}
        item={editingItem}
        lot={editLotText}
        manufacturingDate={editManufacturingDateText}
        onClose={closeEditItem}
        onExpirationDateChange={setEditExpirationDateText}
        onLotChange={setEditLotText}
        onManufacturingDateChange={setEditManufacturingDateText}
        onQuantityChange={setEditQuantityText}
        onSubmit={() => void saveEditedItem()}
        quantity={editQuantityText}
        visible={editingItem !== null}
      />

      {toastMessage ? (
        <View
          pointerEvents="none"
          style={[
            styles.toast,
            { paddingBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
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
    height: layout.headerActionSize,
    justifyContent: 'center',
    marginTop: layout.screenTopPadding,
    position: 'relative',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: layout.headerActionRadius,
    height: layout.headerActionSize,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    top: 0,
    width: layout.headerActionSize,
    zIndex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: layout.headerActionSize + 12,
    textAlign: 'center',
    width: '100%',
  },
  searchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  searchRowQuick: {
    marginTop: 12,
  },
  productInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    height: 46,
    paddingHorizontal: 12,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  lotInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    fontSize: 14,
    height: 46,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  dateInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    height: 46,
    paddingHorizontal: 12,
  },
  selectedProductBox: {
    backgroundColor: '#FFF0E7',
    borderRadius: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  selectedProductName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  quantityRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quantityRowQuick: {
    marginTop: 18,
  },
  quantityRowLot: {
    marginTop: 12,
  },
  stepButton: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    width: 42,
  },
  stepLabel: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 24,
  },
  quantityField: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    minWidth: 78,
    paddingHorizontal: 10,
  },
  quantityLabel: {
    color: '#9A9A9A',
    fontSize: 9,
    position: 'absolute',
    top: 4,
    left: 10,
  },
  quantityInput: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    textAlign: 'center',
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 8,
    flex: 1,
    height: 46,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.7,
  },
  addButtonLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  feedback: {
    color: colors.error,
    fontSize: 12,
    marginTop: 10,
  },
  divider: {
    backgroundColor: '#E6E6E6',
    height: StyleSheet.hairlineWidth,
    marginTop: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 14,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  emptyImageWrap: {
    alignItems: 'center',
    backgroundColor: colors.white,
    justifyContent: 'center',
  },
  emptyImage: {
    backgroundColor: colors.white,
    height: 220,
    width: 240,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#999999',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 56,
    zIndex: 2,
  },
  toast: {
    backgroundColor: colors.orange,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
    zIndex: 3,
  },
  toastText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
