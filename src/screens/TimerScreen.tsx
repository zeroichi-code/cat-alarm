import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useAlarmStore} from '../store/alarmStore';
import {Alarm} from '../types/alarm';

const PRESETS = [
  {label: '1分', seconds: 60},
  {label: '3分', seconds: 180},
  {label: '5分', seconds: 300},
  {label: '10分', seconds: 600},
  {label: '15分', seconds: 900},
  {label: '30分', seconds: 1800},
];

export default function TimerScreen() {
  const navigation = useNavigation();
  const {addAlarm} = useAlarmStore();
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);

  const totalSeconds = minutes * 60 + seconds;

  const startTimer = () => {
    if (totalSeconds <= 0) {
      Alert.alert('時間を設定してください');
      return;
    }
    const alarm: Alarm = {
      id: String(Date.now()),
      triggerAtMillis: Date.now() + totalSeconds * 1000,
      label: `タイマー ${totalSeconds}秒`,
      soundUri: null,
      enabled: true,
      repeatDays: [],
      isTimer: true,
      timerSeconds: totalSeconds,
    };
    addAlarm(alarm);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>タイマー</Text>

      <View style={styles.picker}>
        <View style={styles.unit}>
          <TouchableOpacity onPress={() => setMinutes(m => Math.min(99, m + 1))}>
            <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.value}>{String(minutes).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => setMinutes(m => Math.max(0, m - 1))}>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>分</Text>
        </View>
        <Text style={styles.colon}>:</Text>
        <View style={styles.unit}>
          <TouchableOpacity onPress={() => setSeconds(s => s >= 55 ? 0 : s + 5)}>
            <Text style={styles.arrow}>▲</Text>
          </TouchableOpacity>
          <Text style={styles.value}>{String(seconds).padStart(2, '0')}</Text>
          <TouchableOpacity onPress={() => setSeconds(s => s <= 0 ? 55 : s - 5)}>
            <Text style={styles.arrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.unitLabel}>秒</Text>
        </View>
      </View>

      <View style={styles.presets}>
        {PRESETS.map(p => (
          <TouchableOpacity
            key={p.seconds}
            style={styles.preset}
            onPress={() => { setMinutes(Math.floor(p.seconds / 60)); setSeconds(p.seconds % 60); }}
          >
            <Text style={styles.presetText}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
        <Text style={styles.startBtnText}>猫を呼ぶ 🐱</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a2e', padding: 24, alignItems: 'center'},
  title: {color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 40},
  picker: {flexDirection: 'row', alignItems: 'center', marginBottom: 40},
  unit: {alignItems: 'center'},
  arrow: {color: '#e94560', fontSize: 28, paddingVertical: 10},
  value: {color: '#fff', fontSize: 64, fontWeight: '200', minWidth: 90, textAlign: 'center'},
  unitLabel: {color: '#888', fontSize: 14, marginTop: 4},
  colon: {color: '#fff', fontSize: 64, marginHorizontal: 8, marginBottom: 20},
  presets: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 40},
  preset: {backgroundColor: '#16213e', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10},
  presetText: {color: '#fff', fontSize: 14},
  startBtn: {backgroundColor: '#e94560', borderRadius: 14, paddingHorizontal: 48, paddingVertical: 18},
  startBtnText: {color: '#fff', fontSize: 18, fontWeight: 'bold'},
});
