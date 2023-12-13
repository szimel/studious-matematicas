import React from 'react';
import { SMText } from './Text';
import { motion } from 'framer-motion';


interface SMButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: string;
  bgColor?: string;
  style?: React.CSSProperties; 
  onClick?: () => void;
  text: string;
}

export const SMButton: React.FC<SMButtonProps> = (props) => {
  const { color, style, text, bgColor, onClick, ...restProps } = props;

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
      onClick={onClick}
      className='SMButton'
      style={{ ...finalStyles }}>
      <SMText style={ { color } }>
        {text}
      </SMText>
    </motion.button>
  );
};
