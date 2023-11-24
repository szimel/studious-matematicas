import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VennDiagram } from '@upsetjs/venn.js';

// Define a type for the styling data
type VennDiagramStyles = {
  [key: string]: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    animate?: boolean; // Determines if this part of the Venn diagram should be animated
  };
};

// Define a type for your component's props
type AnimateCirclesProps = {
  styles: VennDiagramStyles;
};

const colors = [
  'rgb(95, 106, 200)',
  'rgb(168, 109, 140)',
  'rgb(185, 117, 117)',
  'rgb(226, 162, 45)',
  'rgb(185, 117, 117)',
  'rgb(168, 109, 140)',
  'rgb(95, 106, 200)',
];

const sets = [
  { sets: ['B'], size: 14 },
  { sets: ['C'], size: 14 },
  { sets: ['A'], size: 14 },
  { sets: ['A','B'], size: 5 },
  { sets: ['A', 'C'], size: 5 },
  { sets: ['B', 'C'], size: 5 },
  { sets: ['A', 'B', 'C'], size: 1 },
];

export const AnimateCircles: React.FC<AnimateCirclesProps> = ({ styles }) => {
  const vennRef = useRef(null);
  const [colorIndex, setColorIndex] = useState(0);

  // Initial venn diagrams useEffect
  useEffect(() => {
    if (vennRef.current) {
      // Define and create the Venn diagram
      const chart = VennDiagram();
      d3.select(vennRef.current)
        .datum(sets)
        .call(chart as any);

      // Apply the initial static styles
      d3.select(vennRef.current).selectAll('path')
        .style('fill-opacity', 1)
        .style('stroke-width', 1)
        .style('fill', 'rgb(25, 26, 30)')
        .style('stroke', 'white');
      
      d3.select(vennRef.current).selectAll('text')
        .style('fill', 'white');
    }
  }, []); 

  // animates the sections
  useEffect(() => {
    if (vennRef.current) {
      // Update the colors for the segments that should be animated
      const chart = VennDiagram();
      d3.select(vennRef.current).selectAll('path')
        .transition() 
        .duration(2000) 
        .ease(d3.easeLinear) 
        .style('fill', function(d: any) {
          const setIdentifier = d.sets.sort().join('_');
          if (styles[setIdentifier]?.animate === true) {
            return colors[colorIndex]; // Apply the new color
          } else {return 'rgb(25, 26, 30)';} // Keep the existing color if not animating
        })
        .style('stroke', function(d: any) {
          const setIdentifier = d.sets.sort().join('_');
          if (styles[setIdentifier]?.animate === true) {
            return colors[colorIndex]; // Apply the new color
          } else {return 'white';} // otherwise put defualt color
        });

      d3.select(vennRef.current).selectAll('text')
        .style('fill', 'white');
    }
    const intervalId = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1500);

    return () => clearInterval(intervalId);
  }, [colorIndex, styles]); // Rerun this effect when colorIndex or styles change

  return (
    <div className='VDContainer'>
      <div ref={vennRef} />
    </div>
  );
};