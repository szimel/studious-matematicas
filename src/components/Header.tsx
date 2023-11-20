import React from 'react';

export const Header: React.FC = () => {

  return (
    <div style={ styles.container }>
      idk man
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: '10px 20px',
    flexDirection: 'row',
    alignItems: 'center',
  },
} as const; 