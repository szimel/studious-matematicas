/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import '../../css/set-theory.css';
import { SMText } from '../custom/Text';
import { useNavigate } from 'react-router-dom';
import BouncyText from '../custom/BouncyText';
import { CircleItem } from '../custom/AnimatedCircle';
import { AnimateCircles } from '../helpers/set-theory/VennDiagram';
import Tippy from '@tippyjs/react';
import { AppContext } from '../Context';

export const Tutorial: React.FC = () => {
  const { updateVennData } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('None'); // for circle item expansion
  const [showTippy, setShowTippy] = useState('None'); // for tippy visibility

  const handleItemClick = (item: string) => {
    setExpandedItem(item);
  };

  const handleTippyTextClick = (item: string) => () => {
    updateVennData(item);
    setExpandedItem('None');
  };

  // hack for tippy incorrectly displaying on page load
  useEffect(() => {
    setTimeout(() => {
      setExpandedItem('Union');
    }, 650);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setShowTippy(expandedItem);
    }, 200);
  }, [expandedItem]);

  return (
    <div className='st-container'>
      <div className='st-box'>
        <BouncyText onClick={() => navigate('/set-theory')}><u>{'<-'}Back</u></BouncyText>
        <div style={ styles.tutorialContainer }>
          <Tippy trigger="click" placement='bottom' interactive={true} visible={showTippy === 'Union'} onClickOutside={() => setExpandedItem('None') }
            content={
              <>
                <SMText color='black' type='default'> 
A union is every distinct element in both sets. <br/>Set A = [1, 2, 3] <br/>Set B = [2, 3, 4] <br/>A ∪ B = [1, 2, 3, 4]         
                </SMText>
                <SMText color='black' >Visual Representation: </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('A ∪ B')}>
                    <u style={{ color: 'black' }}>A ∪ B</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('A ∪ C')}>
                    <u style={{ color: 'black' }}>A ∪ C</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('B ∪ C')}>
                    <u style={{ color: 'black' }}>B ∪ C</u>
                  </SMText>
                </div>
              </>
            }
          >
            <div style={{ borderRadius: 40 }}>
              <CircleItem
                color='#e56b6f'
                styles={ styles.hoverButton}
                text="Union" 
                isExpanded={expandedItem === 'Union'} 
                onClick={() => handleItemClick('Union')}/>
            </div>
          </Tippy>
          <Tippy trigger="click" placement='bottom' interactive={true} visible={showTippy === 'Intersection'} onClickOutside={() => setExpandedItem('None')}
            content={
              <>
                <SMText color='black' style={{ cursor: 'pointer' }} >
                  An intersection is every element that is in both sets.<br/>Set A = [1, 2, 3] <br/>Set B = [2, 3, 4] <br/>A ∩ B = [2, 3]<br/> Visual Representation:
                </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('A ∩ B')}>
                    <u style={{ color: 'black' }}>A ∩ B</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('A ∩ C')}>
                    <u style={{ color: 'black' }}>A ∩ C</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('B ∩ C')}>
                    <u style={{ color: 'black' }}>B ∩ C</u>
                  </SMText>
                </div>
              </>
            }>
            <div style={{ borderRadius: 40 }}>
              <CircleItem
                color='#b56576'
                styles={ styles.hoverButton }
                text="Intersection" 
                isExpanded={expandedItem === 'Intersection'} 
                onClick={() => handleItemClick('Intersection')} 
              />
            </div>
          </Tippy>
          <Tippy trigger="click" placement='bottom' interactive={true} visible={showTippy === 'Compliment'} onClickOutside={() => setShowTippy('None')}
            content={
              <>
                <SMText color='black' style={{ cursor: 'pointer' }} >
                  A compliment is every element in the first set that is not in the second set.<br/>Set A = [1, 2, 3]
                  <br/>Set B = [2, 3, 4] <br/>Set C = [3, 4, 5]<br/>A{'\''} = [4, 5]<br/> Visual Representation:
                </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('A\'')}>
                    <u style={{ color: 'black' }}>A&apos;</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('B\'')}>
                    <u style={{ color: 'black' }}>B&apos;</u>
                  </SMText>
                  <SMText color='black' style={{ cursor: 'pointer' }} onClick={handleTippyTextClick('C\'')}>
                    <u style={{ color: 'black' }}>C&apos;</u>
                  </SMText>
                </div>
              </>
            }>
            <div style={{ borderRadius: 40 }}>
              <CircleItem
                color='#6d597a'
                styles={ styles.hoverButton }
                text="Compliment" 
                isExpanded={expandedItem === 'Compliment'} 
                onClick={() => handleItemClick('Compliment')} 
              />
            </div>
          </Tippy>
        </div>
        <div>
          <AnimateCircles />
        </div>
      </div>
    </div>
  );
};
  
const styles = {
  tutorialContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    height: 65,
  },
  hoverButton: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 40,
    cursor: 'pointer',
  },
} as const;