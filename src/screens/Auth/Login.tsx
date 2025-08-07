import React, { useState, useEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signInWithEmailAndPassword } from '@react-native-firebase/auth';
import useUserStore from '../../components/store/UserStore';
import firestore from '@react-native-firebase/firestore';
import MessageModal from '../../components/Modals/messagemodal/MessageModal';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthGlobalStyles } from '../../components/Stylesheets/AuthGlobalStyles';
type RootStackParamList = {
  UserTabs: undefined;
  Signup: undefined;
  Forget: undefined;
  // Add other routes here
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserTabs'>;

const Login: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [isValidEmail, setIsValidEmail] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('error');
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalMessage, setModalMessage] = useState<string>('');
  
  const { login, isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('UserTabs', { screen: 'Homescreen' });
    }
  }, [isAuthenticated, navigation]);

  const showModal = (type: 'success' | 'error', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showModal('error', 'Error', 'Please enter both email and password');
      return;
    }

    if (!isValidEmail) {
      showModal('error', 'Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        showModal(
          'error', 
          'Email Not Verified', 
          'Please verify your email before logging in. Check your inbox for the verification link.'
        );
        return;
      }

      const uid = userCredential.user.uid;
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (!userDoc.exists) {
        throw new Error('User data not found in database.');
      }

      const userDataFromDB = userDoc.data();

      login({
        uid,
        email: userCredential.user.email || '',
        fullName: userDataFromDB?.fullName || '',
        role: userDataFromDB?.role || 'customer',
      });

    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'The email address is invalid.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      showModal('error', 'Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (text: string) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(text));
  };

  const handleModalClose = () => {
    setModalVisible(false);
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
        <Text style={AuthGlobalStyles.title}>Welcome Back</Text>
        <Text style={AuthGlobalStyles.subtitle}>Login to your account</Text>

        {/* Email Input */}
        <Text style={AuthGlobalStyles.inputLabel}>Email Address</Text>
        <View style={AuthGlobalStyles.inputContainer}>
          <Icon name="email-outline" size={20} color="#7a7a7a" style={AuthGlobalStyles.icon} />
          <TextInput
            style={AuthGlobalStyles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={validateEmail}
          />
          {email.length > 0 && (
            <Icon 
              name={isValidEmail ? "check-circle-outline" : "close-circle-outline"} 
              size={20} 
              color={isValidEmail ? "#4CAF50" : "#F44336"} 
              style={AuthGlobalStyles.iconRight} 
            />
          )}
        </View>

        {/* Password Input */}
        <Text style={AuthGlobalStyles.inputLabel}>Password</Text>
        <View style={AuthGlobalStyles.inputContainer}>
          <Icon name="lock-outline" size={20} color="#7a7a7a" style={AuthGlobalStyles.icon} />
          <TextInput
            style={AuthGlobalStyles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity 
            onPress={() => setPasswordVisible(!passwordVisible)}
            style={AuthGlobalStyles.passwordToggle}
          >
            <Icon
              name={passwordVisible ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#7a7a7a"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity 
          style={{ alignSelf: 'flex-end', marginBottom: 20 }}
          onPress={() => navigation.navigate('Forget')}
        >
          <Text style={AuthGlobalStyles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity 
          style={[AuthGlobalStyles.primaryButton, isLoading && AuthGlobalStyles.disabledButton]} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={AuthGlobalStyles.buttonText}>
            {isLoading ? 'Logging In...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View style={AuthGlobalStyles.linkContainer}>
          <Text style={AuthGlobalStyles.linkText}>Don't have an account? </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
          >
            <Text style={AuthGlobalStyles.primaryLink}>Sign Up</Text>
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
export default Login;