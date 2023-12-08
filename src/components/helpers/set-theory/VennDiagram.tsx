/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VennDiagram } from '@upsetjs/venn.js';
import { SMText } from '../../custom/Text';
import { AppContext } from '../../Context';

const colors = [
  '#eaac8b',
  '#e56b6f',
  '#b56576',
  '#6d597a',
  '#355070',
  '#355070',
  '#6d597a',
  '#b56576',
  '#e56b6f',
  '#eaac8b',
];

const sets = [
  { sets: ['B'], size: 14 },
  { sets: ['C'], size: 14 },
  { sets: ['A'], size: 14 },
  { sets: ['A','B'], size: 4 },
  { sets: ['A', 'C'], size: 4 },
  { sets: ['B', 'C'], size: 4 },
  { sets: ['A', 'B', 'C'], size: 1 },
];

export const AnimateCircles: React.FC = () => {
  const { vennData } = useContext(AppContext);
  const vennRef = useRef(null);
  const [colorIndex, setColorIndex] = useState(0);

  // Destructure the data from the context
  const { solution, inputValue } = vennData;

  //dynamic sizing for venn diagram
  useEffect(() => {
    const handleResize = () => {
      const WW =  window.innerWidth; 
      const width = WW < 950 ? WW - 150 : 600;
      const height = WW < 800 ? WW/2 : 400;
      
      // Update the Venn diagram's size
      const chart = VennDiagram()
        .width(width)
        .height(height);
      d3.select(vennRef.current)
        .datum(sets)
        // eslint-disable-next-line
        .call(chart as any);
      // Apply the initial static styles
      d3.select(vennRef.current).selectAll('path')
        .style('fill-opacity', 1)
        .style('stroke-width', 1)
        .style('fill', 'rgb(25, 26, 30)')
        .style('stroke', 'white');
          
      d3.select(vennRef.current).selectAll('text')
        .style('fill', 'white');
    };
  
    // Initial draw
    handleResize();
  
    // Add resize event listener
    window.addEventListener('resize', handleResize);
  
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


  // animates the sections
  useEffect(() => {
    if (vennRef.current) {
      // Inside the useEffect for animating sections
      d3.select(vennRef.current).selectAll('path')
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .style('fill', function(d: any) {
          // Adjust the setIdentifier to match the set names within solution
          const setIdentifier = 'set' + d.sets.sort().join('Union');          
          if (solution[setIdentifier] === true) {
            return colors[colorIndex]; 
          } else {
            return 'rgb(25, 26, 30)'; // Default color
          }
        });
    }
    const intervalId = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
    }, 1500);

    return () => clearInterval(intervalId);
  }, [colorIndex, solution]); // Rerun when colorIndex or styles change

  return (
    <div className='VDContainer'>
      <SMText style={{ color: 'white', fontSize: 22, height: 22, }}>{inputValue}</SMText>
      <div id='svg' ref={vennRef} />
    </div>
  );
};