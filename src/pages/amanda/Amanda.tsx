import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import '../../css/set-theory.css';
import '../../css/amanda.css';
import { AmandaFormValues, AmandaInputPanel } from '../../features/amanda/AmandaInputPanel';
import { AmandaResultsPanel } from '../../features/amanda/AmandaResultsPanel';
import { LoanComparisonResult, calculateLoanComparison } from '../../utils/amortization';

const defaultFormValues: AmandaFormValues = {
  principal: '',
  monthlyPayment: '',
  annualRatePercent: '',
  extraPayment: '',
};

const viewMotion = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.98 },
  transition: { duration: 0.36, ease: 'easeOut' },
};

export const Amanda: React.FC = () => {
  const [formValues, setFormValues] = useState<AmandaFormValues>(defaultFormValues);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<LoanComparisonResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const parseInputNumber = (rawValue: string): number => {
    const parsedValue = Number.parseFloat(rawValue);
    return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
  };

  const handleCalculate = () => {
    const principal = parseInputNumber(formValues.principal);
    const monthlyPayment = parseInputNumber(formValues.monthlyPayment);
    const annualRatePercent = parseInputNumber(formValues.annualRatePercent);
    const extraPayment = formValues.extraPayment.trim() === ''
      ? 0
      : parseInputNumber(formValues.extraPayment);

    try {
      const comparison = calculateLoanComparison({
        principal,
        monthlyPayment,
        annualRatePercent,
        extraPayment,
      });

      setResult(comparison);
      setErrorMessage('');
      setShowResults(true);

    } catch (error: unknown) {
      const fallbackMessage = 'Please check your values and try again.';
      const parsedError = error instanceof Error ? error.message : fallbackMessage;
      setErrorMessage(parsedError);
      setShowResults(false);
      setResult(null);
    }
  };

  const handleBackToInput = () => {
    setFormValues((previous) => ({
      ...previous,
      extraPayment: '',
    }));
    setShowResults(false);
    setErrorMessage('');
  };

  return (
    <div className='st-container amanda-root'>
      <div className='amanda-postcard' />
      <AnimatePresence mode='wait'>
        {!showResults && (
          <motion.div key='amanda-input' {...viewMotion}>
            <AmandaInputPanel
              values={formValues}
              onChange={handleInputChange}
              onCalculate={handleCalculate}
              errorMessage={errorMessage}
            />
          </motion.div>
        )}

        {showResults && result && (
          <motion.div key='amanda-results' {...viewMotion}>
            <AmandaResultsPanel result={result} onBack={handleBackToInput} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
