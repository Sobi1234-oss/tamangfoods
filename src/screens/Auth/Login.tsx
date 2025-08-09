import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import useUserStore from '../../components/store/UserStore';
import firestore from '@react-native-firebase/firestore';
import MessageModal from '../../components/Modals/messagemodal/MessageModal';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthGlobalStyles } from '../../components/Stylesheets/AuthGlobalStyles';
import { storeFCMToken } from '../../Services/notificationService';

type RootStackParamList = {
  UserTabs: undefined;
  Signup: undefined;
  Forget: undefined;
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
  const user = auth().currentUser;
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('UserTabs');
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
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    
    if (!userCredential.user.emailVerified) {
      await auth().signOut();
      showModal(
        'error', 
        'Email Not Verified', 
        'Please verify your email before logging in. Check your inbox for the verification link.'
      );
      return;
    }

    const uid = userCredential.user.uid;
    
  
    
    
    // Get user data
    const userDoc = await firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new Error('User data not found in database.');
    }
    if (user) {
  await storeFCMToken(user.uid);
}
    const userData = userDoc.data();

    // Update user store
    login({
      uid,
      email: userCredential.user.email || '',
      fullName: userData?.fullName || '',
      role: userData?.role || 'customer',
    });

    
   

  } catch (error: unknown) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (error instanceof Error) {
        console.error('Login error:', error.message);
        
        if ('code' in error) {
          switch (error.code) {
            case 'auth/user-not-found':
              errorMessage = 'No account found with this email.';
              break;
            case 'auth/wrong-password':
              errorMessage = 'Incorrect password.';
              break;
            case 'auth/invalid-email':
              errorMessage = 'The email address is invalid.';
              break;
            case 'auth/too-many-requests':
              errorMessage = 'Too many failed attempts. Please try again later.';
              break;
            case 'auth/invalid-credential':
              errorMessage = 'Invalid login credentials.';
              break;
          }
        }
      } else {
        console.error('Unknown error during login:', error);
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