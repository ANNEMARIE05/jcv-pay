import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/colors';

interface BarcodeProps {
  value: string;
  height?: number;
  style?: ViewStyle;
}

export const Barcode: React.FC<BarcodeProps> = ({
  value,
  height = 54,
  style,
}) => {
  // Generate a deterministic pattern of barcode stripes based on the input value
  const generateBars = (code: string) => {
    const bars: { width: number; isSpace: boolean }[] = [];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash * 31 + code.charCodeAt(i)) % 100000;
    }

    const patternSequence = [
      2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1,
      1, 3, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 1,
      2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 4,
    ];

    for (let i = 0; i < patternSequence.length; i++) {
      const width = patternSequence[i];
      const isSpace = i % 2 === 1;
      bars.push({ width, isSpace });
    }
    return bars;
  };

  const bars = generateBars(value);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.barsRow, { height }]}>
        {bars.map((bar, index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                width: bar.width,
                backgroundColor: bar.isSpace ? 'transparent' : AppColors.textPrimary,
              },
            ]}
          />
        ))}
      </View>
      <Text style={styles.codeText}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  bar: {
    height: '100%',
    marginRight: 1.5,
  },
  codeText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 3,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
});
