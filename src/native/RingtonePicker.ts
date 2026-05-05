import {NativeModules} from 'react-native';

const {RingtonePicker} = NativeModules;

export interface RingtoneItem {
  title: string;
  uri: string;
}

export default {
  getAlarmRingtones: (): Promise<RingtoneItem[]> => RingtonePicker.getAlarmRingtones(),
};
