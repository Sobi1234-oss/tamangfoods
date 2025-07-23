// screens/OrderDetails.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import Header from '../../components/headers/Header';

const OrderDetails = ({ route, navigation }) => {
    const { order } = route.params;

    return (
        <SafeAreaView style={styles.safeArea}>
             <Header title="Order Details" showBack onBackPress={() => navigation.goBack()} />
            <View style={styles.container}>
               

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.label}>Order ID:</Text>
                    <Text style={styles.value}>{order.id}</Text>

                    <Text style={styles.label}>Customer Name:</Text>
                    <Text style={styles.value}>{order.customerName || 'Unknown'}</Text>

                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{order.status?.toUpperCase()}</Text>

                    <Text style={styles.label}>Created At:</Text>
                    <Text style={styles.value}>{order.createdAt?.toLocaleString()}</Text>

                    <Text style={styles.label}>Delivery Location:</Text>
                    <Text style={styles.value}>{order.location || 'Not specified'}</Text>

                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{order.phone || 'N/A'}</Text>

                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{order.paymentMethod || 'N/A'}</Text>

                    <Text style={styles.label}>Delivery Charge:</Text>
                    <Text style={styles.value}>Rs {order.deliveryCharge?.toFixed(2)}</Text>

                    <Text style={styles.label}>Total Price:</Text>
                    <Text style={styles.value}>Rs {order.totalPrice?.toFixed(2)}</Text>

                    <Text style={styles.label}>Grand Total:</Text>
                    <Text style={styles.value}>Rs {order.grandTotal?.toFixed(2)}</Text>

                    {/* ✅ Product List */}
                    <Text style={styles.label}>Product Details:</Text>

                    {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                            <View key={index} style={styles.productItem}>
                                <Text style={styles.productName}>• {item.name || 'Unnamed product'}</Text>
                                <Text style={styles.productDetail}>Quantity: {item.quantity}</Text>
                                <Text style={styles.productDetail}>Price: Rs {item.price}</Text>
                                <Text style={styles.productDetail}>Subtotal: Rs {item.quantity * item.price}</Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.value}>No product details available.</Text>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
    content: { paddingVertical: 16 },
    label: { fontWeight: 'bold', fontSize: 14, marginTop: 12, color: '#333' },
    value: { fontSize: 14, color: '#555', marginTop: 4 },
  
    productImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        marginRight: 10,
        backgroundColor: '#ccc',
    },
    productItem: {
  backgroundColor: '#f3f3f3',
  padding: 12,
  marginTop: 10,
  borderRadius: 10,
  elevation: 2,
},
productName: {
  fontWeight: 'bold',
  fontSize: 15,
  marginBottom: 4,
  color: '#2d9fd3',
},
productDetail: {
  fontSize: 13,
  color: '#444',
  marginBottom: 2,
},
});

export default OrderDetails;
