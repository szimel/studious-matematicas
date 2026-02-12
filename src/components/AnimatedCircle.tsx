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
  // Define transition properties
  const transition = {
    type: 'spring', 
    stiffness: 260,
    damping: 20,
    duration: 0.5 
  };

  return (
    <motion.div 
      style={{ ...styles }}
      onClick={onClick}
      animate={{
        backgroundColor: isExpanded ? color : 'rgba(0, 0, 0, 0.01)',
        padding: isExpanded ? '20px 15px' : '10px 10px',
        scale: isExpanded ? 1.1 : 1,
      }}
      transition={transition}
    >
      <SMText type='default'>{text}</SMText>
    </motion.div>
  );
};
