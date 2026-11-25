import React from 'react';
import { View, StyleSheet } from 'react-native';

interface IconBoxProps {
  backgroundColor: string;
  children: React.ReactNode;
  size?: number;
  borderRadius?: number;
}

export const IconBox: React.FC<IconBoxProps> = ({ 
  backgroundColor, 
  children, 
  size = 120, 
  borderRadius = 32 
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          width: size,
          height: size,
          borderRadius,
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});
