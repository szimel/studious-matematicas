import React from 'react';
import { motion } from 'framer-motion';

interface BouncyTextProps {
  style?: React.CSSProperties;
  children: React.ReactNode;
  onClick?: () => void;
}

const BouncyText: React.FC<BouncyTextProps> = ({ children, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.1 }} // Scale up when hovered
      whileTap={{ scale: .9 }} // Scale up when pressed
      onClick={onClick}
      style={{ cursor: 'pointer', display: 'inline-block', color: 'white', marginBottom: 10 }} 
    >
      {children}
    </motion.div>
  );
};

export default BouncyText;
