import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header'; // Adjust path as needed

const Add = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Header title="Dashboard" showBack={true} />
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Addproducts')}
        >
          <Icon name="add-circle" size={80} color="#FF6D42" />
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Addcategory')}
        >
          <Icon name="category" size={80} color="#FF6D42" />
          <Text style={styles.buttonText}>Add Category</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    width: '45%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#333',
    fontSize: 18,
    fontFamily: 'Quicksand-Bold',
    marginTop: 10,
  },
});

export default Add;