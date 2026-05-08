import {create} from 'zustand';
import {MMKV} from 'react-native-mmkv';
import {Alarm} from '../types/alarm';
import AlarmSchedulerNative from '../native/AlarmScheduler';

const storage = new MMKV({id: 'cat_alarms'});
const ALARMS_KEY = 'alarms';

function loadAlarms(): Alarm[] {
  const raw = storage.getString(ALARMS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveAlarms(alarms: Alarm[]) {
  storage.set(ALARMS_KEY, JSON.stringify(alarms));
}

interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
}

export const useAlarmStore = create<AlarmStore>((set, get) => ({
  alarms: loadAlarms(),

  addAlarm: async (alarm) => {
    const alarms = [...get().alarms, alarm];
    set({alarms});
    saveAlarms(alarms);
    if (alarm.enabled) {
      await AlarmSchedulerNative.setAlarm(alarm.id, alarm.triggerAtMillis, alarm.soundUri);
    }
  },

  updateAlarm: async (alarm) => {
    const alarms = get().alarms.map(a => a.id === alarm.id ? alarm : a);
    set({alarms});
    saveAlarms(alarms);
    await AlarmSchedulerNative.cancelAlarm(alarm.id);
    if (alarm.enabled) {
      await AlarmSchedulerNative.setAlarm(alarm.id, alarm.triggerAtMillis, alarm.soundUri);
    }
  },

  removeAlarm: async (id) => {
    const alarms = get().alarms.filter(a => a.id !== id);
    set({alarms});
    saveAlarms(alarms);
    await AlarmSchedulerNative.cancelAlarm(id);
  },

  toggleAlarm: async (id) => {
    const alarm = get().alarms.find(a => a.id === id);
    if (!alarm) return;

    let newTriggerAtMillis = alarm.triggerAtMillis;

    if (!alarm.enabled) {
      // ONにする場合、過去の時刻なら更新する
      const now = Date.now();
      if (alarm.triggerAtMillis <= now) {
        if (alarm.isTimer && alarm.timerSeconds) {
          // タイマー: 今から同じ秒数後
          newTriggerAtMillis = now + alarm.timerSeconds * 1000;
        } else {
          // 通常アラーム: 同じ時・分で次回（今日または明日）
          const original = new Date(alarm.triggerAtMillis);
          const next = new Date();
          next.setHours(original.getHours(), original.getMinutes(), 0, 0);
          if (next.getTime() <= now) {
            next.setDate(next.getDate() + 1);
          }
          newTriggerAtMillis = next.getTime();
        }
      }
    }

    const updated = {...alarm, enabled: !alarm.enabled, triggerAtMillis: newTriggerAtMillis};
    const alarms = get().alarms.map(a => a.id === id ? updated : a);
    set({alarms});
    saveAlarms(alarms);
    if (updated.enabled) {
      await AlarmSchedulerNative.setAlarm(updated.id, updated.triggerAtMillis, updated.soundUri);
    } else {
      await AlarmSchedulerNative.cancelAlarm(updated.id);
    }
  },
}));
