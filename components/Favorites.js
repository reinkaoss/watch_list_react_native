import { useEffect, useState, React } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Button, Card, FlatList, useNavigation } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AntDesign } from "@expo/vector-icons";

function Favorites({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  const getFavorites = async () => {
    console.log("Retrieving favorites from local storage...");
    try {
      const value = await AsyncStorage.getItem("favorites");
      if (value !== null) {
        console.log("Favorites retrieved successfully!");
        setFavorites(JSON.parse(value));
      }
    } catch (error) {
      console.log("Error retrieving favorites:", error);
    }
  };

  useEffect(() => {
    console.log("Favorites component mounted!");
    const unsubscribe = navigation.addListener("focus", () => {
      console.log("Favorites screen focused!");
      getFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  const addToFavorites = async (movie) => {
    if (favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      console.log(
        `Movie with imdbID ${movie.imdbID} already exists in favorites`
      );
      Alert.alert("Already in your Watch List");
      return;
    }
    const updatedFavorites = [...favorites, movie];
    console.log(`favorites list: ${updatedFavorites}`);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites((prevFavorites) => [...prevFavorites, movie]);
    console.log(updatedFavorites);
  };

  const removeFromFavorites = async (movie) => {
    const updatedFavorites = favorites.filter(
      (fav) => fav.imdbID !== movie.imdbID
    );
    console.log(`favorites list: ${updatedFavorites}`);
    await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    setFavorites(updatedFavorites);
    console.log(updatedFavorites);
    Alert.alert("Oops", "This film has been removed from your watchlist!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Watch List</Text>
      <ScrollView>
        {favorites.map((item) => (
          <View style={styles.favContainer} key={item.imdbID}>
            <Text style={styles.favorites}>
              {item.Title}<TouchableOpacity onPress={() => removeFromFavorites(item)}> 
                <AntDesign
                  style={styles.icon}
                  name="delete"
                  size={22}
                  color="white"
                />
              </TouchableOpacity>
              
            </Text>
            
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default Favorites;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#3333",
  },
  title: {
    textAlign: "center",
    padding: 20,
    fontSize: 26,
    fontWeight: "bold",
  },
  favorites: {
    fontSize: 16,
    fontWeight: "bold",
    // textAlign: "left",
    backgroundColor: "#3333",
    padding: 10,
    margin: 5,
    color: "white",
    borderRadius: 7,
    marginHorizontal: 20,
  },
  favContainer: {
    flex: 1,
    // flexWrap: 'wrap',
    flexDirection: 'column'
  },
  icon: {
    flexDirection: 'row',
    width: 300,
    flex: 2,
  }
});
