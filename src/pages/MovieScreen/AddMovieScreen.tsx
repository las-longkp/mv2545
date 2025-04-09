// screens/AddMovieScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  ImageBackground,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import {colors} from '#/themes/colors';

interface MovieFormData {
  title: string;
  genre: string;
  releaseYear: string;
  plot: string;
  review: string;
  posterUri: string | null;
}

const AddMovieScreen = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState<MovieFormData>({
    title: '',
    genre: '',
    releaseYear: '',
    plot: '',
    review: '',
    posterUri: null,
  });

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES ||
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message:
              'App needs access to your storage to select a poster image',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't need this permission check
  };

  const handleUploadPoster = async () => {
    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to grant storage permission to upload a poster',
      );
      return;
    }

    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 800,
    };

    try {
      const response = await launchImageLibrary(options);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setFormData({
          ...formData,
          posterUri: selectedImage.uri || null,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleInputChange = (field: keyof MovieFormData, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleImport = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a movie name');
      return;
    }

    if (!formData.posterUri) {
      Alert.alert('Error', 'Please upload a movie poster');
      return;
    }

    console.log('Importing movie:', formData);

    Alert.alert(
      'Success',
      `"${formData.title}" has been added to your movies`,
      [{text: 'OK', onPress: () => navigation.goBack()}],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ImageBackground
        source={{uri: 'blobBackground'}}
        style={styles.backgroundImage}
        resizeMode="cover">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Add Movie</Text>

          {/* Poster Upload */}
          <TouchableOpacity
            style={styles.posterUpload}
            onPress={handleUploadPoster}
            activeOpacity={0.8}>
            {formData.posterUri ? (
              <Image
                source={{uri: formData.posterUri}}
                style={styles.posterImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadText}>Upload movie poster</Text>
              </View>
            )}

            <View style={styles.titleBanner}>
              <TextInput
                style={styles.titleInput}
                placeholder="Movie Name"
                placeholderTextColor="#FFFFFF"
                value={formData.title}
                onChangeText={text => handleInputChange('title', text)}
              />
            </View>
          </TouchableOpacity>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Movie Genre"
              placeholderTextColor="#999999"
              value={formData.genre}
              onChangeText={text => handleInputChange('genre', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Year Of Release"
              placeholderTextColor="#999999"
              keyboardType="number-pad"
              maxLength={4}
              value={formData.releaseYear}
              onChangeText={text => handleInputChange('releaseYear', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="The Plot"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={3}
              value={formData.plot}
              onChangeText={text => handleInputChange('plot', text)}
            />

            <TextInput
              style={styles.reviewInput}
              placeholder="Write a review"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={formData.review}
              onChangeText={text => handleInputChange('review', text)}
            />
          </View>

          {/* Import Button */}
          <TouchableOpacity style={styles.importButton} onPress={handleImport}>
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.Primary2,
    textAlign: 'center',
    marginBottom: 30,
  },
  posterUpload: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  uploadPlaceholder: {
    flex: 1,
    backgroundColor: '#BDFFD3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadText: {
    color: '#999999',
    fontSize: 16,
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  titleBanner: {
    backgroundColor: colors.Primary2,
    padding: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  titleInput: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.Primary2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.Primary2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#333333',
    height: 120,
  },
  importButton: {
    backgroundColor: colors.Primary2,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddMovieScreen;
