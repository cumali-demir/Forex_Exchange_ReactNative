/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import {Colors, CurrencyFlags, API_KEY} from 'utils/Constants';
import Label from 'components/Label';
import LoadingWrapper from 'components/LoadingWrapper';
import Chart from 'components/Chart';
import SearchBar from 'components/SearchBar';
import ArrowDown from 'images/arrowDown.png';
import TriangularUp from 'images/triangularUp.png';
import TriangularDown from 'images/triangularDown.png';
import HttpClient from 'utils/AxiosInstance';
import CustomBottomSheet from 'components/CustomBottomSheet';
import moment from 'moment';

const CONTAINER_PADDING = 36;

const Main = ({navigation}) => {
  const deviceHeight = Dimensions.get('window').height;
  const deviceWidth = Dimensions.get('window').width;
  const scheduleData = [
    {
      key: '0',
      label: '15M',
      resolution: 1,
      momentValue: [15, 'minute'],
    },
    {
      key: '1',
      label: '1H',
      resolution: 1,
      momentValue: [1, 'hour'],
    },
    {
      key: '2',
      label: '1D',
      resolution: '5',
      momentValue: [1, 'day'],
    },
    {
      key: '3',
      label: '1W',
      resolution: '60',
      momentValue: [1, 'week'],
    },
    {
      key: '4',
      label: '1M',
      resolution: '60',
      momentValue: [1, 'month'],
    },
  ];
  const height80 = (deviceHeight * 80) / 100;
  const height60 = (deviceHeight * 60) / 100;
  const height50 = (deviceHeight * 50) / 100;
  const [isReady, setIsReady] = React.useState(false);
  const [searchText, setSearchText] = React.useState('');
  const [priceData, setPriceData] = React.useState([]);
  const [selectedScheduleData, setSelectedScheduleData] = React.useState(null);
  const [exhanges, setExhanges] = React.useState([]);
  const [selectedExchange, setSelectedExchange] = React.useState('');
  const [currencies, setCurrencies] = React.useState([]);
  const [selectedCurrency, setSelectedCurrency] = React.useState({
    info: {},
    firstCurrencyImage: null,
    secondCurrencyImage: null,
  });
  const [loading, setLoading] = React.useState(true);
  const socketRef = React.useRef(null);
  const exchangesBottomSheetRef = React.useRef(null);
  const currenciesBottomSheetRef = React.useRef(null);

  React.useEffect(() => {
    socketRef.current = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
    socketRef.current?.addEventListener('message', function (event) {
      console.log('socket message', event);
      if (event.data && event.type === 'trade') {
        const parsedData = JSON.parse(event.data);
        const {data} = parsedData || {};
        const price = data[0].p;
        setPriceData(prev => [...prev, price]);
      }
    });
    socketRef.current?.addEventListener('open', function (event) {
      console.log('socket opened', event);
    });
    socketRef.current?.addEventListener('error', error => {
      Alert.alert('Something went wrong when fetch realtime data');
    });
    getExchanges();

    return () => {
      socketRef.current?.send(
        JSON.stringify({type: 'unsubscribe', symbol: 'symbol'}),
      );
    };
  }, []);

  React.useEffect(() => {
    if (selectedExchange) {
      setLoading(true);
      getSymbols(selectedExchange);
    }
  }, [selectedExchange]);

  React.useEffect(() => {
    if (selectedCurrency?.info?.displaySymbol) {
      setSelectedScheduleData(scheduleData[0]);
      socketRef.current?.send(
        JSON.stringify({
          type: 'subscribe',
          symbol: convertSymbolForApi()?.toUpperCase(),
        }),
      );
    }

    return () => {
      socketRef.current?.send(
        JSON.stringify({
          type: 'unsubscribe',
          symbol: convertSymbolForApi()?.toUpperCase(),
        }),
      );
    };
  }, [selectedCurrency]);

  React.useEffect(() => {
    if (selectedScheduleData) {
      getPrices();
    }
  }, [selectedScheduleData]);

  const getExchanges = () => {
    HttpClient.Get('forex/exchange')
      .then(exhangesRes => {
        const defaultSelect = exhangesRes[0];
        setExhanges(exhangesRes);
        setSelectedExchange(defaultSelect);
      })
      .catch(err => {
        setLoading(false);
        console.log('err', err);
      });
  };
  const getSymbols = exchange => {
    HttpClient.Get('forex/symbol', {exchange})
      .then(currenciesRes => {
        const defaultCurrency = currenciesRes[0];
        const {firstCurrencyImage, secondCurrencyImage} =
          manipulateCurrencyObject(defaultCurrency);
        setSelectedCurrency({
          firstCurrencyImage,
          secondCurrencyImage,
          info: defaultCurrency,
        });
        setCurrencies(currenciesRes);
      })
      .catch(err => {
        setLoading(false);
        console.log('err', err);
      });
  };

  const getPrices = () => {
    setLoading(true);
    const {displaySymbol} = selectedCurrency?.info;
    const {momentValue, resolution} = selectedScheduleData;
    HttpClient.Get('forex/candle', {
      resolution,
      from: moment()
        .subtract(...momentValue)
        .unix(),
      to: moment().unix(),
      symbol: convertSymbolForApi(displaySymbol),
    })
      .then(prices => {
        setPriceData(prices.c);
        setIsReady(true);
        socketRef.current?.send(
          JSON.stringify({
            type: 'subscribe',
            symbol: convertSymbolForApi()?.toUpperCase(),
          }),
        );
      })
      .catch(err => {
        console.log('err', err);
      })
      .finally(() => setLoading(false));
  };

  const convertSymbolForApi = () => {
    const {displaySymbol} = selectedCurrency?.info;
    return `${selectedExchange}:${displaySymbol?.replace('/', '_')}`;
  };

  const manipulateCurrencyObject = currency => {
    const {displaySymbol} = currency || {};
    const symbolArray = displaySymbol.toLowerCase().split('/');
    const firstCurrency = symbolArray ? symbolArray[0] : '';
    const secondCurrency = symbolArray ? symbolArray[1] : '';
    return {
      firstCurrencyImage: CurrencyFlags[firstCurrency],
      secondCurrencyImage: CurrencyFlags[secondCurrency],
    };
  };

  const renderExhanges = () =>
    exhanges?.map((item, index) => {
      return (
        <View key={`key${item}${index}`}>
          <Label
            text={item}
            onPressFunc={() => {
              setSelectedExchange(item);
              exchangesBottomSheetRef?.current?.close();
            }}
            containerStyle={styles.exchangeItem}
          />
          <View style={styles.divider} />
        </View>
      );
    });

  const renderCurrencies = () => {
    let dataSource = [];
    if (searchText) {
      dataSource = currencies.filter(({displaySymbol}) => {
        return displaySymbol
          ?.toLowerCase()
          ?.replace('/', '')
          ?.includes(searchText.toLocaleLowerCase());
      });
    } else {
      dataSource = currencies;
    }
    return (
      <>
        <SearchBar
          reailtimeSearch={false}
          getSearchedText={text => setSearchText(text)}
        />
        <FlatList
          data={dataSource}
          keyExtractor={item => {
            return `Unique${item.displaySymbol}`;
          }}
          contentContainerStyle={styles.contentContainerStyle}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({item}) => {
            const {firstCurrencyImage, secondCurrencyImage} =
              manipulateCurrencyObject(item);
            const {description} = item || {};

            return (
              <Pressable
                onPress={() => {
                  setSelectedCurrency({
                    firstCurrencyImage,
                    secondCurrencyImage,
                    info: item,
                  });
                  currenciesBottomSheetRef?.current?.close();
                }}
                style={styles.selectedPairContainer}>
                <View style={styles.flagShadow}>
                  <Image source={firstCurrencyImage} style={styles.pairImage} />
                </View>
                <View style={styles.flagShadow}>
                  <Image
                    source={secondCurrencyImage}
                    style={styles.pairImage}
                  />
                </View>
                <Label
                  text={description}
                  containerStyle={styles.labelContainerStyle}
                />
              </Pressable>
            );
          }}
        />
      </>
    );
  };

  let currentPrice,
    firstPrice,
    changeAmount,
    percentageAmount,
    diff,
    prefix = '';

  let isPositive = null;
  if (priceData.length > 0) {
    firstPrice = priceData[0].toFixed(4);
    currentPrice = priceData[priceData.length - 1].toFixed(4);
    isPositive = currentPrice > firstPrice;
    prefix = isPositive ? '+' : '-';
    diff = Math.abs(currentPrice - firstPrice).toFixed(3);
    changeAmount = `${prefix}${diff}`;
    percentageAmount = `${prefix}${((diff / firstPrice) * 100).toFixed(3)}`;
  }

  const renderStatusBar = () =>
    Platform.OS === 'ios' ? (
      <SafeAreaView style={styles.statusBar} />
    ) : (
      <StatusBar backgroundColor={Colors.lightBlue} barStyle="dark-content" />
    );

  console.log('priceData', priceData);
  return (
    <LoadingWrapper loading={loading} isReady={isReady}>
      {renderStatusBar()}
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Label text={'Forex Exchange'} textStyle={styles.headerStyle} />
            <Label
              text={
                'Checkout the current price on different exchanges for a currency pair'
              }
              textStyle={styles.descStyle}
            />
          </View>
          <View style={styles.selectableContainer}>
            <Label
              text={selectedExchange}
              iconRight={ArrowDown}
              iconSize={15}
              iconRightStyle={{tintColor: Colors.lightGray}}
              onPressFunc={() => exchangesBottomSheetRef?.current?.open()}
            />
            <Pressable
              style={styles.parityContainer}
              onPress={() => currenciesBottomSheetRef?.current?.open()}>
              <Image
                resizeMode="contain"
                source={ArrowDown}
                style={[styles.size15, {tintColor: Colors.lightGray}]}
              />
              <View style={styles.flagShadow}>
                <Image
                  source={selectedCurrency.firstCurrencyImage}
                  style={styles.pairImage}
                />
              </View>
              <View style={styles.flagShadow}>
                <Image
                  source={selectedCurrency.secondCurrencyImage}
                  style={styles.pairImage}
                />
              </View>
            </Pressable>
          </View>
        </View>
        <View style={styles.container}>
          <View style={styles.bottomBox}>
            {/* api doesnt provide symbol like $ € £ */}
            <Label
              text={currentPrice}
              textStyle={styles.fontSize28}
              containerStyle={styles.marginTop12}
              iconLeftStyle={{tintColor: Colors.winGreen}}
            />
            <Label
              text={`${changeAmount}(${percentageAmount}%)`}
              iconLeft={isPositive ? TriangularUp : TriangularDown}
              iconSize={15}
              containerStyle={styles.marginVertical6}
              iconLeftStyle={{
                tintColor: isPositive ? Colors.winGreen : Colors.red,
              }}
            />
          </View>
          <View style={styles.chartContainer}>
            {priceData?.length > 0 ? (
              <Chart
                title={selectedCurrency?.info?.displaySymbol}
                scheduleDataChange={item => setSelectedScheduleData(item)}
                scheduleData={scheduleData}
                selectedScheduleData={selectedScheduleData}
                data={priceData}
                height={height50}
                width={deviceWidth - 2 * CONTAINER_PADDING}
              />
            ) : null}
          </View>
        </View>
        <CustomBottomSheet
          header="Forex Exchanges"
          sheetRef={exchangesBottomSheetRef}
          bottomSheetHeight={height60}
          renderContent={renderExhanges}
        />
        <CustomBottomSheet
          onClose={() => setSearchText('')}
          header="Forex Symbols"
          sheetRef={currenciesBottomSheetRef}
          bottomSheetHeight={height80}
          renderContent={renderCurrencies}
        />
      </SafeAreaView>
    </LoadingWrapper>
  );
};

export default Main;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingBottom: 24,
  },
  header: {
    flex: 1,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'space-between',
    paddingHorizontal: CONTAINER_PADDING,
  },
  container: {
    flex: 3,
    backgroundColor: Colors.white,
    paddingHorizontal: CONTAINER_PADDING,
  },
  selectableContainer: {
    backgroundColor: Colors.white50,
    flex: 1,
    height: 50,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 3,
    justifyContent: 'center',
  },
  headerStyle: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  descStyle: {
    fontWeight: '500',
    fontSize: 16,
    color: Colors.lightGray,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomBox: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    height: 80,
  },
  marginTop12: {
    marginTop: 12,
  },
  marginVertical6: {
    marginVertical: 6,
  },
  parityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyFlagImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginHorizontal: 3,
  },
  headerSheet: {
    backgroundColor: '#f7f5eee8',
    shadowColor: '#000000',
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.lightGray,
  },
  exchangeItem: {
    height: 30,
    marginVertical: 5,
  },
  flagShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: Colors.white,
    marginHorizontal: 3,
    borderRadius: 15,
  },
  selectedPairContainer: {
    flexDirection: 'row',
    marginVertical: 12,
    alignItems: 'center',
  },
  pairImage: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  labelContainerStyle: {
    flex: 1,
    marginLeft: 6,
    justifyContent: 'flex-start',
  },
  size15: {
    width: 15,
    height: 15,
  },
  fontSize28: {
    fontSize: 28,
  },
  chartContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 2,
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    marginTop: 24,
  },
  statusBar: {
    flex: 0,
    backgroundColor: Colors.lightBlue,
  },
  contentContainerStyle: {
    paddingTop: 24,
  },
});
