import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useState, useContext } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';

export default function StoreScreen({ coins, setCoins }) {
  const [items] = useState([
    { id: 1, label: 'Barca', price: 200 },
    { id: 2, label: 'Real', price: 250 },
    { id: 3, label: 'Feyenoord', price: 150 },
    { id: 4, label: 'PSV', price: 300 },
  ]);

  const { user } = useContext(AuthContext);

  const buyCoins = async (amount) => {
    const newTotal = coins + amount;
    setCoins(newTotal);

    try {
      if (user) {
        await setDoc(doc(db, 'users', user.uid), { coins: newTotal });
      }
    } catch (error) {
      console.error('Fout bij opslaan van coins:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.starBox}>
        <Text>⭐</Text>
      </View>
      <View style={styles.priceBox}>
        <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
        <Text>{item.price}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Saldo-balk */}
      <View style={styles.coinBar}>
        <View style={styles.coinDisplay}>
          <Image source={require('../assets/coin.png')} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>

        {/* Koopknoppen */}
        <View style={styles.buyButtons}>
          {[100, 500, 1000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.buyButton}
              onPress={() => buyCoins(amount)}
            >
              <Text style={styles.buyText}>+{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lijst met cosmetics */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  coinBar: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  coinText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButtons: {
    flexDirection: 'row',
  },
  buyButton: {
    backgroundColor: '#ffe066',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  buyText: {
    fontWeight: 'bold',
  },
  item: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  starBox: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
