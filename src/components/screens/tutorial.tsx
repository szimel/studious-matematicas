/* eslint-disable max-len */
import React from 'react';
import '../../css/set-theory.css';
import { SMText } from '../custom/Text';
import { useNavigate } from 'react-router-dom';
import BouncyText from '../custom/BouncyText';

export const Tutorial: React.FC = () => {
  const navigate = useNavigate();

  const handleBackPressed = () => {
    navigate('/set-theory');
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <BouncyText onClick={handleBackPressed}><u>{'<-'}Back</u></BouncyText>
        <h1>Set Theory Tutorial</h1>
      
        <section>
          <h2>Overview of Set Theory</h2>
          <p>Set theory is a branch of mathematical logic that studies sets, which are collections of objects...</p>
        </section>
      
        <section>
          <h2>Unions</h2>
          <p>
            A union in set theory is a new set that contains all elements that are in at least one of two sets...
          </p>
        </section>
      
        <section>
          <h2>Intersections</h2>
          <p>An intersection in set theory is a new set that contains all elements that are in both sets...</p>
        </section>
      
        <section>
          <h2>Complements</h2>
          <p>A complement in set theory is a set of all elements in the universal set that are not in a given set...</p>
        </section>
      
        <section>
          <h2>Using the Set Theory Page</h2>
          <p>On the set theory page, you can visualize the concepts of unions, intersections, and complements. You can create sets by entering elements and apply operations to see the result...</p>
        </section>
      </div>
    </div>
  );
};