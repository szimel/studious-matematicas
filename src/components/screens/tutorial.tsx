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
import { SMButton } from '../custom/Button';

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
        <BouncyText onClick={() => navigate('/set-theory')}><u className='noSelect'>{'<-'}Back</u></BouncyText>
        <div className='toolTipContainer'>
          <Tippy trigger="click" placement='bottom' interactive={true} visible={showTippy === 'Union'} onClickOutside={() => setExpandedItem('None') }
            content={
              <div style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
                <SMText color='black' type='default'> 
A union is every distinct element in both sets. <br/>Set A = [1, 2, 3] <br/>Set B = [2, 3, 4] <br/>A ∪ B = [1, 2, 3, 4]         
                </SMText>
                <SMText color='black' >Visual Representation: </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMButton color='white' bgColor='black'onClick={handleTippyTextClick('A ∪ B')} text='A ∪ B'/>
                  <SMButton color='white' bgColor='#e56b6f' onClick={handleTippyTextClick('A ∪ C')} text='A ∪ C' />
                  <SMButton color='white' bgColor='#e56b6f' onClick={handleTippyTextClick('B ∪ C')} text='B ∪ C' />
                </div>
              </div>
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
              <div style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
                <SMText color='black' style={{ cursor: 'pointer' }} >
                  An intersection is every element that is in both sets.<br/>Set A = [1, 2, 3] <br/>Set B = [2, 3, 4] <br/>A ∩ B = [2, 3]
                </SMText>
                <SMText color='black' >Visual Representation: </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMButton color='white' bgColor='#b56576' onClick={handleTippyTextClick('A ∩ B')} text='A ∩ B' />
                  <SMButton color='white' bgColor='#b56576' onClick={handleTippyTextClick('A ∩ C')} text='A ∩ C' />
                  <SMButton color='white' bgColor='#b56576' onClick={handleTippyTextClick('B ∩ C')} text='B ∩ C' />
                </div>
              </div>
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
          <Tippy trigger="click" placement='bottom' interactive={true} visible={showTippy === 'Compliment'} onClickOutside={() => setExpandedItem('None')}
            content={
              <div style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
                <SMText color='black' style={{ cursor: 'pointer' }} >
                  A compliment is every element in the first set that is not in the second set.<br/>Set A = [1, 2, 3]
                  <br/>Set B = [2, 3, 4] <br/>Set C = [3, 4, 5]<br/>A{'\''} = [4, 5]
                </SMText>
                <SMText color='black' >Visual Representation: </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMButton color='white' bgColor='#6d597a' onClick={handleTippyTextClick('A\'')} text="A'" />
                  <SMButton color='white' bgColor='#6d597a' onClick={handleTippyTextClick('B\'')} text="B'" />
                  <SMButton color='white' bgColor='#6d597a' onClick={handleTippyTextClick('C\'')} text="C'" />
                </div>
              </div>
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
  hoverButton: {
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 40,
    cursor: 'pointer',
    color: 'white',
  },
} as const;