import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';

const Splash = ({ navigation }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Circle Background */}
      <View style={styles.circleContainer} />
      
      {/* Logo */}
      <Image 
        source={require('./images/g12.png')} // Replace with your logo path
        style={styles.logo}
      />
      
      {/* Heading */}
      <Text style={styles.heading}>
      <Text style={styles.heading}>
  Tamang{"\n"}Food Service
</Text>
      </Text>

      {/* Illustration */}
      <Image 
        source={require('./images/Illustration.png')} // Replace with your image path
        style={styles.illustration}
      />

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.subText}>It’s a pleasure to meet you. We are excited that you’re here so let’s get started!</Text>

      {/* Get Started Button */}
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.replace('Walkthrough')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 0,
    paddingBottom: 0
  },
  circleContainer: {
    width: 437,
    height: 437,
    borderRadius: 220,
    backgroundColor: '#FAC77D',
    position: 'absolute',
    top: -49,
    left: -101,
    opacity: 0.3,
  },
  logo: {
    width: 65,
    height: 65,
    position: 'absolute',
    top: 70,
    left: 30,
    resizeMode: 'contain',
  },
  heading: {
    fontSize: 37,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    top: 60,
    left: 120,
    Width:
    258,
    Height:
    49,
 
    textAlign: 'center',
  },
  illustration: {
    width: 213.49,
    height: 243.09,
    resizeMode: 'contain',
    position: 'absolute',
    top: 212,
    left: 80,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    position: 'absolute',
    top: 466,
    left: 24,
    textAlign: 'center',
    width: 327,
    height: 128,
  },
  subText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 30,top: 210,
  },
  button: {
    backgroundColor: 'orange',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: 'blue',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    width: 335,
    height: 48,
    position: 'absolute',
    top: 570,
    left: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Splash;
