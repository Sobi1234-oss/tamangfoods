import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

const Forget = () => {
  const navigation = useNavigation();  

  return (
    <View style={styles.container}>
      {/* Heading */}
      <Text style={styles.welcomeText}>Forgot Password</Text>
      
      {/* Instruction */}
      <Text style={styles.instructionText}>
        Enter your email address and we will send you reset instructions.
      </Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.underlineInput}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={() => navigation.navigate('Reset')}>
        <Text style={styles.resetButtonText}>Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    padding: 15,
  },
  welcomeText: {
    fontSize: 34,
    fontWeight: '300',
    textAlign: 'start',
    marginBottom: 5,
    marginTop: -330,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'start',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 0,    lineHeight: 28,
  },
  label: {
    width: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  underlineInput: {
    width: '100%',
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 5,
    marginBottom: 20,
  },
  resetButton: {
    width: '100%',
    height: 50,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Forget;
