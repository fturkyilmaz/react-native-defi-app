import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Image,
  TextInput,
  useColorScheme,
  View,
  TouchableOpacity,
  Button,
} from 'react-native';

import Clipboard from '@react-native-clipboard/clipboard';

import {ethers} from 'ethers';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import Greeter from './artifacts/contracts/Greeter.sol/Greeter.json';

const ACTIVE_CRYPTO_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const TO = '0x3ba6d053469B13EEaB55B5681b3Ea1d83F089512';

const CONTRACT_ADDRESS = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9';

export default function App() {
  const provider = React.useMemo(() => {
    return new ethers.providers.JsonRpcProvider('http://localhost:8545');
  }, []);

  const isDarkMode = useColorScheme() === 'dark';

  const [form, setForm] = useState({
    to: TO,
    value: '1',
  });

  const [errorMessage, setError] = useState();

  const [transaction, setTransaction] = useState('');

  const [totalAmount, setTotalAmount] = useState('0');

  const backgroundStyle = {
    flex: 1,
    backgroundColor: isDarkMode ? Colors.black : Colors.white,
    marginHorizontal: 20,
  };

  const payment = async () => {
    try {
      setTransaction('');

      setError('');

      const signer = provider.getSigner();

      let userAddress = await signer.getAddress();

      console.log('userAddress', userAddress);

      const transactionResponse = await signer.sendTransaction({
        to: form.to,
        value: ethers.utils.parseEther(form.value),
      });

      await getTotalBalance();

      setTransaction(transactionResponse.hash);

      console.log('object', JSON.stringify(transactionResponse, null, 4));
    } catch (error) {
      setError(error.message);
      console.log('error', error.message);
    }
  };

  const getTotalBalance = React.useCallback(async () => {
    try {
      const balance = await provider.getBalance(ACTIVE_CRYPTO_ADDRESS);

      const remainder = balance.mod(1e14);

      const formattedBalance = ethers.utils.formatEther(balance.sub(remainder));

      console.log('fo');

      setTotalAmount(formattedBalance);
    } catch (error) {
      setError(error.message);
    }
  }, [provider]);

  const onChangeText = (key, text) => {
    setForm({...form, [key]: text});
  };

  const copyToClipboard = content => {
    Clipboard.setString(content);
  };

  function Message({message}) {
    if (!message) {
      return null;
    }

    return (
      <TouchableOpacity onPress={() => copyToClipboard(message)}>
        <View
          style={{
            backgroundColor: errorMessage ? 'red' : 'green',
            padding: 10,
          }}>
          <Text style={styles.errorDescription}>{message}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  async function fetchGreeting() {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      Greeter.abi,
      provider,
    );

    try {
      const data = await contract.greet();
      console.log('data: ', data);
    } catch (err) {
      console.log('Error: ', err);
    }
  }

  // call the smart contract, send an update
  async function setGreeting() {
    const signer = provider.getSigner();

    const contract = new ethers.Contract(CONTRACT_ADDRESS, Greeter.abi, signer);

    const tx = await contract.setGreeting('Hello, Hardhat!');

    console.log(`Transaction hash: ${tx.hash}`);

    const response = await tx.wait();

    console.log(`Transaction confirmed in block ${response.blockNumber}`);

    console.log(`Gas used: ${response.gasUsed.toString()}`);

    fetchGreeting();
  }

  async function sayHelloBlockchain() {
    const signer = provider.getSigner(0);

    const contract = new ethers.Contract(CONTRACT_ADDRESS, Greeter.abi, signer);

    const tx = await contract.sayHelloAllBlockchain(
      'Manisa Celal Bayar Üniversitesinden Tüm Blockchain Network Selamlar:)) -  16.12.2021',
    );
    await tx.wait();

    await fetchGreeting();
  }

  React.useEffect(() => {
    // let privateKey =
    //   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

    // let wallet = new ethers.Wallet(privateKey, provider);

    // wallet.connect(provider);

    // console.log('wallet', wallet);

    // console.log('Greeter ABI: ', Greeter.abi);

    // fetchGreeting();
    // sayHelloBlockchain();

    getTotalBalance();
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            flex: 1,
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Image
            source={{
              uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/1257px-Ethereum_logo_2014.svg.png',
            }}
            style={{width: '100%', height: 350, marginBottom: 20}}
            resizeMethod="scale"
            resizeMode="contain"
          />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.white : Colors.black,
                textAlign: 'center',
                marginBottom: 20,
              },
            ]}>
            {totalAmount} ETH
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.white : Colors.black,
              },
            ]}>
            Address
          </Text>
          <TextInput
            placeholder="Ethereum Address"
            style={[
              styles.textInput,
              {
                color: isDarkMode ? Colors.white : Colors.black,
              },
            ]}
            value={form.to}
            onChangeText={text => onChangeText('to', text)}
          />
          <Text
            style={[
              styles.sectionTitle,
              {
                color: isDarkMode ? Colors.white : Colors.black,
              },
            ]}>
            Amount
          </Text>
          <TextInput
            placeholder="Amount"
            style={[
              styles.textInput,
              {
                color: isDarkMode ? Colors.white : Colors.black,
              },
            ]}
            value={form.value}
            onChangeText={text => onChangeText('value', text)}
          />
          <Button title="Pay" onPress={payment} />
          <Message message={transaction || errorMessage} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorMessage: {
    color: 'red',
    fontSize: 12,
    marginTop: 15,
    fontWeight: '700',
  },
  errorDescription: {
    fontSize: 15,
    color: '#FFF',
    fontWeight: '500',
  },
  textInput: {
    padding: 15,
    marginVertical: 15,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});
