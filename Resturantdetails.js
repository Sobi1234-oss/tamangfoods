import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  FlatList
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Restaurantdetails = ({ route, navigation }) => {
  const { restaurant } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const id = await AsyncStorage.getItem('userId');
      const role = await AsyncStorage.getItem('userRole');
      setUserId(id);
      setUserRole(role);
      setIsOwner(role === 'restaurant_owner' && id === restaurant.ownerId);
    };
    fetchUserData();

    const unsubscribe = firestore()
      .collection('items')
      .where('restaurantId', '==', restaurant.id)
      .onSnapshot((snapshot) => {
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productsList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [restaurant.id]);

  const navigateToProductDetails = (product) => {
    navigation.navigate('ProductDetais', { product });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: `data:image/jpeg;base64,${restaurant.imageBase64}` }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        
        <View style={styles.ratingLocationContainer}>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingText}>{restaurant.rating || '4.5'}</Text>
          </View>
          
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={20} color="#FF6347" />
            <Text style={styles.locationText}>{restaurant.city}</Text>
          </View>
        </View>
      </View>

      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>Products</Text>
      </View>
      
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.productCard}
            onPress={() => navigateToProductDetails(item)}
          >
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.productName}>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        contentContainerStyle={styles.productsList}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantImage: {
    width: '100%',
    height: height * 0.3,
    marginTop: 20,
  },
  restaurantInfo: {
    padding: 15,
    paddingBottom: 10,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    color: '#333',
  },
  ratingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#FF8F00',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  locationText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  productsHeader: {
    padding: 15,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  productsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  productsList: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  productCard: {
    width: width * 0.9,
    height: 150,
    marginRight: 15,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,left:5
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
});

export default Restaurantdetails;