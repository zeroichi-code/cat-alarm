import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useAlarmStore} from '../store/alarmStore';
import {Alarm} from '../types/alarm';
import RingtonePicker, {RingtoneItem} from '../native/RingtonePicker';
import type {RootStackParamList} from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'EditAlarm'>;
type Route = RouteProp<RootStackParamList, 'EditAlarm'>;

const DAYS = ['日', '月', '火', '水', '木', '金', '土'];

export default function EditAlarmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const existing = route.params?.alarm;

  const now = new Date();
  const [hour, setHour] = useState(existing ? new Date(existing.triggerAtMillis).getHours() : now.getHours());
  const [minute, setMinute] = useState(existing ? new Date(existing.triggerAtMillis).getMinutes() : now.getMinutes());
  const [label, setLabel] = useState(existing?.label ?? '');
  const [repeatDays, setRepeatDays] = useState<number[]>(existing?.repeatDays ?? []);
  const [soundUri, setSoundUri] = useState<string | null>(existing?.soundUri ?? null);
  const [soundTitle, setSoundTitle] = useState('デフォルト');
  const [ringtones, setRingtones] = useState<RingtoneItem[]>([]);

  const {addAlarm, updateAlarm, removeAlarm} = useAlarmStore();

  useEffect(() => {
    RingtonePicker.getAlarmRingtones().then(setRingtones).catch(() => {});
  }, []);

  const toggleDay = (d: number) => {
    setRepeatDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort());
  };

  const nextTrigger = () => {
    const t = new Date();
    t.setHours(hour, minute, 0, 0);
    if (t.getTime() <= Date.now()) t.setDate(t.getDate() + 1);
    return t.getTime();
  };

  const save = () => {
    const alarm: Alarm = {
      id: existing?.id ?? String(Date.now()),
      triggerAtMillis: nextTrigger(),
      label,
      soundUri,
      enabled: true,
      repeatDays,
      isTimer: false,
    };
    if (existing) {
      updateAlarm(alarm);
    } else {
      addAlarm(alarm);
    }
    navigation.goBack();
  };

  const del = () => {
    if (!existing) return;
    Alert.alert('削除', 'このアラームを削除しますか？', [
      {text: 'キャンセル'},
      {text: '削除', style: 'destructive', onPress: () => { removeAlarm(existing.id); navigation.goBack(); }},
    ]);
  };

  const pickSound = () => {
    if (ringtones.length === 0) return;
    Alert.alert('アラーム音を選択', '', [
      {text: 'デフォルト', onPress: () => { setSoundUri(null); setSoundTitle('デフォルト'); }},
      ...ringtones.slice(0, 5).map(r => ({
        text: r.title,
        onPress: () => { setSoundUri(r.uri); setSoundTitle(r.title); },
      })),
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionLabel}>時刻</Text>
      <View style={styles.timePicker}>
        <NumberScroll value={hour} max={23} onChange={setHour} />
        <Text style={styles.colon}>:</Text>
        <NumberScroll value={minute} max={59} onChange={setMinute} />
      </View>

      <Text style={styles.sectionLabel}>繰り返し</Text>
      <View style={styles.days}>
        {DAYS.map((d, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.dayBtn, repeatDays.includes(i) && styles.dayBtnActive]}
            onPress={() => toggleDay(i)}
          >
            <Text style={[styles.dayText, repeatDays.includes(i) && styles.dayTextActive]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>ラベル</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="例：起床"
        placeholderTextColor="#555"
      />

      <Text style={styles.sectionLabel}>アラーム音</Text>
      <TouchableOpacity style={styles.soundBtn} onPress={pickSound}>
        <Text style={styles.soundText}>{soundTitle}</Text>
        <Text style={styles.soundArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Text style={styles.saveBtnText}>保存</Text>
      </TouchableOpacity>

      {existing && (
        <TouchableOpacity style={styles.deleteBtn} onPress={del}>
          <Text style={styles.deleteBtnText}>アラームを削除</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

function NumberScroll({value, max, onChange}: {value: number; max: number; onChange: (v: number) => void}) {
  return (
    <View style={styles.numScroll}>
      <TouchableOpacity onPress={() => onChange(value === max ? 0 : value + 1)}>
        <Text style={styles.numArrow}>▲</Text>
      </TouchableOpacity>
      <Text style={styles.numValue}>{String(value).padStart(2, '0')}</Text>
      <TouchableOpacity onPress={() => onChange(value === 0 ? max : value - 1)}>
        <Text style={styles.numArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a2e'},
  content: {padding: 24},
  sectionLabel: {color: '#888', fontSize: 12, marginTop: 24, marginBottom: 8, letterSpacing: 1},
  timePicker: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
  colon: {color: '#fff', fontSize: 48, marginHorizontal: 12},
  numScroll: {alignItems: 'center'},
  numArrow: {color: '#e94560', fontSize: 22, paddingVertical: 8},
  numValue: {color: '#fff', fontSize: 52, fontWeight: '200', minWidth: 80, textAlign: 'center'},
  days: {flexDirection: 'row', gap: 8},
  dayBtn: {flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#16213e', alignItems: 'center'},
  dayBtnActive: {backgroundColor: '#e94560'},
  dayText: {color: '#888', fontSize: 13},
  dayTextActive: {color: '#fff', fontWeight: 'bold'},
  input: {backgroundColor: '#16213e', color: '#fff', borderRadius: 10, padding: 14, fontSize: 16},
  soundBtn: {backgroundColor: '#16213e', borderRadius: 10, padding: 16, flexDirection: 'row', alignItems: 'center'},
  soundText: {color: '#fff', flex: 1, fontSize: 15},
  soundArrow: {color: '#888', fontSize: 20},
  saveBtn: {backgroundColor: '#e94560', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 40},
  saveBtnText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
  deleteBtn: {padding: 16, alignItems: 'center', marginTop: 12},
  deleteBtnText: {color: '#e94560', fontSize: 15},
});
