import React from 'react';
import { motion } from 'framer-motion';
import { SMText } from './Text';

interface CircleItemProps {
  text: string;
  color: string;
  isExpanded: boolean;
  onClick: () => void;
  styles?: React.CSSProperties;
}

export const CircleItem: React.FC<CircleItemProps> = (props) => {
  const { text, color, isExpanded, onClick, styles } = props;

  return (
    <motion.div 
      style={{ ...styles }}
      onClick={onClick}
      animate={{
        backgroundColor: isExpanded ? color : 'transparent',
        padding: isExpanded ? '20px 15px' : '10px 10px',
        scale: isExpanded ? 1.2 : 1,
      }}
    >
      <SMText type='default'>{text}</SMText>
    </motion.div>
  );
};
