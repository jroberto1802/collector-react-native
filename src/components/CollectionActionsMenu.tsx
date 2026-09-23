import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type CollectionActionsMenuProps = {
  onClose: () => void;
  onSave: () => void;
  visible: boolean;
};

export function CollectionActionsMenu({
  onClose,
  onSave,
  visible,
}: CollectionActionsMenuProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <Pressable onPress={onClose} style={styles.backdrop}>
        <View style={styles.anchor}>
          <Pressable onPress={() => undefined} style={styles.menu}>
            <Pressable
              onPress={() => {
                onClose();
                onSave();
              }}
              style={styles.item}
            >
              <View style={styles.iconCircle}>
                <Ionicons color={colors.white} name="save-outline" size={15} />
              </View>
              <Text style={styles.itemLabel}>Salvar Coleta</Text>
            </Pressable>

            <View style={styles.divider} />

            <Pressable onPress={onClose} style={styles.item}>
              <View style={styles.iconCircle}>
                <Ionicons color={colors.white} name="sync-outline" size={15} />
              </View>
              <Text style={styles.itemLabel}>Sincronizar Coleta</Text>
            </Pressable>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  anchor: {
    alignItems: 'flex-end',
    paddingBottom: 96,
    paddingHorizontal: 18,
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: 10,
    elevation: 4,
    minWidth: 210,
    paddingHorizontal: 14,
    paddingVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  item: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 44,
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
