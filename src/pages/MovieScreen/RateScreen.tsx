import React, {useCallback, useEffect, useMemo, useState} from 'react';
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
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {useRateMovieList} from '#/useLocalStorageSWR';
import uuid from 'react-native-uuid';
import {StarRating} from '#/components/StarRating';
import {RootStackParamsList, Screens} from '#/navigator/type';
import {StackNavigationProp} from '@react-navigation/stack';
import {getPosterUrl} from '#/utils/image';
import {colors} from '#/themes/colors';

type RateScreenProps = {
  navigation: StackNavigationProp<RootStackParamsList>;
  route: RouteProp<RootStackParamsList, Screens.RateScreen>;
};

export const RateScreen: React.FC<RateScreenProps> = ({navigation, route}) => {
  const movieData = route?.params?.movie;
  const {data, saveData} = useRateMovieList();
  const rateMovieFind = useMemo(() => {
    return (data || []).find(item => item.movie.id === movieData.id);
  }, [data, movieData.id]);
  console.log(rateMovieFind);
  const [rating, setRating] = useState<number>(5);
  const [review, setReview] = useState<string>('');
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  useEffect(() => {
    if (rateMovieFind) {
      setRating(rateMovieFind?.star);
      setReview(rateMovieFind.review);
    }
  }, [rateMovieFind]);

  const handleRating = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    Alert.alert(
      'Thank You!',
      `Your ${rating}-star review has been ${
        rateMovieFind ? 'updated' : 'submitted'
      }.`,
      [
        {
          text: 'OK',
          onPress: () => {
            const newData = {
              star: rating,
              review: review,
              date: new Date().toISOString(),
            };
            if (rateMovieFind) {
              const updateData = (data || []).map(item =>
                item.movie.id === rateMovieFind.movie.id
                  ? {
                      ...newData,
                      movie: {
                        title: rateMovieFind.movie.title,
                        vote_average: rateMovieFind.movie.vote_average,
                        release_date: rateMovieFind.movie.release_date,
                        overview: rateMovieFind.movie.overview,
                        poster_path: rateMovieFind.movie.poster_path,
                        id: movieData.id.toString(),
                      },
                    }
                  : item,
              );
              saveData(updateData);
            } else {
              const updateData = [
                ...(data || []),
                {
                  ...newData,
                  movie: {
                    title: movieData.title || '',
                    vote_average: movieData.vote_average || 0,
                    release_date: movieData.release_date,
                    overview: movieData.overview,
                    poster_path: movieData.poster_path,
                    id: movieData.id.toString(),
                  },
                },
              ];
              saveData(updateData);
            }
            navigation.navigate(Screens.MainScreen, {
              screen: Screens.DiaryScreen,
            });
          },
        },
      ],
    );
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

            <TouchableOpacity onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.movieCard}>
            <Image
              source={{
                uri: getPosterUrl(movieData.poster_path || ''),
              }}
              style={styles.moviePoster}
              resizeMode="cover"
            />
            <View style={styles.titleContainer}>
              <Text style={styles.movieTitle}>{movieData.title}</Text>
            </View>
          </View>

          <View style={styles.starsContainer}>
            <StarRating rating={rating} onRatingChange={handleRating} />
          </View>
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
    color: '#0F4C3A',
    fontSize: 18,
    fontWeight: '600',
  },
});
