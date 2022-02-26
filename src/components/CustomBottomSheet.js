import React from 'react';
import {View, Image, Pressable, StyleSheet} from 'react-native';
import Label from 'components/Label';
import RBSheet from 'react-native-raw-bottom-sheet';
import CloseIcon from 'images/close.png';

const CustomBottomSheet = ({
  sheetRef,
  bottomSheetHeight,
  onClose,
  header,
  renderContent,
}) => {
  return (
    <RBSheet
      keyboardAvoidingViewEnabled={false}
      ref={sheetRef}
      height={bottomSheetHeight}
      openDuration={500}
      closeOnPressBack
      closeOnPressMask
      onClose={onClose}
      customStyles={{
        container: {
          paddingTop: 20,
          paddingHorizontal: 24,
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
        },
      }}>
      <View style={styles.container}>
        <Label text={header} textStyle={styles.bottomSheetHeader} />
        <Pressable
          style={styles.closeIcon}
          onPress={() => sheetRef?.current?.close()}>
          <Image source={CloseIcon} style={styles.size15} />
        </Pressable>
      </View>
      {renderContent()}
    </RBSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  bottomSheetHeader: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  closeIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  size15: {width: 15, height: 15},
});

export default CustomBottomSheet;
