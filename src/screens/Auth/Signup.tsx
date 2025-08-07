import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import MessageModal from '../../components/Modals/messagemodal/MessageModal';
import { AuthGlobalStyles } from '../../components/Stylesheets/AuthGlobalStyles';
type SignupProps = {
  navigation: {
    navigate: (route: string) => void;
  };
};

const Signup: React.FC<SignupProps> = ({ navigation }) => {
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const methods = await auth().fetchSignInMethodsForEmail(email);
      return methods.length === 0;
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        return false;
      }
      return false;
    }
  };

  const createuser = async () => {
    if (!fullName || !email || !password) {
      showModal('error', 'Error', 'Please fill all fields');
      return;
    }

    if (!emailValid) {
      showModal('error', 'Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      showModal('error', 'Error', 'Password should be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {

      const isEmailAvailable = await checkEmailAvailability(email);

      if (!isEmailAvailable) {
        showModal('error', 'Email Taken', 'This email is already registered. Please use a different email or login.');
        return;
      }


      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;


      await user.sendEmailVerification();


      await firestore().collection('users').doc(user.uid).set({
        fullName,
        email,
        role: 'customer',
        emailVerified: false,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      showModal(
        'success',
        'Verify Your Email',
        'We sent a verification email. Please check your inbox and verify your email to complete registration.'
      );


      setFullName('');
      setEmail('');
      setPassword('');

    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'That email address is already in use!';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'That email address is invalid!';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      showModal('error', 'Error', errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(text));
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      navigation.navigate('Login');
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={AuthGlobalStyles.container}
    >
      <ScrollView
        contentContainerStyle={AuthGlobalStyles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={AuthGlobalStyles.title}>Create Account</Text>
        <Text style={AuthGlobalStyles.subtitle}>Join us today!</Text>

        {/* Full Name Input */}
        <View style={AuthGlobalStyles.inputContainer}>
          <Icon name="person-outline" size={20} color="#7a7a7a" style={AuthGlobalStyles.icon} />
          <TextInput
            style={AuthGlobalStyles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>

        {/* Email Input */}
        <View style={AuthGlobalStyles.inputContainer}>
          <MaterialIcon name="email" size={20} color="#7a7a7a" style={AuthGlobalStyles.icon} />
          <TextInput
            style={AuthGlobalStyles.input}
            placeholder="Email Address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={validateEmail}
          />
          {email.length > 0 && (
            <Icon
              name={emailValid ? "checkmark-circle" : "close-circle"}
              size={20}
              color={emailValid ? "#4CAF50" : "#F44336"}
              style={AuthGlobalStyles.iconRight}
            />
          )}
        </View>

        {/* Password Input */}
        <View style={AuthGlobalStyles.inputContainer}>
          <Icon name="lock-closed-outline" size={20} color="#7a7a7a" style={AuthGlobalStyles.icon} />
          <TextInput
            style={AuthGlobalStyles.input}
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={AuthGlobalStyles.passwordToggle}
          >
            <Icon
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#7a7a7a"
            />
          </TouchableOpacity>
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[AuthGlobalStyles.primaryButton, isLoading && AuthGlobalStyles.disabledButton]}
          onPress={createuser}
          disabled={isLoading}
        >
          <Text style={AuthGlobalStyles.buttonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View style={AuthGlobalStyles.dividerContainer}>
          <Text style={AuthGlobalStyles.dividerText}>Or</Text>
        </View>

        <View style={AuthGlobalStyles.linkContainer}>
          <Text style={AuthGlobalStyles.linkText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={AuthGlobalStyles.primaryLink}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Message Modal */}
        <MessageModal
          visible={modalVisible}
          onClose={handleModalClose}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;