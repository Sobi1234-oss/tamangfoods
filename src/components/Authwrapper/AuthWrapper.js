import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import useUserStore from '../store/UserStore';
import { useNavigation } from '@react-navigation/native';
const AuthWrapper = ({ children }) => {
  const { isAuthenticated, user } = useUserStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate('UserTabs', { screen: 'Homescreen' });
    }
  }, [isAuthenticated, navigation]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default AuthWrapper;