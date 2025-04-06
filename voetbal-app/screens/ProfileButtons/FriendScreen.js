import { View, Text, StyleSheet } from 'react-native';

export default function FriendScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>👥 Je vrienden</Text>
            <Text style={styles.text}>Je hebt momenteel 5 vrienden!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    text: {
        fontSize: 16,
        color: 'gray',
    },
});
