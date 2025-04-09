// screens/SettingsScreen.tsx
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingsScreen = () => {
  const navigation = useNavigation();

  const handleShareApp = async () => {};

  const handleRateUs = () => {};

  const handleReportProblem = () => {};

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.content}>
          <Text style={styles.title}>Coming Soon</Text>

          <TouchableOpacity style={styles.button} onPress={handleShareApp}>
            <Icon name="share-social-outline" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Share The App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRateUs}>
            <Icon name="star-outline" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Rate Us</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleReportProblem}>
            <Icon name="alert-circle-outline" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Report Problem</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F4C3A',
    textAlign: 'center',
    marginBottom: 60,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#0F4C3A',
    borderRadius: 10,
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#0F4C3A',
    marginLeft: 12,
  },
});

export default SettingsScreen;
