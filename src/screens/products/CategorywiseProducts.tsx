import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Header from '../../components/headers/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2; // Calculate width for 2 cards with padding

const CategorywiseProducts = ({ route, navigation }) => {
  const { categoryId, categoryName } = route.params;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('items')
      .where('categoryId', '==', categoryId)
      .onSnapshot(
        (querySnapshot) => {
          const itemsData = [];
          querySnapshot.forEach((doc) => {
            const itemData = doc.data();
            itemsData.push({
              id: doc.id,
              ...itemData,
              // Ensure price is always a number
              price: typeof itemData.price === 'number' ? itemData.price : 0,
            });
          });
          setItems(itemsData);
          setLoading(false);
        },
        (error) => {
          console.error('Error fetching items:', error);
          setLoading(false);
        }
      );

    return () => unsubscribe();
  }, [categoryId]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name || 'Unnamed Product'}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.itemPrice}>
            Rs {item.price?.toFixed(2) || '0.00'}
          </Text>
        </View>

        {item.rating && (
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFA000" />
            <Text style={styles.ratingText}>
              {typeof item.rating === 'number' ? item.rating.toFixed(1) : '0.0'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6D42" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header 
        title={categoryName} 
        showBack={true} 
        onBackPress={() => navigation.goBack()}
      />
      
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search-off" size={50} color="#FF6D42" />
            <Text style={styles.emptyText}>No items found in this category</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: CARD_WIDTH * 0.8,
  },
  itemDetails: {
    padding: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    color: '#FF6D42',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
});

export default CategorywiseProducts;