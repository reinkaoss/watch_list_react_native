import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView
} from "react-native";
import { Card, Button, SearchBar } from "react-native-elements";
import Carousel from "react-native-snap-carousel";
var randomWords = require("random-words");
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';


function Home() {
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const fetchMovies = async (search) => {
    console.log("fetchMovies called with search:", search);
    try {
      const response = await fetch(
        `http://www.omdbapi.com/?s=${search}&apikey=c436ea29`
      );
      const data = await response.json();
      if (data.Search && data.Search.length > 0) {
        const imdbIds = data.Search.map((movie) => movie.imdbID);
        const moviesWithDetails = await Promise.all(
          imdbIds.map(async (imdbId) => {
            const detailsResponse = await fetch(
              `http://www.omdbapi.com/?i=${imdbId}&apikey=c436ea29`
            );
            const detailsData = await detailsResponse.json();
            // console.log(detailsData)
            return detailsData;
          })
        );
        setMovies(moviesWithDetails.slice(0, 10)); // only store the first 10 movies in the state
        console.log("setMovies called with movies:", moviesWithDetails.slice(0, 10));
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error(error);
      setMovies([]);
    }
  };

  const handleSearch = () => {
    console.log("handleSearch called");
    fetchMovies(randomWords());
  };

  const handleDescrip = (movie) => {
    setSelectedMovie(movie);
  };

  const handleWatchLater = async (movie) => {
    if (favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      console.log(`Movie with imdbID ${movie.imdbID} already exists in favorites`);
      Alert.alert("Already in your Watch List")
      return;
    }
    const updatedFavorites = [...favorites, movie];
    setFavorites(updatedFavorites);
    console.log(`favorites list: ${updatedFavorites}`);
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      console.log(updatedFavorites);
    } catch (error) {
      console.error(error);
    }
  };

  const convertRatingToStars = (rating) => {
    const numStars = Math.round(rating) / 2;
    const fullStars = Math.floor(numStars);
    const halfStars = Math.round(numStars - fullStars);
    const emptyStars = 5 - fullStars - halfStars;
    return (
      "★".repeat(fullStars) + "☆".repeat(halfStars) + "☆".repeat(emptyStars)
    );
  };

  const renderMovie = ({ item }) => {
    const key = uuidv4(); // generate a unique key for each movie
    return (
      <View style={styles.cardContainer} key={key}>
        <Card style={styles.card}>
          <Card.Title style={styles.cardTitle}>
            {item.Title} ({item.Year})
          </Card.Title>
          <TouchableOpacity onPress={() => handleDescrip(item)}>
            <Card.Image
              source={{ uri: item.Poster }}
              resizeMode="cover"
              style={styles.image}
            />
          </TouchableOpacity>
          <Text style={styles.rating}>{convertRatingToStars(item.imdbRating)}</Text>
          <Button
            style={styles.watchLaterButton}
            title="Watch Later"
            onPress={() => handleWatchLater(item)}
          />
        </Card>
      </View>
    );
  };

  const renderMovies = () => {
    return (
      <Carousel
        data={movies}
        renderItem={renderMovie}
        sliderWidth={400}
        itemWidth={300}
        itemHeight={400}
      />
    );
  };

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favoritesData = await AsyncStorage.getItem('favorites');
        if (favoritesData) {
          setFavorites(JSON.parse(favoritesData));
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadFavorites();
  }, []);



  return (
    <View style={styles.container}>
       {/* <ScrollView style={styles.scroll}> */}
      <Text style={styles.title}>Find a Random Movie!</Text>
      <Text style={styles.text}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</Text>
      {renderMovies()}
      <Text style={styles.instructions}>Click the film cover for more info.</Text>
      <View style={styles.buttonContainer}>
        <Button
          style={styles.button}
          icon={{ name: "movie", color: "#ffffff" }}
          title="Search"
          onPress={handleSearch}
        />
      </View>
      <Modal visible={selectedMovie !== null} animationType="slide">
        <View style={styles.modalContainer}>
          {selectedMovie && (
            <>
              <Image
                source={{ uri: selectedMovie.Poster }}
                resizeMode="cover"
                style={styles.modalImage}
              />
              <Text style={styles.modalTitle}>
                {selectedMovie.Title} ({selectedMovie.Year})
              </Text>
              <Text style={styles.modalRating}>
                IMDb Rating: {selectedMovie.imdbRating} (
                {convertRatingToStars(selectedMovie.imdbRating)})
              </Text>
              <Text style={styles.modalPlot}>{selectedMovie.Plot}</Text>
              <Button
                title="Close"
                onPress={() => setSelectedMovie(null)}
                style={styles.modalButton}
              />
            </>
          )}
        </View>
      </Modal>
      {/* </ScrollView> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    
  },
  instructions: {
    color: 'white',
    fontStyle: 'italic',
    // flex: 0.1,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 20,
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 28,
    paddingTop: 5,
  },
  text: {
    // flex: 0.1,
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
    textAlign: 'center',
  },

  // Card
  card: {
    borderRadius: 15,
  },

  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 270,
    width: 200,
    // aspectRatio: 2 / 2, // set a fixed aspect ratio for the image
    // maxHeight: 280,
    // maxWidth: 220,
    // alignItems: "center",
    // alignContent: "center",
    // borderRadius: 5,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  buttonContainer: {
    // flex: 0.1,
    backgroundColor: 'red',
    alignContent: 'center',
    justifyContent: 'center',
    width: 150,
  },
  button: {
    width: 50,
  },

  rating: {
    width: 80,
    marginLeft: 70,
    marginBottom: 10,
    marginTop: 10,
  },

   // Modal 
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingBottom: 50,
  },

 
  modalImage: {
    height: 300,
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  modalRating: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10,
  },
  modalPlot: {
    fontSize: 16,
    textAlign: "justify",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  modalButton: {
    width: "100%",
    marginTop: 20,
  },
});

export default Home;