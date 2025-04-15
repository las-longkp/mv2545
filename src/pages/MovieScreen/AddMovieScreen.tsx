import {MyMovie, Screens, TypeList} from '#/navigator/type';
import {colors} from '#/themes/colors';
import {useInitializeMovie, useMyMovieList} from '#/useLocalStorageSWR';
import {getPosterUrl} from '#/utils/image';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {IconButton} from 'react-native-paper';
interface FormMovie extends Omit<MyMovie, 'vote_average'> {
  vote_average: number | string;
}

const AddMovieScreen = () => {
  const {width} = Dimensions.get('window');

  const isTablet = width > 768;
  const navigation = useNavigation();
  const {data: dataInitializeMovie, saveData: saveDataInitializeMovie} =
    useInitializeMovie();
  const {data, saveData} = useMyMovieList();

  const [formData, setFormData] = useState<FormMovie>({
    title: '',
    release_date: '',
    overview: '',
    poster_path: null,
    id: '',
    vote_average: '',
  });

  useEffect(() => {
    if (dataInitializeMovie) {
      setFormData({
        title: dataInitializeMovie.title ?? '',
        release_date: dataInitializeMovie.release_date ?? '',
        overview: dataInitializeMovie.overview ?? '',
        poster_path:
          getPosterUrl(dataInitializeMovie.poster_path ?? '') ?? null,
        id: dataInitializeMovie.id ? String(dataInitializeMovie.id) : '',
        vote_average: (dataInitializeMovie as any).vote_average ?? '',
      });
    }
  }, [dataInitializeMovie]);

  const handleUploadPoster = async () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 800,
    };
    try {
      const response = await launchImageLibrary(options);
      if (response.didCancel) {
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to pick image: ' + response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImage = response.assets[0];
        setFormData({
          ...formData,
          poster_path: selectedImage.uri || null,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const handleInputChange = (field: keyof FormMovie, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleImport = () => {
    saveDataInitializeMovie(null);
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a movie name');
      return;
    }

    if (!formData.poster_path) {
      Alert.alert('Error', 'Please upload a movie poster');
      return;
    }

    const movieToSave: MyMovie = {
      title: formData.title,
      release_date: formData.release_date,
      overview: formData.overview,
      poster_path: formData.poster_path,
      id: formData.id || Date.now().toString(),
      vote_average: 0,
    };

    Alert.alert(
      'Success',
      `"${formData.title}" has been added to your movies`,
      [
        {
          text: 'OK',
          onPress: () => {
            saveData([...(data || []), movieToSave]);
            navigation.goBack();
          },
        },
      ],
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
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 15,
            }}>
            <IconButton
              onPress={() => {
                saveDataInitializeMovie(null);
                navigation.goBack();
              }}
              icon="chevron-left"
              size={28}
              iconColor={colors.Primary2}
              style={{margin: 0}}
            />
            <Text style={styles.headerTitle}>Add Movie</Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(Screens.SearchMovieScreen, {
                  type: TypeList.MYLIST,
                })
              }>
              <Image
                style={{height: 20, width: 20}}
                source={{uri: 'searchIcon'}}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.posterUpload, {height: isTablet ? 700 : 250}]}
            onPress={handleUploadPoster}
            activeOpacity={0.8}>
            {formData.poster_path ? (
              <Image
                source={{uri: formData.poster_path}}
                style={styles.posterImage}
                resizeMode="contain"
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

          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Vote Average (e.g., 7.5)"
              placeholderTextColor="#999999"
              keyboardType="decimal-pad"
              value={
                formData.vote_average === ''
                  ? ''
                  : String(formData.vote_average)
              }
              onChangeText={text => handleInputChange('vote_average', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Year of Release (YYYY)"
              placeholderTextColor="#999999"
              keyboardType="number-pad"
              maxLength={4}
              value={formData.release_date}
              onChangeText={text => handleInputChange('release_date', text)}
            />
            <TextInput
              style={styles.reviewInput}
              placeholder="The Plot"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              value={formData.overview}
              onChangeText={text => handleInputChange('overview', text)}
            />
          </View>

          <TouchableOpacity style={styles.importButton} onPress={handleImport}>
            <Text style={styles.importButtonText}>Save</Text>
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
  },
  posterUpload: {
    width: '100%',

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
