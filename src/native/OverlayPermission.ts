import {NativeModules} from 'react-native';

const {OverlayPermission} = NativeModules;

export default {
  canDrawOverlays: (): Promise<boolean> => OverlayPermission.canDrawOverlays(),
  openOverlaySettings: (): Promise<void> => OverlayPermission.openOverlaySettings(),
};
