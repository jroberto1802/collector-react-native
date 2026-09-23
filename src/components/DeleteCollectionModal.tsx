import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Collection } from '../models/collections/Collection';
import { colors } from '../theme/colors';

type DeleteCollectionModalProps = {
  collection: Collection | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  visible: boolean;
};

export function DeleteCollectionModal({
  collection,
  isSubmitting,
  onCancel,
  onConfirm,
  visible,
}: DeleteCollectionModalProps) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable
            disabled={isSubmitting}
            hitSlop={12}
            onPress={onCancel}
            style={styles.closeButton}
          >
            <Ionicons color="#7E7E7E" name="close" size={23} />
          </Pressable>

          <View style={styles.alertCircle}>
            <Text style={styles.alertSymbol}>!</Text>
          </View>

          <Text style={styles.title}>Deseja deletar esta coleta?</Text>
          <Text style={styles.description}>
            {collection
              ? `A coleta "${collection.name}" será removida permanentemente.`
              : 'Esta ação não poderá ser desfeita.'}
          </Text>

          <View style={styles.actions}>
            <Pressable
              disabled={isSubmitting}
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelLabel}>Não</Text>
            </Pressable>
            <Pressable
              disabled={isSubmitting}
              onPress={onConfirm}
              style={[styles.confirmButton, isSubmitting ? styles.disabled : null]}
            >
              <Text style={styles.confirmLabel}>
                {isSubmitting ? 'Excluindo...' : 'Sim'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 7,
    maxWidth: 390,
    paddingBottom: 17,
    paddingHorizontal: 16,
    paddingTop: 18,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    right: 24,
    top: 28,
    zIndex: 1,
  },
  alertCircle: {
    alignItems: 'center',
    borderColor: '#FFE7D8',
    borderRadius: 48,
    borderWidth: 8,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  alertSymbol: {
    color: '#FFE1CF',
    fontSize: 58,
    fontWeight: '300',
    lineHeight: 64,
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
    marginTop: 18,
    textAlign: 'center',
  },
  description: {
    color: '#A0A0A0',
    fontSize: 13,
    marginTop: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 18,
    marginTop: 21,
    width: '100%',
  },
  cancelButton: {
    alignItems: 'center',
    borderColor: colors.orange,
    borderRadius: 7,
    borderWidth: 1,
    flex: 1,
    height: 43,
    justifyContent: 'center',
  },
  cancelLabel: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 7,
    flex: 1,
    height: 43,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.7,
  },
  confirmLabel: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
