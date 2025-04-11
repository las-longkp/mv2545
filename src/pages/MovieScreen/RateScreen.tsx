import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ImageBackground,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useRateMovieList} from '#/useLocalStorageSWR';
import uuid from 'react-native-uuid';
interface RateScreenProps {
  route?: any;
}

const RateScreen: React.FC<RateScreenProps> = ({route}) => {
  const navigation = useNavigation();
  const movieData = route?.params?.movie;
  const {data, saveData} = useRateMovieList();
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const handleBack = () => {
    navigation.goBack();
  };

  const handleMenu = () => {
    Alert.alert('Options', 'Select an optioFn', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear Review',
        onPress: () => {
          setRating(0);
          setReview('');
        },
      },
      {text: 'Help', onPress: () => console.log('Help pressed')},
    ]);
  };

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Thank You!',
      `Your ${rating}-star review has been submitted.`,
      [
        {
          text: 'OK',
          onPress: () => {
            const newData = {
              star: rating,
              review: review,
              date: new Date().toISOString(),
            };
            const updateData = [
              ...(data || []),
              {...newData, idMovie: uuid.v4().toString()},
            ];
            saveData(updateData);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRating(i)}
          style={styles.starContainer}>
          <IconButton
            icon={i <= rating ? 'star' : 'star-outline'}
            size={40}
            iconColor="#0F4C3A"
            style={{margin: 0}}
          />
        </TouchableOpacity>,
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#D8F3E9" />
      <ImageBackground source={{uri: 'gridBg'}} style={{flex: 1}}>
        <View style={styles.backgroundImage}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <IconButton
                icon="chevron-left"
                size={28}
                iconColor="#0F4C3A"
                style={{margin: 0}}
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Rate</Text>

            <TouchableOpacity onPress={handleMenu}>
              <IconButton
                icon="dots-horizontal"
                size={24}
                iconColor="#0F4C3A"
                style={{margin: 0}}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.movieCard}>
            <Image
              source={{
                uri: movieData.poster_path.includes('http')
                  ? movieData.poster_path
                  : `https://image.tmdb.org/t/p/w500${movieData.poster_path}`,
              }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.movieTitle}>{movieData.title}</Text>
            </View>
          </View>

          <View style={styles.starsContainer}>{renderStars()}</View>
          <View style={styles.reviewContainer}>
            <TextInput
              style={styles.reviewInput}
              placeholder="Write a review"
              placeholderTextColor="#999999"
              multiline
              value={review}
              onChangeText={setReview}
            />
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D8F3E9',
  },
  backgroundImage: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0F4C3A',
  },
  movieCard: {
    width: 220,
    height: 280,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  moviePoster: {
    width: '100%',
    height: '80%',
  },
  titleContainer: {
    backgroundColor: '#0F4C3A',
    padding: 10,
    height: '20%',
    justifyContent: 'center',
  },
  movieTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  starContainer: {
    marginHorizontal: 5,
  },
  reviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginVertical: 20,
    height: 180,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  reviewInput: {
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333333',
  },
  submitButton: {
    backgroundColor: '#0F4C3A',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RateScreen;
