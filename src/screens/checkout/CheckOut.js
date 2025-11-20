// Checkout.tsx
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
  ActivityIndicator,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import auth from '@react-native-firebase/auth';
import useCartStore from '../../components/store/CartStore';
import firestore from '@react-native-firebase/firestore';
import Header from '../../components/headers/Header';
import { sendOrderNotification } from '../../Services/notificationService';

const DELIVERY_CHARGES = 100;


const MAX_RETRIES = 3;
const RETRY_DELAY = 15000; // 15 seconds

const Checkout = ({ navigation }) => {
  const [coords, setCoords] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [phone, setPhone] = useState('');
  const { cartItems, getTotalPrice, clearCart } = useCartStore();
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryTimer, setRetryTimer] = useState(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true;
    }
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
    if (retryCount >= MAX_RETRIES) {
      setLocationError('Maximum location attempts reached. Please enter your address manually.');
      setIsGettingLocation(false);
      return;
    }
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      setLocationError('Permission Denied. Please allow location access in your device settings.');
      setIsGettingLocation(false);
      return;
    }
    setIsGettingLocation(true);
    setLocationError(null);
    try {
      await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCoords({ latitude, longitude });
            setIsGettingLocation(false);
            setRetryCount(0);
            if (retryTimer) { clearTimeout(retryTimer); }
            resolve(position);
          },
          (error) => {
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: RETRY_DELAY,
            maximumAge: 0,
          }
        );
      });
    } catch (error) {
      setIsGettingLocation(false);
      setLocationError(error.message || 'Failed to get location');
      if (retryCount < MAX_RETRIES - 1) {
        // Schedule next retry after 15s
        const timer = setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          handleGetLocation();
        }, RETRY_DELAY);
        setRetryTimer(timer);
      } else {
        setRetryCount(MAX_RETRIES);
      }
    }
  };

  // Geocode manual address to coordinates using OpenStreetMap Nominatim (free, no API key required)
  const geocodeAddress = async (address) => {
    try {
      // Use fetch to call Nominatim; do not show UI Alerts here — surface errors via `setLocationError`.
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        { timeout: 10000 }
      );

      if (!response.ok) {
        console.error('Geocoding service responded with status', response.status);
        setLocationError('Geocoding service error. Please try GPS or enter coordinates as "lat,lng".');
        return null;
      }

      const results = await response.json();
      if (!results || results.length === 0) {
        setLocationError('Address not found. Please try a different address or use GPS.');
        return null;
      }

      const { lat, lon } = results[0];
      const geocodedCoords = { latitude: Number(lat), longitude: Number(lon) };
      return geocodedCoords;
    } catch (error) {
      console.error('Geocoding error:', error);
      setLocationError('Geocoding failed. Use GPS or enter coordinates as "lat,lng".');
      return null;
    }
  };

  const parseCoordinatesFromString = (text) => {
    // Accept formats like "12.3456, 78.9012" or "12.3456 78.9012"
    const cleaned = text.trim();
    const commaParts = cleaned.split(',').map(p => p.trim());
    let lat, lng;
    if (commaParts.length === 2) {
      lat = Number(commaParts[0]);
      lng = Number(commaParts[1]);
    } else {
      const spaceParts = cleaned.split(/\s+/);
      if (spaceParts.length === 2) {
        lat = Number(spaceParts[0]);
        lng = Number(spaceParts[1]);
      }
    }
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
    return null;
  };

  const handleSubmit = async () => {
    if (isSubmitting) { return; }
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
      // store coordinates separately when available to allow accurate ETA calculations
      locationCoords: coords ? { latitude: coords.latitude, longitude: coords.longitude } : null,
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

      // Build notification object (send to admin)
      const notificationData = {
        customerId: user.uid,
        customerName: user.displayName || 'Customer',
        orderId: orderId,
        grandTotal: getTotalPrice() + DELIVERY_CHARGES,
        status: 'pending',
        type: 'new_order', // IMPORTANT: handler treats new_order as admin-targeted
        // include any extra fields you want the cloud function or admin UI to use
      };

      const notificationId = await sendOrderNotification(notificationData);
      console.log('Notification created with id:', notificationId);

      // Notify the customer that their order was submitted successfully
      try {
        const productNames = cartItems.map(item => item.name).join(', ') || 'your items';
        const customerNotification = {
          customerId: user.uid,
          customerName: user.displayName || 'Customer',
          orderId: orderId,
          grandTotal: getTotalPrice() + DELIVERY_CHARGES,
          status: 'pending',
          type: 'order_submitted',
          productName: productNames,
          message: `Your ${productNames} order has been submitted. Please wait for admin response.`,
        };

        await sendOrderNotification(customerNotification);
      } catch (err) {
        console.warn('Failed to create customer submission notification', err);
      }

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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <Header title="Dashboard" showBack={true} />
      <ScrollView contentContainerStyle={styles.bodyWithBottom} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Set location</Text>

        {isGettingLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B3C" />
            <Text style={styles.loadingText}>Getting your location...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.mapButton, locationError && styles.mapButtonError]}
              onPress={handleGetLocation}
              disabled={isGettingLocation}
            >
              <Text style={styles.mapButtonText}>Use My Current Location</Text>
            </TouchableOpacity>

            {locationError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorMessage}>{locationError}</Text>
                {retryCount < MAX_RETRIES && (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => {
                      setRetryCount(retryCount + 1);
                      handleGetLocation();
                    }}
                  >
                    <Text style={styles.retryButtonText}>Retry ({retryCount + 1}/{MAX_RETRIES})</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {coords && (
          <Text style={styles.locationText}>
            ✓ Location set
          </Text>
        )}

        <TextInput
          placeholder="Or enter address manually"
          value={manualLocation}
          onChangeText={setManualLocation}
          style={styles.input}
          placeholderTextColor="#aaa"
        />

        {manualLocation.trim() && !coords && (
          <TouchableOpacity
            style={styles.geocodeButton}
            onPress={async () => {
              // First try to parse direct "lat,lng" entry
              const parsed = parseCoordinatesFromString(manualLocation);
              if (parsed) {
                setCoords(parsed);
                setLocationError(null);
                setRetryCount(0);
                if (retryTimer) { clearTimeout(retryTimer); }
                return;
              }
              const geocoded = await geocodeAddress(manualLocation);
              if (geocoded) {
                setCoords(geocoded);
                setLocationError(null);
                setRetryCount(0);
                if (retryTimer) { clearTimeout(retryTimer); }
              }
            }}
          >
            <Text style={styles.geocodeButtonText}>Convert Address to Coordinates</Text>
          </TouchableOpacity>
        )}

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
  body: { padding: 12 },
  bodyWithBottom: { padding: 12, paddingBottom: 130 },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'left',
    color: '#2d9fd3ff',
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
    padding: 10,
    marginBottom: 10,
    color: 'black',
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
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 24,
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
  disabledButton: {
    opacity: 0.6,
  },
  geocodeButton: {
    backgroundColor: '#2d9fd3',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  geocodeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorMessage: {
    color: '#c62828',
    fontSize: 13,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  mapButtonError: {
    opacity: 0.7,
  },
});

export default Checkout;
