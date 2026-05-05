export interface Alarm {
  id: string;
  triggerAtMillis: number;
  label: string;
  soundUri: string | null;
  enabled: boolean;
  repeatDays: number[];  // 0=Sun ... 6=Sat
  isTimer: boolean;
  timerSeconds?: number;
}
