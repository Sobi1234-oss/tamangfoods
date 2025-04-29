import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const AdminScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const flatListRef = useRef(null);

  const sliderImages = [
    { id: 4, image: require('./images/headerimg.png') },
    { id: 1, image: require('./assets/slider2.png') },
    { id: 2, image: require('./assets/slider3.png') },
    { id: 3, image: require('./assets/slider1.png') },
  ];

  const bannerImage = require('./images/Banner.png');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesSnapshot = await firestore().collection('categories').get();
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);

        // Fetch products
        const productsSnapshot = await firestore()
          .collection('items')
          .orderBy('createdAt', 'desc')
          .get();
        const productList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          imageBase64: doc.data().imageBase64 || '',
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextSlide = (activeSlide + 1) % sliderImages.length;
      flatListRef.current?.scrollToIndex({ index: nextSlide, animated: true });
      setActiveSlide(nextSlide);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeSlide]);

  const toggleSidebar = () => setSidebarVisible(!sidebarVisible);

  const filteredProducts = products.filter(product => {
    const categoryMatch = !selectedCategory || product.categoryId === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  const topRatedProducts = filteredProducts.filter(p => p.rating >= 4).slice(0, 5);
  const recentProducts = filteredProducts.slice(0, 6);

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.iconTextContainer}>
          <Icon name="star" size={16} color="#FFA000" />
          <Text style={styles.productRating}>{item.rating}</Text>
        </View>
        <View style={styles.iconTextContainer}>
          <Icon name="attach-money" size={16} color="#4CAF50" />
          <Text style={styles.productPrice}>${item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4682B4" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer}>
      <TouchableOpacity style={styles.profileIcon} onPress={toggleSidebar}>
        <View style={styles.profileIconContainer}>
          <Icon name="person" size={30} color="#4682B4" />
        </View>
      </TouchableOpacity>

      <Modal
        visible={sidebarVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={toggleSidebar}
      >
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Icon name="person" size={60} color="#4682B4" />
            <Text style={styles.userName}>Admin</Text>
            <Text style={styles.userEmail}>admin@example.com</Text>
          </View>

          <ScrollView style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Homescreen')}>
              <Icon name="home" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('AddRestaurant')}>
              <Icon name="add-business" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Add Restaurant</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Addproducts')}>
              <Icon name="add-shopping-cart" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Add Product</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Addcategory')}>
              <Icon name="category" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Add Category</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('YourProducts')}>
              <Icon name="inventory" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Your Products</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Restaurants')}>
              <Icon name="restaurant" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Your Restaurants</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Order')}>
              <Icon name="list-alt" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Orders</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Payment')}>
              <Icon name="payment" size={24} color="#4682B4" />
              <Text style={styles.menuText}>Payments</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate('Login')}>
            <Icon name="logout" size={24} color="#FF6B6B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sliderContainer}>
          <FlatList
            ref={flatListRef}
            horizontal
            pagingEnabled
            data={sliderImages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width }}>
                <Image
                  source={item.image}
                  style={styles.sliderImage}
                  resizeMode="cover"
                />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveSlide(index);
            }}
          />
          <View style={styles.dotsContainer}>
            {sliderImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeSlide === index && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Categories</Text>
          <FlatList
            horizontal
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryItem,
                  selectedCategory === item.id && styles.selectedCategory
                ]}
                onPress={() => setSelectedCategory(
                  selectedCategory === item.id ? null : item.id
                )}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === item.id && styles.selectedCategoryText
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.categoryList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Top Rated Products</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Products', {
                  products: filteredProducts.filter(p => p.rating >= 4),
                  title: 'Top Rated Products',
                })
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={topRatedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <View style={styles.bannerContainer}>
          <Image
            source={bannerImage}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Recently Added</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Products', {
                  products: filteredProducts,
                  title: 'All Products',
                })
              }
            >
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            horizontal
            data={recentProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.horizontalList}
            showsHorizontalScrollIndicator={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 65,
  },
  profileIcon: {
    position: "absolute",
    top: 15,
    left: 15,
    zIndex: 1,
  },
  profileIconContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
    padding: 10,
  },
  sidebar: {
    flex: 1,
    width: width * 0.7,
    backgroundColor: '#fff',
    padding: 20,
  },
  sidebarHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menu: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    height: height * 0.3,
    width: '100%',
    marginVertical: 5,
    position: 'relative',
    marginLeft: 6,
    top: -2
  },
  sliderImage: {
    width: '97%',
    height: '100%',
    borderRadius: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#4682B4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    margin: 5,
    paddingHorizontal: 15,
    height: 45,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  bannerContainer: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  section: {
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 16,
    color: '#4682B4',
    fontWeight: 'bold',
  },
  categoryList: {
    paddingVertical: 10,
  },
  categoryItem: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    paddingLeft: 15
  },
  selectedCategory: {
    backgroundColor: 'orange',
  },
  categoryText: {
    color: '#333',
    fontSize: 14,
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  productCard: {
    width: width * 0.45,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 5,
    padding: 10,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
  },
  productDetails: {
    marginTop: 8,
    elevation: 3,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productRating: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: 'bold',
  },
  productPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  horizontalList: {
    paddingVertical: 10,
  },
});

export default AdminScreen;