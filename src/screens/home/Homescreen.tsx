import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Menu } from 'react-native-paper';
import HomeHeader from '../../components/headers/HomeHeader';
import useUserStore from '../../components/store/UserStore';
import EditProductModal from '../../components/Modals/EditProductModal';

const { width } = Dimensions.get('window');

type Product = {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  imageBase64: string;
  categoryId: string;
  rating?: number;
};

type Category = {
  id: string;
  name: string;
};

const HomeScreenWrapper = () => {
  return (
    <PaperProvider>
      <Homescreen />
    </PaperProvider>
  );
};

const Homescreen = () => {
  const navigation = useNavigation();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProductForMenu, setSelectedProductForMenu] = useState<Product | null>(null);

  const [specialProducts, setSpecialProducts] = useState<Product[]>([]);
  const [regularProducts, setRegularProducts] = useState<Product[]>([]);

  const categoryColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F06292'];
  const user = useUserStore(state => state.user);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const [categoriesSnapshot, productsSnapshot] = await Promise.all([
            firestore().collection('categories').get(),
            firestore().collection('items').orderBy('createdAt', 'desc').get()
          ]);

          const loadedCategories = categoriesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
          }));

          setCategories([{ id: 'all', name: 'All' }, ...loadedCategories]);

          const loadedProducts = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            imageBase64: doc.data().imageBase64 || ''
          } as Product));

          setAllProducts(loadedProducts);
          
          // Separate special and regular products
          const special = loadedProducts.filter(p => p.discountPrice);
          const regular = loadedProducts.filter(p => !p.discountPrice);
          
          setSpecialProducts(special);
          setRegularProducts(regular);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [])
  );

  useEffect(() => {
    let filtered = allProducts;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.categoryId === selectedCategory
      );
    }

    setDisplayProducts(filtered);
  }, [searchQuery, selectedCategory, allProducts]);
  const handleDeleteProduct = async (productId: string) => {
    setMenuVisible(false);
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('items').doc(productId).delete();
              const updatedProducts = allProducts.filter(p => p.id !== productId);
              setAllProducts(updatedProducts);
              setDisplayProducts(updatedProducts.slice(0, 10));
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSelectedCategory(null);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    setSearchQuery('');
  };

  const handleEditPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };
 const renderProductItem = ({ item }: { item: Product }) => {
    return (
      <View style={styles.productCard}>
        <View style={styles.menuContainer}>
          <Menu
            visible={menuVisible && selectedProductForMenu?.id === item.id}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => {
                  setSelectedProductForMenu(item);
                  setMenuVisible(true);
                }}
                style={styles.menuButton}
              >
                <Icon name="more-vert" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={() => {
                setMenuVisible(false);
                handleEditPress(item);
              }} 
              title="Update" 
            />
            <Menu.Item 
              onPress={() => handleDeleteProduct(item.id)} 
              title="Delete" 
              titleStyle={{ color: 'red' }}
            />
          </Menu>
        </View>
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => navigation.navigate('ProductDetais', { product: item })}
        >
          <Image
            source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
            style={styles.productImage}
            resizeMode="cover"
          />
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.priceContainer}>
              {item.discountPrice ? (
                <>
                  <Text style={styles.discountedPrice}>Rs {item.discountPrice.toFixed(0)}</Text>
                  <Text style={styles.originalPrice}>Rs {item.price.toFixed(0)}</Text>
                </>
              ) : (
                <Text style={styles.originalPrice}>Rs {item.price.toFixed(0)}</Text>
              )}
            </View>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <Icon name="star" size={14} color="#FFA000" />
                <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  const renderCategoryItem = ({ item, index }: { item: Category, index: number }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        {
          backgroundColor: selectedCategory === item.id
            ? '#FF6D42'
            : categoryColors[(index + 1) % categoryColors.length],
          shadowColor: categoryColors[(index + 1) % categoryColors.length],
        }
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFF9F2', '#FFEBD6']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6D42" />
        <Text style={styles.loadingText}>Loading delicious options...</Text>
      </LinearGradient>
    );
  }

   return (
    <View style={styles.container}>
      <HomeHeader
        navigation={navigation}
        onProfilePress={() => navigation.openDrawer()}
        onSearch={handleSearch}
      />

      <LinearGradient colors={['#FFF9F2', '#FFEBD6']} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>
              {getGreeting()} <Text style={styles.greetingText1}>, {user?.fullName}</Text>
            </Text>
            <Text style={styles.subtitle}>What would you like to order today?</Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.titleUnderline} />
            <FlatList
              horizontal
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </View>

          {/* Show category products when a category is selected */}
          {selectedCategory && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {categories.find(c => c.id === selectedCategory)?.name || 'Category'} Products
                </Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={styles.seeAllText}>Back to all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.titleUnderline} />

              {displayProducts.length > 0 ? (
                <FlatList
                  data={displayProducts}
                  renderItem={renderProductItem}
                  keyExtractor={item => item.id}
                  numColumns={2}
                  columnWrapperStyle={styles.productsRow}
                  scrollEnabled={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Icon name="search-off" size={50} color="#FF6D42" />
                  <Text style={styles.emptyText}>No products found</Text>
                </View>
              )}
            </View>
          )}

          {/* Show Popular and Special sections when no category is selected */}
          {!selectedCategory && (
            <>
              {/* Popular Products Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Popular Products</Text>
                </View>
                <View style={styles.titleUnderline} />

                {regularProducts.length > 0 ? (
                  <FlatList
                    data={regularProducts.slice(0, 10)}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.productsRow}
                    scrollEnabled={false}
                  />
                ) : (
                  <View style={styles.emptyContainer}>
                    <Icon name="search-off" size={50} color="#FF6D42" />
                    <Text style={styles.emptyText}>No products found</Text>
                  </View>
                )}
              </View>

              {/* Special Offers Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Special Offers</Text>
                </View>
                <View style={styles.titleUnderline} />

                {specialProducts.length > 0 ? (
                  <FlatList
                    data={specialProducts.slice(0, 4)}
                    renderItem={renderProductItem}
                    keyExtractor={item => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.productsRow}
                    scrollEnabled={false}
                  />
                ) : (
                  <Text style={styles.emptyText}>No special offers available</Text>
                )}
              </View>
            </>
          )}

          <EditProductModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            product={selectedProduct}
            onUpdate={() => {
              console.log("Product updated, refresh data here");
            }}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6D42',
    marginBottom: 70
  },
  contentContainer: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    marginTop: 5,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontFamily: 'Quicksand-Medium',
    color: '#FF6D42',
    fontSize: 16,
  },
  greetingContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#FF6D42',
    marginBottom: 5,
  },
  greetingText1: {
    fontSize: 28,
    fontFamily: 'Quicksand-Bold',
    color: '#42d3ffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Quicksand-Medium',
    color: '#666',
  },
  sectionContainer: {
    marginTop: 15,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Quicksand-Bold',
    color: '#333',
  },
  titleUnderline: {
    height: 2,
    width: 50,
    backgroundColor: '#c2601bff',
    borderRadius: 3,
    marginBottom: 30,
    top: 5
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    color: '#FF6D42',
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 14,
    marginRight: 2,
  },
  categoriesContainer: {
    paddingBottom: 10,
  },
  categoryItem: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 15,
    marginRight: 12,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryText: {
    color: 'white',
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  productCard: {
    width: width * 0.44,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    height: 300,
    position: 'relative',
  },
  menuContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  menuButton: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
  },
  menuContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
  },
  productImage: {
    width: '100%',
    height: 220,
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  originalPrice: {
    fontFamily: 'Quicksand-Medium',
    fontSize: 14,
    color: '#FF6D42',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: 'Quicksand-Medium',
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
  },
});

export default HomeScreenWrapper;