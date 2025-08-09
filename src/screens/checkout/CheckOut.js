import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import useCartStore from '../../components/store/CartStore';
import firestore from '@react-native-firebase/firestore';
import Header from '../../components/headers/Header';
import { sendOrderNotification } from '../../Services/notificationService';

const DELIVERY_CHARGES = 100;

const Checkout = ({ navigation }) => {
  const [coords, setCoords] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [phone, setPhone] = useState('');
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const handleGetLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Please allow location access.');
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
      },
      (error) => {
        console.log(error);
        Alert.alert('Location Error', error.message);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = auth().currentUser;
    if (!user) {
      Alert.alert('Error', 'User not logged in.');
      setIsSubmitting(false);
      return;
    }

    const location =
      manualLocation.trim() ||
      (coords ? `Lat: ${coords.latitude}, Lng: ${coords.longitude}` : '');

    if (!location || !phone.trim()) {
      Alert.alert('Error', 'Please fill all required fields.');
      setIsSubmitting(false);
      return;
    }

    if (phone.length !== 11) {
      setPhoneError('Phone number must be exactly 11 digits');
      setIsSubmitting(false);
      return;
    }

    const orderData = {
      customerId: user.uid,
      customerName: user.displayName || 'Customer',
      phone: phone.trim(),
      location,
      paymentMethod: 'Cash on Delivery',
      items: cartItems.map(item => ({
        name: item.name || '',
        price: item.price || 0,
        quantity: item.quantity || 0,
        productId: item.productId || '',
        imageUrl: item.imageUrl || '',
        ownerId: item.ownerId || '',
      })),
      totalPrice: getTotalPrice(),
      deliveryCharge: DELIVERY_CHARGES,
      grandTotal: getTotalPrice() + DELIVERY_CHARGES,
      status: 'pending',
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      // Add order to Firestore
      const orderRef = await firestore().collection('orders').add(orderData);
      const orderId = orderRef.id;

      // Update the order with the generated ID
      await orderRef.update({ orderId });

      const notificationData = {
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        orderId: orderId,
        grandTotal: getTotalPrice() + DELIVERY_CHARGES,
        status: 'pending',
        type: 'new_order',
        read: false,
      };

      await sendOrderNotification(notificationData);

      clearCart();
      setIsSubmitting(false);
      Alert.alert('Success', 'Order placed successfully!');
      navigation.navigate('MainApp', {
        screen: 'UserTabs',
        params: {
          screen: 'Homescreens',
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      console.error('Submit error:', error);
      Alert.alert('Error', 'Order submission failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Header title="Dashboard" showBack={true} />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Set location</Text>

        <TouchableOpacity style={styles.mapButton} onPress={handleGetLocation}>
          <Text style={styles.mapButtonText}>Use My Current Location</Text>
        </TouchableOpacity>

        {coords && (
          <Text style={styles.locationText}>
            📍 Latitude: {coords.latitude} | Longitude: {coords.longitude}
          </Text>
        )}

        <TextInput
          placeholder="Or enter address manually"
          value={manualLocation}
          onChangeText={setManualLocation}
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            if (numericText.length <= 11) {
              setPhone(numericText);
              if (numericText.length === 11) {
                setPhoneError('');
              } else {
                setPhoneError('Phone number must be exactly 11 digits');
              }
            }
          }}
          style={[styles.input, phoneError ? styles.inputError : null]}
          keyboardType="phone-pad"
          placeholderTextColor="#aaa"
        />
        {phoneError ? (
          <Text style={styles.errorText}>{phoneError}</Text>
        ) : null}

        <View style={styles.summary}>
          <Text style={styles.summaryText}>Items Total: Rs. {getTotalPrice()}</Text>
          <Text style={styles.summaryText}>Delivery Charges: Rs. {DELIVERY_CHARGES}</Text>
          <Text style={styles.grandTotal}>
            Grand Total: Rs. {getTotalPrice() + DELIVERY_CHARGES}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Order'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  body: { padding: 20 },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'left',
    color: '#2d9fd3ff'
  },
  mapButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  mapButtonText: { color: '#fff', fontWeight: 'bold' },
  locationText: {
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    color: "black"
  },
  summary: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
  },
  summaryText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B3C',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#FF6B3C',
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
  color: 'red',
  marginBottom: 10,
  fontSize: 13,
},
inputError: {
  borderColor: 'red',
},
});

export default Checkout;