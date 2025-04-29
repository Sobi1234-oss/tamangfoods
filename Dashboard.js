import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>

<TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('AddResturant')}>
        <Image source={require('./assets/addresturant.png')} style={styles.icon} />
        <Text style={styles.buttonText}>Add Resturant</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.button1} 
        onPress={() => navigation.navigate('Addproducts')}>
        <Image source={require('./assets/add.png')} style={styles.icon} />
        <Text style={styles.buttonText}>Add Product</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button2} 
        onPress={() => navigation.navigate('Addcategory')}>
        <Image source={require('./assets/category.png')} style={styles.icon} />
        <Text style={styles.buttonText}> Add Category</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems:'flex-start',
    backgroundColor: 'white',
 top:0,padding:10
  },
  button: {
    backgroundColor: '#D9D9D9',
    padding: 15,
    borderRadius: 5,
    
    width: 160,height:160,
    alignItems: 'center',
  
    justifyContent: 'center',top:-60
  },
  button1: {
    backgroundColor: '#D9D9D9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 0,
    width: 160,height:160,
    alignItems: 'center',
    
    justifyContent: 'center',marginLeft:180,marginTop:-377
  },
  button2: {
    backgroundColor: '#D9D9D9',
    padding: 15,
    borderRadius: 5,
    marginBottom: 0,
    width: 165,height:160,
    alignItems: 'center',
 paddingBottom:10,
    justifyContent: 'center',top:-130
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 0,
  },
  icon: {
    width: 100,
    height: 100,
  },
});

export default Dashboard;
