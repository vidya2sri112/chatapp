import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { EXPO_PUBLIC_API_BASE_URL } = (Constants?.expoConfig?.extra) || {};

export const api = axios.create({ baseURL: EXPO_PUBLIC_API_BASE_URL });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', data.token);
  return data;
}

export async function register(username, email, password) {
  const { data } = await api.post('/auth/register', { username, email, password });
  return data;
}

export async function verifyToken() {
  try {
    const { status } = await api.get('/auth/verify');
    return status === 200;
  } catch {
    return false;
  }
}

export async function fetchUsers() {
  const { data } = await api.get('/users');
  return data;
}

export async function fetchMessages(userId) {
  const { data } = await api.get(`/messages/conversations/${userId}`);
  return data;
}

export async function markRead(userId) {
  await api.put(`/messages/conversations/${userId}/read`);
}
