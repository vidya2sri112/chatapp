import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { fetchUsers } from '../services/api';
import { colors, spacing, typography, radius } from '../theme/theme';

export default function HomeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setRefreshing(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch {}
    finally { setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', { user: item })}
      style={styles.row}
    >
      <View style={{ flex: 1 }}>
        <View style={styles.rowHeader}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={[styles.statusDot, { backgroundColor: item.isOnline ? colors.accent : colors.border }]} />
        </View>
        <Text numberOfLines={1} style={styles.preview}>
          {item?.lastMessage?.text || 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: spacing(2) }}
        data={users}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        ItemSeparatorComponent={() => <View style={{ height: spacing(1) }} />}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(1.5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(0.5),
  },
  username: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  preview: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
