import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'react-native-linear-gradient';

type HeaderProps = {
  title?: string;
  showBack?: boolean;
  onSearch?: (text: string) => void;
 
};

type RootStackParamList = {
  Products: undefined;
  // Add other screens as needed
};

const Header: React.FC<HeaderProps> = ({ 
  title = 'Products', 
  showBack = false, 
  onSearch 
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  // Animation for search input
  useEffect(() => {
    if (showSearch) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showSearch]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch?.(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText, onSearch]);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchText('');
    }
  };

  return (
    <LinearGradient
      colors={['#FF6D42', '#FF9E5A']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      style={styles.container}
    >
      {/* Left Section - Back Button */}
      {showBack && (
        <TouchableOpacity 
          onPress={navigation.goBack}
          style={styles.backButton}
          testID="back-button"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Center Section - Title or Search */}
      <View style={styles.centerSection}>
        {!showSearch ? (
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <Animated.View 
            style={[
              styles.searchContainer,
              { 
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }] 
              }
            ]}
          >
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#ffffffaa"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus
              autoCorrect={false}
              clearButtonMode="while-editing"
              testID="search-input"
            />
          </Animated.View>
        )}
      </View>

      {/* Right Section - Search Toggle */}
      <TouchableOpacity 
        onPress={toggleSearch}
        style={styles.searchButton}
        testID="search-toggle"
      >
        <Ionicons 
          name={showSearch ? 'close' : 'search'} 
          size={24} 
          color="#fff" 
        />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  searchContainer: {
    width: '100%',
  },
  searchInput: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default Header;