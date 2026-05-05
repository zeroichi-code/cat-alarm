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
    const updated = {...alarm, enabled: !alarm.enabled};
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
