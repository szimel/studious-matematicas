import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

interface AnimatedRouteProps {
  children: ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: -250,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
  },
};

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
  mass: 1.5,
};

export const AnimatedRoute: React.FC<AnimatedRouteProps> = ({ children }) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      initial={pageVariants.initial}
      animate={pageVariants.in}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
};


AnimatedRoute.propTypes = {
  // eslint-disable-next-line
  children: PropTypes.node.isRequired as any,
};

