import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Header from '../../components/headers/Header';
import { globalStyles } from '../../components/Stylesheets/AddGlobalStyles';

const Add = () => {
  const navigation = useNavigation();

  return (
    <View style={globalStyles.mainContainer}>
      <Header title="Dashboard" showBack={true} />
      
      <View style={globalStyles.buttonContainer}>
        <TouchableOpacity 
          style={globalStyles.addButton} 
          onPress={() => navigation.navigate('Addproducts')}
        >
          <Icon name="add-circle" size={80} color="#FF6D42" />
          <Text style={globalStyles.addButtonText}>Add Product</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={globalStyles.addButton} 
          onPress={() => navigation.navigate('Addcategory')}
        >
          <Icon name="category" size={80} color="#FF6D42" />
          <Text style={globalStyles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Add;