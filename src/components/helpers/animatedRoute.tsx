import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';


interface AnimatedRouteProps {
  children: React.ReactNode;
}


const pageVariants = {
  initial: {
    opacity: 0,
    x: -250, 
    // scale: 0.85
  },
  in: {
    opacity: 1,
    x: 0, 
    scale: 1 
  },
};


const pageTransition = {
  type: 'spring',
  stiffness: 300, // controls the stiffness of the spring
  damping: 25, // controls how the spring slows down
  mass: 1.5, // mass of the moving object
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
  children: PropTypes.node.isRequired
};
