import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Collection } from '../models/collections/Collection';
import { colors } from '../theme/colors';

type CollectionOptionsMenuProps = {
  collection: Collection | null;
  onArchive: () => void;
  onClose: () => void;
  onDelete: () => void;
  onUnarchive: () => void;
  visible: boolean;
};

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

function MenuItem({ icon, label, onPress }: MenuItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={styles.iconCircle}>
        <Ionicons color={colors.white} name={icon} size={14} />
      </View>
      <Text style={styles.itemLabel}>{label}</Text>
    </Pressable>
  );
}

export function CollectionOptionsMenu({
  collection,
  onArchive,
  onClose,
  onDelete,
  onUnarchive,
  visible,
}: CollectionOptionsMenuProps) {
  const isArchived = collection?.archived === true;

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
          <MenuItem icon="pencil" label="Editar coleta" onPress={onClose} />
          <MenuItem
            icon={isArchived ? 'arrow-undo-outline' : 'archive-outline'}
            label={isArchived ? 'Desarquivar coleta' : 'Arquivar coleta'}
            onPress={isArchived ? onUnarchive : onArchive}
          />
          <MenuItem icon="copy-outline" label="Clonar coleta" onPress={onClose} />
          <MenuItem icon="trash-outline" label="Deletar Coleta" onPress={onDelete} />
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
    maxWidth: 230,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
});
