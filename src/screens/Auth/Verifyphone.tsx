import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
type RootStackParamList = {
  Verifyphone: {
    phoneNumber: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
  UserTabs: undefined;
  Signup: undefined;
};

type VerifyPhoneScreenRouteProp = RouteProp<RootStackParamList, 'Verifyphone'>;
type NavigationProp = StackNavigationProp<RootStackParamList>;

const Verifyphone: React.FC = () => {
  const route = useRoute<VerifyPhoneScreenRouteProp>();
  const navigation = useNavigation<NavigationProp>();

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const { confirmation, phoneNumber } = route.params;

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit code.');
      return;
    }

    setIsVerifying(true);

    try {
      const credential = await confirmation.confirm(otp);
      const user = credential.user;
      
      // Check if user exists in Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create new user in Firestore
        await firestore().collection('users').doc(user.uid).set({
          phoneNumber: user.phoneNumber,
          createdAt: firestore.FieldValue.serverTimestamp(),
          role: 'customer',
        });
      }
      
      Alert.alert('Success', 'Phone number verified!');
      navigation.navigate('UserTabs');
    } catch (error: any) {
      console.error('OTP Verification Error:', error);
      let errorMessage = 'Invalid OTP or expired code.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please try again.';
      } else if (error.code === 'auth/session-expired') {
        errorMessage = 'Session expired. Please request a new code.';
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      Alert.alert('Success', 'A new verification code has been sent.');
    } catch (error) {
      console.error('Resend Error:', error);
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Verify Phone</Text>
        <Text style={styles.subtitle}>Enter the code sent to {phoneNumber}</Text>

        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity 
          style={[styles.button, isVerifying && styles.disabledButton]} 
          onPress={handleVerify} 
          disabled={isVerifying}
        >
          <Text style={styles.buttonText}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.resendButton} 
          onPress={handleResendCode}
          disabled={isVerifying}
        >
          <Text style={styles.resendText}>Resend Code</Text>
        </TouchableOpacity>

        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.backText}>Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 5,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resendButton: {
    alignItems: 'center',
    padding: 10,
  },
  resendText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  backContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#777',
    fontSize: 16,
  },
});

export default Verifyphone;