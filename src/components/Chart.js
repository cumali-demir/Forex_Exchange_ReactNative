import React from 'react';
import {View, StyleSheet} from 'react-native';
import Label from 'components/Label';
import {Colors} from 'utils/Constants';
import {AreaChart} from 'react-native-svg-charts';
import {Defs, LinearGradient, Stop} from 'react-native-svg';
import * as shape from 'd3-shape';

const Chart = ({
  width,
  height,
  data,
  title,
  scheduleData,
  selectedScheduleData,
  scheduleDataChange,
}) => {
  const strokeWidth = 3;
  const Gradient = () => (
    <Defs key={'gradient'}>
      <LinearGradient id={'gradient'} x1={'0'} y1={'100%'} x2={'0'} y2={'30%'}>
        <Stop offset={'1'} stopColor={'#95db3b'} stopOpacity={1} />
        <Stop offset={'0'} stopColor={'#f9fdf5'} stopOpacity={1} />
      </LinearGradient>
    </Defs>
  );
  return (
    <View style={styles.flex1}>
      <View style={styles.topContainer}>
        <Label text={title} textStyle={styles.headerText} />
      </View>
      <View style={styles.flex5}>
        <AreaChart
          style={styles.flex1}
          data={[...data]}
          yMin={0}
          numberOfTicks={10}
          // yScale={}
          contentInset={{
            top: 0,
            bottom: -strokeWidth,
            left: -strokeWidth,
            right: -strokeWidth,
          }}
          curve={shape.curveLinear}
          svg={{
            strokeWidth,
            fill: 'url(#gradient)',
            stroke: Colors.green,
          }}>
          <Gradient />
        </AreaChart>
      </View>
      <View style={styles.bottomContainer}>
        {scheduleData?.map(item => {
          const {label, key} = item;
          const isSelected = selectedScheduleData.key === key;
          return (
            <Label
              key={key}
              onPressFunc={() => scheduleDataChange(item)}
              containerStyle={[
                styles.labelContainer,
                isSelected ? styles.colorMint : null,
              ]}
              textStyle={
                isSelected
                  ? [styles.fontWeightBold, styles.colorBlack]
                  : [styles.colorLightGray, styles.fontWeightNormal]
              }
              text={label}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  flex5: {
    flex: 5,
    flexDirection: 'row',
  },
  topContainer: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: Colors.black,
    fontWeight: 'bold',
    fontSize: 18,
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorBlack: {
    color: Colors.black,
  },
  colorLightGray: {
    color: Colors.lightGray,
  },
  colorMint: {
    color: Colors.Mint,
  },
  fontWeightBold: {
    fontWeight: 'bold',
  },
  fontWeightNormal: {
    fontWeight: 'normal',
  },
  labelContainer: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
});

export default Chart;
