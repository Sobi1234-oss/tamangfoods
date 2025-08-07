import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

type RootStackParamList = {
  Verifyphone: { 
    phoneNumber: string;
    confirmation: FirebaseAuthTypes.ConfirmationResult;
  };
  Signup: undefined;
};

type LoginWithPhoneScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Verifyphone'>;

const Loginwithphone: React.FC = () => {
  const navigation = useNavigation<LoginWithPhoneScreenNavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<Country['cca2']>('US');
  const [callingCode, setCallingCode] = useState('1');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async () => {
    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

    if (!phoneNumber || phoneNumber.length < 6) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);

    try {
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      
      navigation.navigate('Verifyphone', {
        phoneNumber: fullPhoneNumber,
        confirmation, 
      });
    } catch (error: any) {
      console.error('Phone Auth Error:', error);
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'The phone number is invalid.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.heading}>Phone Number</Text>
        <Text style={styles.subText}>Enter your phone number to continue</Text>

        <View style={styles.inputContainer}>
          <CountryPicker
            withCallingCodeButton
            withFlag
            withFilter
            countryCode={countryCode}
            onSelect={(country) => {
              setCountryCode(country.cca2);
              setCallingCode(country.callingCode[0]);
            }}
          />
          <Text style={styles.callingCode}>+{callingCode}</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={15}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.disabledButton]} 
          onPress={handleSendCode}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Text>
        </TouchableOpacity>

        <View style={styles.backToSignup}>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.backText}>Back to Email Sign Up</Text>
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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 20,
  },
  callingCode: {
    fontSize: 16,
    marginLeft: 5,
    marginRight: 10,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backToSignup: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
});

export default Loginwithphone;