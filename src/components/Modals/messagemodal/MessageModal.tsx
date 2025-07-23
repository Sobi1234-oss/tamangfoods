import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type MessageModalProps = {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  buttonText?: string;
};

const MessageModal: React.FC<MessageModalProps> = ({
  visible,
  onClose,
  type,
  title,
  message,
  buttonText = 'OK',
}) => {
  const iconName = type === 'success' ? 'check-circle' : 'error';
  const iconColor = type === 'success' ? '#4BB543' : '#ff3333';
  const bgColor = type === 'success' ? '#f6ffed' : '#fff2f0';
  const borderColor = type === 'success' ? '#b7eb8f' : '#ffccc7';

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: bgColor, borderColor }]}>
          <MaterialIcons name={iconName} size={48} color={iconColor} />
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <Pressable
            style={[styles.button, { backgroundColor: iconColor }]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{buttonText}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    width: '80%',
  },
  modalTitle: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    paddingHorizontal: 20,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MessageModal;