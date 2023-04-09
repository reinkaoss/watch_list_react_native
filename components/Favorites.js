import React from 'react';
import { View, Text, StyleSheet} from 'react-native';
import { Button, Card, FlatList } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';


function Favorites({ navigation }) {
    const [favorites, setFavorites] = useState([]);
  
    const getFavorites = async () => {
      console.log('Retrieving favorites from local storage...');
      try {
        const value = await AsyncStorage.getItem('favorites');
        if (value !== null) {
          console.log('Favorites retrieved successfully!');
          setFavorites(JSON.parse(value));
        }
      } catch (error) {
        console.log('Error retrieving favorites:', error);
      }
    };
  
    useEffect(() => {
      console.log('Favorites component mounted!');
      const unsubscribe = navigation.addListener('focus', () => {
        console.log('Favorites screen focused!');
        getFavorites();
      });
      return unsubscribe;
    }, [navigation]);
  
    const addToFavorites = async (movie) => {
      if (favorites.some((fav) => fav.imdbID === movie.imdbID)) {
        console.log(`Movie with imdbID ${movie.imdbID} already exists in favorites`);
        Alert.alert("Already in your Watch List")
        return;
      }
      const updatedFavorites = [...favorites, movie];
      console.log(`favorites list: ${updatedFavorites}`);
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      setFavorites((prevFavorites) => [...prevFavorites, movie]);
      console.log(updatedFavorites);
    };
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Watch List</Text>
        {/* <Button title={"test"} onPress={() => console.log(favorites)}></Button> */}
        {favorites.map((item) => (
          <View key={item.imdbID}>
            <Text style={styles.favorites}>{item.Title}  
 </Text>
            
          </View>
        ))}
      </View>
    );
  }
  
export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'salmon',
  },
  title: {
    textAlign: 'center',
    padding: 20,
    fontSize: 26,
    fontWeight: 'bold',
  },
  favorites: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    backgroundColor: 'purple',
    padding: 20,
    margin: 3,
    color: 'white'
  }
});

