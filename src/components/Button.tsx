import React from 'react';
import { SMText } from './Text';
import { motion } from 'framer-motion';


interface SMButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  disabled?: boolean
  bgColor: string;
  style?: React.CSSProperties; 
  onClick?: () => void;
  text: string;
}

export const SMButton: React.FC<SMButtonProps> = (props) => {
  const { color, style, text, disabled } = props;
  let { bgColor, onClick } = props;

  if (disabled) {
    bgColor = 'grey';
    onClick = () => {null;};
  }

  const finalStyles = {
    borderStyle: 'solid',
    borderColor: bgColor,
    backgroundColor: bgColor,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)', 
    ...style,
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: .9 }}
      className='SMButton'
      onClick={onClick}
      style={{ ...finalStyles }}>
      <SMText style={ { color } }>
        {text}
      </SMText>
    </motion.button>
  );
};
