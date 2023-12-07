import React, { useEffect, useState } from 'react';
import '../../css/set-theory.css';
import { SMText } from '../custom/Text';
import { useNavigate } from 'react-router-dom';
import BouncyText from '../custom/BouncyText';
import { CircleItem } from '../custom/AnimatedCircle';
import { AnimateCircles } from '../helpers/set-theory/VennDiagram';
import { VennStateType } from './SetTheory';
import { useVennDiagramHighlighter } from '../helpers/set-theory/useVennDiagramHighlighter';
import Tippy from '@tippyjs/react';

export const Tutorial: React.FC = () => {
  const navigate = useNavigate();
  const [expandedItem, setExpandedItem] = useState('Union');
  const [showFirstTooltip, setShowFirstTooltip] = useState(true);

  //empty venn diagram data
  const diagramStyles = useVennDiagramHighlighter('(A ∪ B ∪ C)\'');
  const initialState: VennStateType = {
    solution: diagramStyles,
    inputValue: '', // Initialize with an empty string or some default value
  };
  const [vennData, setVennData] = useState<VennStateType>(initialState);

  // set expandedItem to clicked div
  const handleItemClick = (item: string) => {
    setExpandedItem(item);
  };


  const handleBackPressed = () => {
    navigate('/set-theory');
  };

  return (
    <div className='st-container'>
      <div className='st-box'>
        <BouncyText onClick={handleBackPressed}><u>{'<-'}Back</u></BouncyText>
        <div style={ styles.tutorialContainer }>
          <Tippy trigger="click" placement='bottom' 
            content={
              <>
                <SMText color='black' type='default'>
        The union of two sets is all the elements which are in either set, denoted by the symbol ∪.
                </SMText>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                  <SMText color='black' type='default'>
                    <u style={{ color: 'black' }}>A ∪ B</u>
                  </SMText>
                  <SMText color='black' type='default'>
                    <u style={{ color: 'black' }}>A ∪ C</u>
                  </SMText>
                  <SMText color='black' type='default'>
                    <u style={{ color: 'black' }}>B ∪ C</u>
                  </SMText>
                </div>
              </>
            }
            hideOnClick={true}
          >
            <div style={{ borderRadius: 40, }}>
              <CircleItem
                color='#e56b6f'
                styles={ styles.hoverButton}
                text="Union" 
                isExpanded={expandedItem === 'Union'} 
                onClick={() => handleItemClick('Union')}/>
            </div>
            
          </Tippy>
          <CircleItem
            color='#b56576'
            styles={ styles.hoverButton }
            text="Intersection" 
            isExpanded={expandedItem === 'Intersection'} 
            onClick={() => handleItemClick('Intersection')} 
          />
          <CircleItem
            color='#6d597a'
            styles={ styles.hoverButton }
            text="Compliment" 
            isExpanded={expandedItem === 'Compliment'} 
            onClick={() => handleItemClick('Compliment')} 
          />
        </div>
        <div>
          <AnimateCircles {...vennData}/>
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