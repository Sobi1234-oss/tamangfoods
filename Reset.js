import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Reset = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
   

      {/* Message */}
      <Text style={styles.heading}>Reset email sent</Text>
      <Text style={styles.instructionText}>
        We have sent an instructions email to {"\n"} sajin.tamang@figma.com.  {/* Clickable "Having problem?" */}
   <TouchableOpacity>
        <Text style={styles.problemText}>Having problem?</Text>
      </TouchableOpacity>
      </Text>
  
      {/* Send Again Button */}
      <TouchableOpacity style={styles.resendButton}>
        <Text style={styles.resendButtonText}>Send Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',

    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
  },
  problemText: {
    color: 'orange',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
    marginBottom: 0,
  },
  heading: {
    fontSize: 33,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 18,
    textAlign: 'left',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 0,
    lineHeight: 28,
  },
  resendButton: {
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
  resendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Reset;
