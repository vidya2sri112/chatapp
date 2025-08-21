import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Navigation from './src/navigation';
import { disconnectSocket } from './src/services/socket';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  // Always start from Login; navigation will move to Home after successful login
  const [initialRoute] = useState('Login');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure sockets disconnect when app unmounts
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
