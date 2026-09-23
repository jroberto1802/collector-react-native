import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Collection } from '../models/collections/Collection';
import {
  formatCollectionHeader,
  formatCollectionItemCount,
} from '../models/collections/Collection';
import { colors } from '../theme/colors';

type CollectionCardProps = {
  collection: Collection;
  onOpen: () => void;
  onOpenOptions: (collection: Collection) => void;
};

export function CollectionCard({
  collection,
  onOpen,
  onOpenOptions,
}: CollectionCardProps) {
  return (
    <Pressable onPress={onOpen} style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.content}>
          <Text style={styles.meta}>{formatCollectionHeader(collection)}</Text>
          <Text style={styles.itemCount}>
            {formatCollectionItemCount(collection.itemCount)}
          </Text>
          <Text style={styles.name}>{collection.name}</Text>
        </View>

        <Pressable
          hitSlop={10}
          onPress={(event) => {
            event.stopPropagation?.();
            onOpenOptions(collection);
          }}
          style={styles.optionsButton}
        >
          <Ionicons color={colors.orange} name="ellipsis-vertical" size={18} />
        </Pressable>
      </View>

      <View style={styles.badgesRow}>
        <View style={styles.statusBadge}>
          <Text style={styles.badgeLabel}>{collection.status}</Text>
        </View>
        {collection.archived ? (
          <View style={styles.archivedBadge}>
            <Text style={styles.badgeLabel}>Arquivada</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: '#E6E6E6',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    paddingBottom: 12,
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
  itemCount: {
    color: '#A0A0A0',
    fontSize: 12,
    marginTop: 2,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  optionsButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  badgesRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  statusBadge: {
    backgroundColor: '#5B5B5B',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  archivedBadge: {
    backgroundColor: colors.orange,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeLabel: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
});
