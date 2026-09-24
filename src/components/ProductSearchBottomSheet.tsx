import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatCurrencyBrl } from '../models/collections/CollectionItem';
import type { Product } from '../models/products/Product';
import {
  PRICE_TYPE,
  SEARCH_TYPE,
  type PriceType,
  type SearchType,
} from '../constants/SettingsConstants';
import { searchProducts } from '../database/database';
import { colors } from '../theme/colors';

type ProductSearchBottomSheetProps = {
  onClose: () => void;
  onSelect: (product: Product) => void;
  priceType?: PriceType;
  searchType?: SearchType;
  visible: boolean;
};

export function ProductSearchBottomSheet({
  onClose,
  onSelect,
  priceType = PRICE_TYPE.PURCHASE,
  searchType = SEARCH_TYPE.BARCODE,
  visible,
}: ProductSearchBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const isReferenceSearch = searchType === SEARCH_TYPE.REFERENCE;

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setIsSearching(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const normalized = query.trim();
    if (!normalized) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(() => {
      void searchProducts(normalized, searchType)
        .then((products) => {
          if (!cancelled) {
            setResults(products);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsSearching(false);
          }
        });
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, searchType, visible]);

  const showEmptyState = query.trim().length === 0;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <Pressable onPress={onClose} style={styles.dismissArea} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheetWrap}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <View style={styles.handle} />
            <Text style={styles.title}>Pesquise o produto desejado</Text>

            <View style={styles.searchBox}>
              <Ionicons color="#4C8BF5" name="search" size={18} style={styles.searchIcon} />
              <TextInput
                autoFocus
                onChangeText={setQuery}
                placeholder="Digite o nome ou código de barras"
                placeholderTextColor="#B0B0B0"
                selectionColor={colors.orange}
                style={styles.searchInput}
                value={query}
              />
            </View>

            <View style={styles.divider} />

            {showEmptyState ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyImageWrap}>
                  <Image
                    resizeMode="contain"
                    source={require('../../assets/images/empty-state-product-search.png')}
                    style={styles.emptyImage}
                  />
                </View>
                <Text style={styles.emptyTitle}>Pesquise o produto desejado.</Text>
                <Text style={styles.emptyDescription}>
                  Após localizar, selecione para lançar na sua coleta.
                </Text>
              </View>
            ) : isSearching ? (
              <View style={styles.loadingState}>
                <ActivityIndicator color={colors.orange} />
              </View>
            ) : (
              <FlatList
                contentContainerStyle={
                  results.length === 0 ? styles.emptyResultsContent : styles.listContent
                }
                data={results}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <Text style={styles.noResults}>Nenhum produto encontrado.</Text>
                }
                renderItem={({ item }) => {
                  const price =
                    priceType === PRICE_TYPE.SALE
                      ? item.salePrice
                      : item.purchasePrice;
                  const meta = isReferenceSearch
                    ? `Referência: ${item.reference || '-'}   Preço: ${formatCurrencyBrl(price)}`
                    : `Cód.: ${item.barcode || '-'}   Preço: ${formatCurrencyBrl(price)}`;

                  return (
                    <Pressable onPress={() => onSelect(item)} style={styles.resultCard}>
                      <Text style={styles.resultName} numberOfLines={2}>
                        {item.name}
                      </Text>
                      <Text style={styles.resultMeta}>{meta}</Text>
                    </Pressable>
                  );
                }}
                showsVerticalScrollIndicator={false}
                style={styles.list}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheetWrap: {
    height: '82%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#D0D0D0',
    borderRadius: 2,
    height: 4,
    marginBottom: 14,
    width: 42,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  searchBox: {
    alignItems: 'center',
    borderColor: colors.orange,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    height: 46,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  divider: {
    backgroundColor: '#E8E8E8',
    height: StyleSheet.hairlineWidth,
    marginTop: 14,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 28,
  },
  emptyImageWrap: {
    backgroundColor: colors.white,
  },
  emptyImage: {
    backgroundColor: colors.white,
    height: 180,
    width: 220,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#9A9A9A',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    minHeight: 220,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 12,
    paddingTop: 12,
  },
  emptyResultsContent: {
    flexGrow: 1,
    justifyContent: 'center',
    minHeight: 180,
    paddingTop: 24,
  },
  noResults: {
    color: '#9A9A9A',
    fontSize: 14,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: colors.white,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  resultName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  resultMeta: {
    color: '#9A9A9A',
    fontSize: 12,
    marginTop: 6,
  },
});
