import React, {useCallback} from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  SafeAreaView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-paper';
import InAppReview from 'react-native-in-app-review';

const SettingsScreen = () => {
  const handleShareApp = async () => {
    try {
      await Share.share({
        message: 'Check out this awesome app!',
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRateApp = useCallback(async () => {
    try {
      const available = await InAppReview.isAvailable();
      if (available) {
        await InAppReview.RequestInAppReview();
      } else {
        Alert.alert('Error', 'In-app review is not available');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request review');
    }
  }, []);

  const handleTermsOfPolicy = () => {
    Linking.canOpenURL('https://www.apple.com/legal/privacy/vn/')
      .then(supported => {
        if (supported) {
          return Linking.openURL('https://www.apple.com/legal/privacy/vn/');
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.content}>
          <Text style={styles.title}>Settings</Text>

          <TouchableOpacity style={styles.button} onPress={handleShareApp}>
            <Icon source="share-variant" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Share The App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleRateApp}>
            <Icon source="star-outline" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Rate App</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleTermsOfPolicy}>
            <Icon source="alert-circle-outline" size={24} color="#0F4C3A" />
            <Text style={styles.buttonText}>Term of Policy</Text>
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
