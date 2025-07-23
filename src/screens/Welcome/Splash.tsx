import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const Splash = ({ navigation }) => {
  return (
    <LinearGradient
      colors={['#FF6D42', '#FF9E5A']}
      style={styles.container}
    >
      <Image
        source={require('../../assets/images/fooddeleviry.png')} // Change to your food app logo
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.card}>
        <Text style={styles.title}>
          VIP
          <Text style={styles.foodText}> Fast Food</Text>
        </Text>
        <Text style={styles.subtitle}>
          "Order your favorite meals in minutes and enjoy fast delivery right to your doorstep."
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Signup')} 
      >
        <Ionicons name="chevron-forward" size={24} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    left: -20
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 300,
    marginTop: -20,
    height: 200,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Quicksand-Bold'
  },
  foodText: {
    color: '#FF6D42',
    fontFamily: 'Quicksand-Bold'
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Quicksand-Medium',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF6D42',
    width: 70,
    height: 70,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    borderWidth: 7,
    borderColor:'#FF9E5A',
    elevation: 0,
  },
});

export default Splash;
