import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CollectionItem } from '../models/collections/CollectionItem';
import {
  formatCollectionItemQuantity,
  formatCurrencyBrl,
} from '../models/collections/CollectionItem';
import {
  PRICE_TYPE,
  SEARCH_TYPE,
  type PriceType,
  type SearchType,
} from '../constants/SettingsConstants';
import { colors } from '../theme/colors';
import { formatIsoToBrDate } from '../utils/dateMask';

type CollectionItemCardProps = {
  isGrade?: boolean;
  item: CollectionItem;
  onOpenOptions: (item: CollectionItem) => void;
  priceType?: PriceType;
  searchType?: SearchType;
};

export function CollectionItemCard({
  isGrade = false,
  item,
  onOpenOptions,
  priceType = PRICE_TYPE.PURCHASE,
  searchType = SEARCH_TYPE.BARCODE,
}: CollectionItemCardProps) {
  const manufacturingLabel = formatIsoToBrDate(item.manufacturingDate);
  const expirationLabel = formatIsoToBrDate(item.expirationDate);
  const hasLotDates = Boolean(manufacturingLabel || expirationLabel);
  const isReferenceSearch = searchType === SEARCH_TYPE.REFERENCE;
  const price =
    priceType === PRICE_TYPE.SALE ? item.salePrice : item.purchasePrice;

  const codeMeta = isReferenceSearch
    ? `Referência: ${item.reference || '-'}`
    : `Cód: ${item.barcode || '-'}`;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.content}>
          <Text style={styles.meta}>
            {`Qtde: ${formatCollectionItemQuantity(item.quantity)}   ${codeMeta}   Preço: ${formatCurrencyBrl(price)}`}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          {hasLotDates ? (
            <Text style={styles.secondaryMeta}>
              {expirationLabel ? `Validade: ${expirationLabel}` : null}
              {expirationLabel && manufacturingLabel ? '   ' : null}
              {manufacturingLabel
                ? `Fabricação: ${manufacturingLabel}`
                : null}
            </Text>
          ) : null}
          {isGrade ? (
            <Text style={styles.secondaryMeta}>
              <Text style={styles.gradeLabel}>Tamanho: </Text>
              <Text style={styles.gradeValue}>{item.size || '-'}</Text>
              {'   '}
              <Text style={styles.gradeLabel}>Cor: </Text>
              <Text style={styles.gradeValue}>{item.color || '-'}</Text>
            </Text>
          ) : null}
        </View>

        <Pressable
          hitSlop={10}
          onPress={() => onOpenOptions(item)}
          style={styles.optionsButton}
        >
          <Ionicons color={colors.orange} name="ellipsis-vertical" size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  meta: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  secondaryMeta: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 8,
  },
  gradeLabel: {
    color: '#A0A0A0',
  },
  gradeValue: {
    color: colors.text,
  },
  optionsButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
});
