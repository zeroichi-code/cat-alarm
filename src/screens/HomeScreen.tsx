import React from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Switch} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAlarmStore} from '../store/alarmStore';
import {Alarm} from '../types/alarm';
import type {RootStackParamList} from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

function formatTime(millis: number) {
  const d = new Date(millis);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function repeatLabel(days: number[]) {
  if (days.length === 0) return '一度だけ';
  if (days.length === 7) return '毎日';
  return days.map(d => DAYS[d]).join(' ');
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {alarms, toggleAlarm, removeAlarm} = useAlarmStore();

  const renderItem = ({item}: {item: Alarm}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EditAlarm', {alarm: item})}
      onLongPress={() => removeAlarm(item.id)}
    >
      <View style={styles.cardLeft}>
        <Text style={[styles.time, !item.enabled && styles.dimmed]}>
          {item.isTimer ? `⏱ ${item.timerSeconds}秒` : formatTime(item.triggerAtMillis)}
        </Text>
        <Text style={styles.label}>{item.label || repeatLabel(item.repeatDays)}</Text>
      </View>
      <Switch
        value={item.enabled}
        onValueChange={() => toggleAlarm(item.id)}
        trackColor={{true: '#e94560'}}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🐱 猫アラーム</Text>
      <FlatList
        data={alarms}
        keyExtractor={a => a.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>アラームがありません{'\n'}＋ボタンで追加</Text>}
      />
      <View style={styles.fab}>
        <TouchableOpacity style={styles.fabBtn} onPress={() => navigation.navigate('EditAlarm', {alarm: null})}>
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.fabBtn, styles.fabTimer]} onPress={() => navigation.navigate('Timer')}>
          <Text style={styles.fabText}>⏱</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a2e'},
  header: {color: '#fff', fontSize: 24, fontWeight: 'bold', padding: 20, paddingBottom: 8},
  list: {padding: 16, paddingBottom: 100},
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLeft: {flex: 1},
  time: {color: '#fff', fontSize: 36, fontWeight: '200'},
  dimmed: {color: '#555'},
  label: {color: '#888', fontSize: 13, marginTop: 4},
  empty: {color: '#555', textAlign: 'center', marginTop: 80, fontSize: 16, lineHeight: 28},
  fab: {position: 'absolute', bottom: 32, right: 24, gap: 12},
  fabBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabTimer: {backgroundColor: '#0f3460'},
  fabText: {color: '#fff', fontSize: 24},
});
