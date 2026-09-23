import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CollectionItem } from '../models/collections/CollectionItem';
import { colors } from '../theme/colors';

type CollectionItemOptionsMenuProps = {
  item: CollectionItem | null;
  onClose: () => void;
  onEdit: () => void;
  onRemove: () => void;
  visible: boolean;
};

export function CollectionItemOptionsMenu({
  item,
  onClose,
  onEdit,
  onRemove,
  visible,
}: CollectionItemOptionsMenuProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <Pressable onPress={() => undefined} style={styles.menu}>
          <Pressable onPress={onEdit} style={styles.item}>
            <View style={styles.iconCircle}>
              <Ionicons color={colors.white} name="pencil" size={14} />
            </View>
            <Text style={styles.itemLabel}>Editar item</Text>
          </Pressable>

          <View style={styles.divider} />

          <Pressable onPress={onRemove} style={styles.item}>
            <View style={styles.iconCircle}>
              <Ionicons color={colors.white} name="trash-outline" size={14} />
            </View>
            <Text style={styles.itemLabel}>Remover item</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  menu: {
    alignSelf: 'flex-end',
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 4,
    maxWidth: 210,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    width: '100%',
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 42,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    marginRight: 12,
    width: 24,
  },
  itemLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: '#E8E8E8',
    height: StyleSheet.hairlineWidth,
    marginVertical: 2,
  },
});
