import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

const Login = () => {
  const navigation = useNavigation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValidEmail, setIsValidEmail] = useState(null);

  // Configure Google Sign-In
  GoogleSignin.configure({
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Replace with your actual client ID
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Get user role from Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      const userData = userDoc.data();

      await AsyncStorage.setItem('userToken', await user.getIdToken());
      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('userEmail', user.email);
      await AsyncStorage.setItem('userRole', userData?.role || 'user');

      // Navigate based on user role
      navigation.reset({
        index: 0,
        routes: [{ name: userData?.role === 'admin' ? 'AdminScreen' : 'Homescreen' }],
      });
    } catch (error) {
      let errorMessage = 'Login failed. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      }
      Alert.alert('Error', errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create new user in Firestore
        await firestore().collection('users').doc(user.uid).set({
          email: user.email,
          fullName: user.displayName || '',
          role: 'user',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      await AsyncStorage.setItem('userToken', idToken);
      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('userEmail', user.email);
      await AsyncStorage.setItem('userRole', 'user');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Homescreen' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // Login with permissions
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      
      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }

      // Get the access token
      const data = await AccessToken.getCurrentAccessToken();
      
      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }

      // Create a Firebase credential with the access token
      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

      // Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(facebookCredential);
      const user = userCredential.user;

      // Check if user exists in Firestore
      const userDoc = await firestore().collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
        // Create new user in Firestore
        await firestore().collection('users').doc(user.uid).set({
          email: user.email,
          fullName: user.displayName || '',
          role: 'user',
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      await AsyncStorage.setItem('userToken', data.accessToken);
      await AsyncStorage.setItem('userId', user.uid);
      await AsyncStorage.setItem('userEmail', user.email || '');
      await AsyncStorage.setItem('userRole', 'user');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Homescreen' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to Tamang Food Services</Text>
      <Text style={styles.instructionText}>Enter your credentials to access your account</Text>

      <Text style={styles.inputHeading}>Email</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          placeholderTextColor="#999"
          onChangeText={(text) => {
            setEmail(text);
            setIsValidEmail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text));
          }}
          value={email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {isValidEmail !== null && (
          <Icon 
            name={isValidEmail ? "check-circle-outline" : "close-circle-outline"} 
            size={22} 
            color={isValidEmail ? "green" : "red"} 
          />
        )}
      </View>

      <Text style={styles.inputHeading}>Password</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          placeholderTextColor="#999"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Icon 
            name={passwordVisible ? "eye-off-outline" : "eye-outline"} 
            size={22} 
            color="#999" 
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.forgotPasswordButton}
        onPress={() => navigation.navigate('Forget')}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.loginButton} 
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Icons */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity 
          style={styles.socialIcon}
          onPress={handleGoogleSignIn}
        >
          <Icon name="google" size={24} color="#DB4437" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.socialIcon}
          onPress={handleFacebookLogin}
        >
          <Icon name="facebook" size={24} color="#3b5998" />
        </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'start',
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'start',
  },
  inputHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: 'orange',
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'orange',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontWeight: '600',
  },
  socialLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666',
  },
  signupLink: {
    color: 'orange',
    fontWeight: 'bold',
  },
});

export default Login;