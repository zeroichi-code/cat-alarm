import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import OverlayPermission from '../native/OverlayPermission';
import AlarmScheduler from '../native/AlarmScheduler';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>設定</Text>

      <TouchableOpacity style={styles.row} onPress={() => OverlayPermission.openOverlaySettings()}>
        <Text style={styles.rowText}>オーバーレイ権限を確認</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => AlarmScheduler.canScheduleExactAlarms().then(ok => {
          if (!ok) Linking.openSettings();
        })}
      >
        <Text style={styles.rowText}>正確なアラーム権限を確認</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={() => Linking.openSettings()}>
        <Text style={styles.rowText}>通知設定</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <Text style={styles.version}>猫アラーム v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#1a1a2e', padding: 24},
  title: {color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 32},
  row: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowText: {color: '#fff', fontSize: 15, flex: 1},
  arrow: {color: '#888', fontSize: 20},
  version: {color: '#444', textAlign: 'center', marginTop: 40, fontSize: 13},
});
