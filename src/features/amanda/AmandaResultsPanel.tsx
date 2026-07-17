import React, { useMemo } from 'react';
import { AmandaLoanChart } from './AmandaLoanChart';
import { MaineLobster, MaineButterfly } from './AmandaThemeMotifs';
import { LoanComparisonResult } from '../../utils/amortization';

interface AmandaResultsPanelProps {
  result: LoanComparisonResult;
  onBack: () => void;
}


const toCurrency = (value: number): string => (
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
);

const toDurationLabel = (months: number): string => {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} months`;
  }

  if (remainingMonths === 0) {
    return `${years} years`;
  }

  return `${years} years ${remainingMonths} months`;
};

export const AmandaResultsPanel: React.FC<AmandaResultsPanelProps> = ({ result, onBack }) => {
  const baselineMonths = result.baseline.payoffMonths;
  const acceleratedMonths = result.accelerated.payoffMonths;

  const accelerationPercent = useMemo(() => {
    if (baselineMonths === 0) {
      return 0;
    }

    return Math.max(0, (result.monthsSaved / baselineMonths) * 100);
  }, [baselineMonths, result.monthsSaved]);

  const interestReductionPercent = useMemo(() => {
    if (result.baseline.totalInterest === 0) {
      return 0;
    }

    return Math.max(0, (result.interestSaved / result.baseline.totalInterest) * 100);
  }, [result.baseline.totalInterest, result.interestSaved]);

  return (
    <section className='amanda-results-panel'>
      <header className='amanda-results-header'>
        <div className='amanda-results-title-group'>
          <h2 className='amanda-results-title'>How much your extra payment helps</h2>
        </div>
        <button type='button' className='amanda-back-button' onClick={onBack}>
          Back to Inputs
        </button>
      </header>

      <div className='amanda-summary-band'>
        <article className='amanda-stat-card'>
          <div className='amanda-stat-icon'><MaineButterfly size={28} /></div>
          <p>Time Saved</p>
          <strong>{toDurationLabel(result.monthsSaved)}</strong>
          <small>{accelerationPercent.toFixed(1)}% faster payoff</small>
        </article>

        <article className='amanda-stat-card'>
          <div className='amanda-stat-icon'><MaineLobster size={28} /></div>
          <p>Interest Saved</p>
          <strong>{toCurrency(result.interestSaved)}</strong>
          <small>{interestReductionPercent.toFixed(1)}% less interest</small>
        </article>

        <article className='amanda-stat-card'>
          <p>Total Paid Difference</p>
          <strong>{toCurrency(result.totalPaidSaved)}</strong>
          <small>Compared to baseline</small>
        </article>
      </div>

      <div className='amanda-chart-panel'>
        <AmandaLoanChart
          baselineSchedule={result.baseline.schedule}
          acceleratedSchedule={result.accelerated.schedule}
          extraPerMonth={result.extraPerMonth}
        />
      </div>

      <div className='amanda-detail-grid'>
        <article className='amanda-detail-card'>
          <h3>Baseline Loan</h3>
          <p>Payoff Time: <strong>{toDurationLabel(baselineMonths)}</strong></p>
          <p>Total Interest: <strong>{toCurrency(result.baseline.totalInterest)}</strong></p>
          <p>Total Paid: <strong>{toCurrency(result.baseline.totalPaid)}</strong></p>
        </article>

        <article className='amanda-detail-card amanda-detail-card-accent'>
          <h3>With Additional Payment</h3>
          <p>Payoff Time: <strong>{toDurationLabel(acceleratedMonths)}</strong></p>
          <p>Total Interest: <strong>{toCurrency(result.accelerated.totalInterest)}</strong></p>
          <p>Total Paid: <strong>{toCurrency(result.accelerated.totalPaid)}</strong></p>
        </article>
      </div>
    </section>
  );
};
