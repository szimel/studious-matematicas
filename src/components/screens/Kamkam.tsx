import React from 'react';
import '../../css/kamkam.css';

// super complicated code I painstakingly spent hours writing
export const KamTest: React.FC = () => {
  const yourName = 'Samuel'; 
  const fianceName = 'Kamrie'; 

  return (
    <div className="test-results-container">
      <header className="test-header">
        <h1>Official Relationship Status Test Results</h1>
      </header>

      <section className="test-section administered-section">
        <h2>Test Administered: Do You Love {fianceName}?</h2>
        <p><strong>Test Subject:</strong> {yourName}</p>
      </section>

      <section className="test-section question-section">
        <h3>Question 1:</h3>
        <p>Do you love {fianceName} with all your heart?</p>
      </section>

      <section className="test-section answer-section">
        <h3>Answer:</h3>
        <div className="answer-box">
          <span className="checkbox">[X]</span>
          <span className="answer-text">
						YES, with every fiber of my being, completely and unconditionally.
          </span>
        </div>
      </section>

      <section className="test-section result-section">
        <h3>Result:</h3>
        <p className="pass-result">PASS! (Score: 100% - Off the Charts!)</p>
      </section>

      <section className="test-section analysis-section">
        <p className="analysis-note">
          <em>
						Analysis: Subject displays extreme levels of affection, devotion, and an 
						overwhelming desire to see {fianceName} immediately 
						(pending successful completion of covid test).
          </em>
        </p>
      </section>
    </div>
  );
};
