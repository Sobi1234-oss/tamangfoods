import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const Contact = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.profileName}>Habib Ur Rehman</Text>
        <TouchableOpacity style={styles.viewProfileButton}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <Icon name="chevron-right" size={12} color="#fff" style={styles.arrowIcon } />
        </TouchableOpacity>
      </View>

      {/* Personal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Personal</Text>
        {[['My Activity', 'history'], ['My Credits', 'credit-card'], ['Alerts', 'bell'], ['Notifications', 'bell-o'], ['Theme', 'paint-brush'], ['Choose Language', 'globe']].map((item, index) => (
          <TouchableOpacity key={index} style={styles.option}>
            <Icon name={item[1]} size={18} color="gray" style={styles.optionIcon} />
            <Text style={styles.optionText}>{item[0]}</Text>
            {/* Add arrow for "My Activity" and "Alerts" */}
            {(item[0] === 'My Activity' || item[0] === 'Alerts') && (
              <Icon name="chevron-down" size={12} color="gray" style={styles.arrowIcon} />
            )}
          </TouchableOpacity>
        ))}
        {/* Horizontal Line */}
        <View style={styles.horizontalLine} />
      </View>

      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Products</Text>
        {[['Sell My Car', 'car'], ['Buy Used Car', 'shopping-cart'], ['Buy New Car', 'car']].map((item, index) => (
          <TouchableOpacity key={index} style={styles.option}>
            <Icon name={item[1]} size={18} color="gray" style={styles.optionIcon} />
            <Text style={styles.optionText}>{item[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Home', 'My Ads', 'Sell Now', 'Chat', 'More'].map((item, index) => (
          <TouchableOpacity key={index} style={styles.navItem}>
            <Icon name={getIconName(item)} size={20} color="gray" />
            <Text style={styles.navText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const getIconName = (item) => {
  switch (item) {
    case 'Home': return 'home';
    case 'My Ads': return 'list';
    case 'Sell Now': return 'dollar';
    case 'Chat': return 'comments';
    case 'More': return 'ellipsis-h';
    default: return 'circle';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#1E3A8A', // Slightly darker than royal blue
    paddingVertical: 20,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 160,
    paddingHorizontal: 12,
  },
  profileName: {
    fontSize: 33,
    fontWeight: '600',
    color: '#fff',
    marginTop: 45,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  viewProfileText: {
    fontSize: 18,
    color: '#fff',
  },
  arrowIcon: {
    marginLeft: 5, // Space between text and arrow
  },
  section: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#000',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  optionIcon: {
    marginRight: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    flex: 1, // Allow text to take up remaining space
  },
  horizontalLine: {
    borderBottomWidth: 3,
    borderBottomColor: 'silver', // Silver color for the line
    marginVertical: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    marginTop: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
});

export default Contact;