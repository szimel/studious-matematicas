import React from 'react';
import { MainePineTree, MaineButterfly } from './AmandaThemeMotifs';

export interface AmandaFormValues {
  principal: string;
  monthlyPayment: string;
  annualRatePercent: string;
  extraPayment: string;
}

interface AmandaInputPanelProps {
  values: AmandaFormValues;
  errorMessage: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onCalculate: () => void;
}

export const AmandaInputPanel: React.FC<AmandaInputPanelProps> = ({
  values,
  errorMessage,
  onChange,
  onCalculate,
}) => (
  <section className='amanda-input-panel'>

    <div className='amanda-title-row'>
      <MainePineTree size={52} />
      <h1 className='amanda-title'>Amanda&apos;s Loan Cruncher</h1>
      <MaineButterfly size={52} />
    </div>
    <p className='amanda-subtitle'>
      Enter your debt details and compare classic payments against an extra monthly boost.
    </p>

    <div className='amanda-input-grid'>
      <label className='amanda-field'>
        <span>Amount of debt ($)</span>
        <input
          name='principal'
          type='number'
          min='0'
          step='0.01'
          placeholder='25000'
          value={values.principal}
          onChange={onChange}
        />
      </label>

      <label className='amanda-field'>
        <span>Monthly payment ($)</span>
        <input
          name='monthlyPayment'
          type='number'
          min='0'
          step='0.01'
          placeholder='550'
          value={values.monthlyPayment}
          onChange={onChange}
        />
      </label>

      <label className='amanda-field'>
        <span>Yearly interest rate (%)</span>
        <input
          name='annualRatePercent'
          type='number'
          min='0'
          step='0.01'
          placeholder='6'
          value={values.annualRatePercent}
          onChange={onChange}
        />
      </label>

      <label className='amanda-field'>
        <span>Additional monthly payment ($ optional)</span>
        <input
          name='extraPayment'
          type='number'
          min='0'
          step='0.01'
          placeholder='100'
          value={values.extraPayment}
          onChange={onChange}
        />
      </label>
    </div>

    {errorMessage && <p className='amanda-error'>{errorMessage}</p>}

    <div className='amanda-cta-row'>
      <button type='button' className='amanda-calc-button' onClick={onCalculate}>
        Calculate
      </button>
      <p className='amanda-helper-copy'>
        Extra payment can be blank or zero and the calculator will still run.
      </p>
    </div>
  </section>
);
