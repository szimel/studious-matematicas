import React from 'react';

interface PDTextProps extends React.HTMLProps<HTMLDivElement> {
  type?: 'default' | 'tooltip';
  color?: 'black' | 'white';
  style?: React.CSSProperties; 
}


export const SMText: React.FC<PDTextProps> = (props) => {
  const { type = 'default', color, style, children, ...restProps } = props;

  // Determine the preset style based on the type
  const defaultStyles = textStyles[type];

  // Combine preset styles with custom styles and other properties
  const finalStyles = {
    ...defaultStyles,
    color: color,
    ...style,
  };

  return (
    <div style={finalStyles} {...restProps}>
      {children}
    </div>
  );
};

const textStyles = {
  default: {
    fontFamily: 'RobotoMono',
    fontWeight: 400,
    lineHeight: '21px',
    fontSize: '18px',
  },
  tooltip: {
    fontFamily: 'RobotoMono-Regular',
    fontWeight: 400,
    lineHeight: '21px',
    fontSize: '14px',
  },
};