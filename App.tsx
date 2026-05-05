import React, {useEffect, useState} from 'react';
import {StatusBar, TouchableOpacity, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import EditAlarmScreen from './src/screens/EditAlarmScreen';
import TimerScreen from './src/screens/TimerScreen';
import PermissionsScreen from './src/screens/PermissionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OverlayPermission from './src/native/OverlayPermission';
import AlarmScheduler from './src/native/AlarmScheduler';
import {Alarm} from './src/types/alarm';

export type RootStackParamList = {
  Permissions: undefined;
  Home: undefined;
  EditAlarm: {alarm: Alarm | null};
  Timer: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Permissions' | 'Home' | null>(null);

  useEffect(() => {
    (async () => {
      const [overlay, exact] = await Promise.all([
        OverlayPermission.canDrawOverlays(),
        AlarmScheduler.canScheduleExactAlarms(),
      ]);
      setInitialRoute(overlay && exact ? 'Home' : 'Permissions');
    })();
  }, []);

  if (!initialRoute) return null;

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: {backgroundColor: '#1a1a2e'},
            headerTintColor: '#fff',
            headerTitleStyle: {fontWeight: 'bold'},
            contentStyle: {backgroundColor: '#1a1a2e'},
          }}
        >
          <Stack.Screen name="Permissions" component={PermissionsScreen} options={{headerShown: false}} />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={({navigation}) => ({
              title: '猫アラーム',
              headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Text style={{color: '#fff', fontSize: 22}}>⚙</Text>
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="EditAlarm" component={EditAlarmScreen} options={{title: 'アラーム設定'}} />
          <Stack.Screen name="Timer" component={TimerScreen} options={{title: 'タイマー'}} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{title: '設定'}} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
