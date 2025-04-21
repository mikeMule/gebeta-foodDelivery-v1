import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';

interface GebetaButtonProps extends ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Consistent button component for the Gebeta app
 */
const GebetaButton: React.FC<GebetaButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  style,
  labelStyle,
  children,
  ...props
}) => {
  // Determine button styling based on variant
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'text':
        return styles.textButton;
      default:
        return styles.primaryButton;
    }
  };
  
  // Determine label styling based on variant
  const getLabelStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryLabel;
      case 'secondary':
        return styles.secondaryLabel;
      case 'outline':
        return styles.outlineLabel;
      case 'text':
        return styles.textLabel;
      default:
        return styles.primaryLabel;
    }
  };
  
  // Determine button size
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'medium':
        return styles.mediumButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };
  
  // Combine styles
  const buttonStyle = [getButtonStyle(), getSizeStyle(), style];
  const buttonLabelStyle = [getLabelStyle(), styles.label, labelStyle];
  
  return (
    <Button
      mode={variant === 'outline' ? 'outlined' : variant === 'text' ? 'text' : 'contained'}
      style={buttonStyle}
      labelStyle={buttonLabelStyle}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  // Variant styles
  primaryButton: {
    backgroundColor: '#8B572A',
  },
  secondaryButton: {
    backgroundColor: '#E5A764',
  },
  outlineButton: {
    borderColor: '#8B572A',
    borderWidth: 1,
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  
  // Label styles
  primaryLabel: {
    color: 'white',
    fontFamily: 'DMSans-Bold',
  },
  secondaryLabel: {
    color: 'white',
    fontFamily: 'DMSans-Bold',
  },
  outlineLabel: {
    color: '#8B572A',
    fontFamily: 'DMSans-Bold',
  },
  textLabel: {
    color: '#8B572A',
    fontFamily: 'DMSans-Medium',
  },
  label: {
    letterSpacing: 0.5,
  },
  
  // Size styles
  smallButton: {
    height: 36,
    paddingHorizontal: 10,
  },
  mediumButton: {
    height: 44,
    paddingHorizontal: 15,
  },
  largeButton: {
    height: 52,
    paddingHorizontal: 20,
  },
});

export default GebetaButton;