import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const VerifyPhone = () => {
  const navigation = useNavigation();
  const [code, setCode] = useState(['', '', '', '']); // Array to store the 4-digit code

  const handleVerify = () => {
    // Logic to verify the code
    const verificationCode = code.join(''); // Combine the array into a single string
    console.log('Verification Code:', verificationCode);
    navigation.navigate('Homescreen'); // Navigate to the next screen after verification
  };

  const handleResendCode = () => {
    // Logic to resend the verification code
    console.log('Resend Code');
  };

  const handleCodeChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-focus to the next input box
    if (text && index < 3) {
      // Assuming you have refs for the inputs
      refs[index + 1].focus();
    }
  };

  const handleenter = () => {
    navigation.navigate('Enteradress'); 
  };
  // Create refs for the input boxes
  const refs = [React.createRef(), React.createRef(), React.createRef(), React.createRef()];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.headerText}>Verify phone number</Text>
      <Text style={styles.subHeaderText}>Enter the 4-Digit code sent to you at +610489632578</Text>

      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.codeInput}
            placeholder="0"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            ref={refs[index]}
          />
        ))}
      </View>

      <TouchableOpacity onPress={handleResendCode}>
        <Text style={styles.resendText}>Didn’t receive code? <Text style={styles.resendLink}>Resend Again.</Text></Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Verify</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.verifyButton} onPress={handleenter}>
        <Text style={styles.verifyButtonText}>enter adress</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>By signing up, you agree to our <Text style={styles.link}>Terms & Conditions</Text> and <Text style={styles.link}>Privacy Policy</Text>.</Text>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',

  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'start',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'start',
    marginBottom: 30,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resendLink: {
    color: 'orange',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: 'orange',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  link: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

export default VerifyPhone;