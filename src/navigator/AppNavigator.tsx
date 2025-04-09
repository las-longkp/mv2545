import {StyleSheet} from 'react-native';
import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigator from './StackNavigator';
import {PaperProvider} from 'react-native-paper';
import {CombinedDarkTheme, theme} from '#/themes';
const AppNavigator = () => {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <SafeAreaProvider style={styles.flex1}>
        <NavigationContainer theme={CombinedDarkTheme}>
          <PaperProvider theme={theme}>
            <StackNavigator />
          </PaperProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
export default AppNavigator;
const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});
