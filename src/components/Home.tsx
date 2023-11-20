import React from 'react';
import { Text } from './custom/Text';

export const Home: React.FC = () => {

  return (
    <div style={ styles.container }>
      <Text type={'default'}>Hello World</Text>
    </div>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
} as const;