import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { CollectionItem } from '../models/collections/CollectionItem';
import {
  formatCollectionItemQuantity,
  formatCurrencyBrl,
} from '../models/collections/CollectionItem';
import { colors } from '../theme/colors';

type CollectionItemCardProps = {
  item: CollectionItem;
  onOpenOptions: (item: CollectionItem) => void;
};

export function CollectionItemCard({
  item,
  onOpenOptions,
}: CollectionItemCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.content}>
          <Text style={styles.meta}>
            {`Qtde: ${formatCollectionItemQuantity(item.quantity)}   Cód: ${item.productId}   Preço: ${formatCurrencyBrl(item.purchasePrice)}`}
          </Text>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
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
  optionsButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
});
