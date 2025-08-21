import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { verifyToken } from './src/services/api';
import { initSocket, disconnectSocket } from './src/services/socket';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Login');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const ok = await verifyToken();
          if (ok) {
            setInitialRoute('Home');
            initSocket();
          } else {
            await AsyncStorage.removeItem('token');
          }
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => disconnectSocket();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Navigation initialRouteName={initialRoute} />
    </NavigationContainer>
  );
}
