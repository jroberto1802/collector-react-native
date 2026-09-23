import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { CollectionItem } from '../models/collections/CollectionItem';
import { formatCurrencyBrl } from '../models/collections/CollectionItem';
import { colors } from '../theme/colors';

type EditCollectionItemModalProps = {
  errorMessage: string;
  isSubmitting: boolean;
  item: CollectionItem | null;
  onClose: () => void;
  onQuantityChange: (value: string) => void;
  onSubmit: () => void;
  quantity: string;
  visible: boolean;
};

export function EditCollectionItemModal({
  errorMessage,
  isSubmitting,
  item,
  onClose,
  onQuantityChange,
  onSubmit,
  quantity,
  visible,
}: EditCollectionItemModalProps) {
  if (!item) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar item</Text>
            <Pressable
              disabled={isSubmitting}
              hitSlop={12}
              onPress={onClose}
              style={styles.closeButton}
            >
              <Ionicons color="#8A8A8A" name="close" size={22} />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <Text style={styles.label}>Descrição</Text>
          <Text style={styles.value}>{item.name}</Text>

          <Text style={styles.label}>Código de Barras</Text>
          <Text style={styles.value}>{item.barcode || '-'}</Text>

          <Text style={styles.label}>Preço de Compra</Text>
          <Text style={styles.value}>
            {formatCurrencyBrl(item.purchasePrice)}
          </Text>

          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            editable={!isSubmitting}
            keyboardType="decimal-pad"
            onChangeText={onQuantityChange}
            selectionColor={colors.orange}
            style={styles.quantityInput}
            value={quantity}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <Pressable
            disabled={isSubmitting}
            onPress={onSubmit}
            style={[styles.saveButton, isSubmitting ? styles.saveDisabled : null]}
          >
            <Text style={styles.saveLabel}>
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 10,
    maxWidth: 390,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 16,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  divider: {
    backgroundColor: '#E8E8E8',
    height: StyleSheet.hairlineWidth,
    marginBottom: 14,
    marginTop: 14,
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 10,
  },
  value: {
    color: colors.text,
    fontSize: 14,
  },
  quantityInput: {
    backgroundColor: '#F5F4F3',
    borderRadius: 8,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    height: 46,
    marginTop: 6,
    paddingHorizontal: 12,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 8,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.orange,
    borderRadius: 8,
    height: 46,
    justifyContent: 'center',
    marginTop: 18,
  },
  saveDisabled: {
    opacity: 0.7,
  },
  saveLabel: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
