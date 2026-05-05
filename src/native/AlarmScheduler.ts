import {NativeModules} from 'react-native';

const {AlarmScheduler} = NativeModules;

export default {
  setAlarm: (alarmId: string, triggerAtMillis: number, soundUri: string | null): Promise<void> =>
    AlarmScheduler.setAlarm(alarmId, triggerAtMillis, soundUri),

  cancelAlarm: (alarmId: string): Promise<void> =>
    AlarmScheduler.cancelAlarm(alarmId),

  canScheduleExactAlarms: (): Promise<boolean> =>
    AlarmScheduler.canScheduleExactAlarms(),
};
