import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { EXPO_PUBLIC_SOCKET_URL } = (Constants?.expoConfig?.extra) || {};
let socket;
let currentUserId = null;

export const getSocket = () => socket;
export const getCurrentUserId = () => currentUserId;

export async function initSocket() {
  socket = io(EXPO_PUBLIC_SOCKET_URL);
  const token = await AsyncStorage.getItem('token');
  socket.on('connect', () => {
    if (token) socket.emit('authenticate', token);
  });
  socket.on('authenticated', (payload) => {
    currentUserId = payload?.user?.id || null;
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
