/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import MainPage from './screens/Main.js';
import DynamicSelectPage from './screens/DynamicSelect.js';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="MainPage>" component={MainPage} />
        <Stack.Screen name="DynamicSelectPage>" component={DynamicSelectPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
