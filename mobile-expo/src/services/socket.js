import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { EXPO_PUBLIC_SOCKET_URL } = (Constants?.expoConfig?.extra) || {};
let socket;

export const getSocket = () => socket;

export async function initSocket() {
  socket = io(EXPO_PUBLIC_SOCKET_URL);
  const token = await AsyncStorage.getItem('token');
  socket.on('connect', () => {
    if (token) socket.emit('authenticate', token);
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
