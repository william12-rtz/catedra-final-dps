import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default class CustomAlert {
  static show(title, message, buttons = [{ text: 'OK' }], type = 'info') {
    return new Promise((resolve) => {
      const event = new CustomEvent('showAlert', {
        detail: { title, message, buttons, type, resolve }
      });
      window.dispatchEvent(event);
    });
  }

  static alert(title, message, onPress) {
    this.show(title, message, [{ text: 'OK', onPress }], 'info');
  }

  static confirm(title, message, onConfirm, onCancel) {
    this.show(title, message, [
      { text: 'Cancelar', onPress: onCancel, style: 'cancel' },
      { text: 'Confirmar', onPress: onConfirm, style: 'primary' }
    ], 'warning');
  }
}

export function AlertProvider({ children }) {
  const [visible, setVisible] = React.useState(false);
  const [alertData, setAlertData] = React.useState({
    title: '',
    message: '',
    buttons: [],
    type: 'info',
    resolve: null
  });

  React.useEffect(() => {
    const handleShowAlert = (event) => {
      setAlertData(event.detail);
      setVisible(true);
    };

    window.addEventListener('showAlert', handleShowAlert);
    return () => window.removeEventListener('showAlert', handleShowAlert);
  }, []);

  const handleButtonPress = (button) => {
    setVisible(false);
    if (button.onPress) {
      button.onPress();
    }
    if (alertData.resolve) {
      alertData.resolve(button);
    }
  };

  const getIcon = () => {
    switch (alertData.type) {
      case 'success':
        return { name: 'check-circle', color: '#34A853' };
      case 'error':
        return { name: 'error', color: '#FF5252' };
      case 'warning':
        return { name: 'warning', color: '#FFA726' };
      default:
        return { name: 'info', color: '#4285F4' };
    }
  };

  const icon = getIcon();

  return (
    <>
      {children}
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => handleButtonPress(alertData.buttons[0])}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <View style={styles.iconContainer}>
              <MaterialIcons name={icon.name} size={48} color={icon.color} />
            </View>
            
            <Text style={styles.title}>{alertData.title}</Text>
            {alertData.message ? (
              <Text style={styles.message}>{alertData.message}</Text>
            ) : null}

            <View style={styles.buttonsContainer}>
              {alertData.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.buttonCancel,
                    button.style === 'destructive' && styles.buttonDestructive,
                    button.style === 'primary' && styles.buttonPrimary,
                    alertData.buttons.length === 1 && styles.buttonSingle
                  ]}
                  onPress={() => handleButtonPress(button)}
                >
                  <Text style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.buttonTextCancel,
                    (button.style === 'destructive' || button.style === 'primary') && styles.buttonTextWhite
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  buttonSingle: {
    backgroundColor: '#4285F4',
  },
  buttonCancel: {
    backgroundColor: '#f0f0f0',
  },
  buttonPrimary: {
    backgroundColor: '#4285F4',
  },
  buttonDestructive: {
    backgroundColor: '#FF5252',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  buttonTextCancel: {
    color: '#666',
  },
  buttonTextWhite: {
    color: '#fff',
  },
});
