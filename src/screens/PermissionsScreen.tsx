import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert, PermissionsAndroid, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import OverlayPermission from '../native/OverlayPermission';
import AlarmScheduler from '../native/AlarmScheduler';
import type {RootStackParamList} from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

export default function PermissionsScreen() {
  const navigation = useNavigation<Nav>();
  const [overlayOk, setOverlayOk] = useState(false);
  const [exactAlarmOk, setExactAlarmOk] = useState(false);
  const [notifOk, setNotifOk] = useState(false);

  const refresh = async () => {
    setOverlayOk(await OverlayPermission.canDrawOverlays());
    setExactAlarmOk(await AlarmScheduler.canScheduleExactAlarms());
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const res = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      setNotifOk(res);
    } else {
      setNotifOk(true);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, []);

  const allOk = overlayOk && exactAlarmOk && notifOk;

  const requestNotif = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }
    refresh();
  };

  const requestExactAlarm = () => {
    Alert.alert(
      '正確なアラーム設定',
      '設定画面で「アラームと時計」を許可してください',
      [{text: 'OK', onPress: () => AlarmScheduler.canScheduleExactAlarms().then(refresh)}],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐱 猫アラームの準備</Text>
      <Text style={styles.subtitle}>以下の権限を許可してください</Text>

      <PermItem
        label="他のアプリの上に重ねて表示"
        desc="猫が画面いっぱいに出るために必須"
        ok={overlayOk}
        onPress={() => OverlayPermission.openOverlaySettings().then(refresh)}
      />
      <PermItem
        label="正確なアラーム"
        desc="指定した時刻に確実に猫を出すために必須"
        ok={exactAlarmOk}
        onPress={requestExactAlarm}
      />
      <PermItem
        label="通知"
        desc="アラーム中の通知バー表示のため"
        ok={notifOk}
        onPress={requestNotif}
      />

      <TouchableOpacity
        style={[styles.btn, !allOk && styles.btnDisabled]}
        onPress={() => navigation.replace('Home')}
        disabled={!allOk}
      >
        <Text style={styles.btnText}>{allOk ? 'はじめる' : '権限を許可してください'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PermItem({label, desc, ok, onPress}: {label: string; desc: string; ok: boolean; onPress: () => void}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemText}>
        <Text style={styles.itemLabel}>{ok ? '✅ ' : '❌ '}{label}</Text>
        <Text style={styles.itemDesc}>{desc}</Text>
      </View>
      {!ok && (
        <TouchableOpacity style={styles.itemBtn} onPress={onPress}>
          <Text style={styles.itemBtnText}>許可</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a2e', padding: 24, justifyContent: 'center'},
  title: {color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 8},
  subtitle: {color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 40},
  item: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12, padding: 16, marginBottom: 16},
  itemText: {flex: 1},
  itemLabel: {color: '#fff', fontSize: 15, fontWeight: '600'},
  itemDesc: {color: '#888', fontSize: 12, marginTop: 4},
  itemBtn: {backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8},
  itemBtnText: {color: '#fff', fontWeight: 'bold', fontSize: 13},
  btn: {backgroundColor: '#e94560', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 32},
  btnDisabled: {backgroundColor: '#444'},
  btnText: {color: '#fff', fontSize: 17, fontWeight: 'bold'},
});
