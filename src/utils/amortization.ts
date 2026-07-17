export interface LoanScenarioInput {
  principal: number;
  monthlyPayment: number;
  annualRatePercent: number;
  extraPayment?: number;
  maxMonths?: number;
}

export interface SchedulePoint {
  month: number;
  balance: number;
  payment: number;
  interestPortion: number;
  principalPortion: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface LoanScenarioResult {
  schedule: SchedulePoint[];
  payoffMonths: number;
  totalInterest: number;
  totalPaid: number;
  monthlyRate: number;
  paidOff: boolean;
}

export interface LoanComparisonResult {
  baseline: LoanScenarioResult;
  accelerated: LoanScenarioResult;
  monthsSaved: number;
  interestSaved: number;
  totalPaidSaved: number;
  extraPerMonth: number;
}

const MAX_DEFAULT_MONTHS = 1200; // 100 years, safety ceiling for runaway scenarios.
const BALANCE_EPSILON = 0.005;

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

export const annualPercentToMonthlyRate = (annualRatePercent: number): number => {
  const annualRateDecimal = annualRatePercent / 100;

  if (annualRateDecimal === 0) {
    return 0;
  }

  return Math.pow(1 + annualRateDecimal, 1 / 12) - 1;
};

export const validateLoanInputs = (input: LoanScenarioInput): string | null => {
  const { principal, monthlyPayment, annualRatePercent, extraPayment = 0 } = input;

  if (!Number.isFinite(principal) || principal <= 0) {
    return 'Debt amount must be a positive number.';
  }

  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return 'Monthly payment must be greater than zero.';
  }

  if (!Number.isFinite(annualRatePercent) || annualRatePercent < 0) {
    return 'Interest rate must be zero or a positive yearly percent.';
  }

  if (!Number.isFinite(extraPayment) || extraPayment < 0) {
    return 'Additional monthly payment cannot be negative.';
  }

  if (annualRatePercent >= 500) {
    return 'Interest rate is too large. Please enter a realistic yearly percentage.';
  }

  return null;
};

export const calculateLoanScenario = (input: LoanScenarioInput): LoanScenarioResult => {
  const validationError = validateLoanInputs(input);
  if (validationError) {
    throw new Error(validationError);
  }

  const {
    principal,
    monthlyPayment,
    annualRatePercent,
    extraPayment = 0,
    maxMonths = MAX_DEFAULT_MONTHS,
  } = input;

  const monthlyRate = annualPercentToMonthlyRate(annualRatePercent);
  const monthlyOutflow = monthlyPayment + extraPayment;

  if (monthlyOutflow <= 0) {
    throw new Error('Total monthly payment must be greater than zero.');
  }

  const openingMonthlyInterest = principal * monthlyRate;
  if (monthlyRate > 0 && monthlyOutflow <= openingMonthlyInterest + BALANCE_EPSILON) {
    throw new Error('Payment is too low to cover interest. Increase the monthly payment.');
  }

  let remainingBalance = principal;
  let month = 0;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let totalPaid = 0;

  const schedule: SchedulePoint[] = [{
    month: 0,
    balance: roundMoney(remainingBalance),
    payment: 0,
    interestPortion: 0,
    principalPortion: 0,
    cumulativeInterest: 0,
    cumulativePrincipal: 0,
  }];

  while (remainingBalance > BALANCE_EPSILON && month < maxMonths) {
    const rawInterest = remainingBalance * monthlyRate;
    const rawScheduledPayment = monthlyOutflow;
    const rawFinalPaymentCap = remainingBalance + rawInterest;
    const rawPayment = Math.min(rawScheduledPayment, rawFinalPaymentCap);
    const rawPrincipalPortion = rawPayment - rawInterest;

    if (rawPrincipalPortion <= 0) {
      throw new Error('Payment does not reduce principal. Increase payment or lower interest rate.');
    }

    const interestPortion = roundMoney(rawInterest);
    const payment = roundMoney(rawPayment);
    const principalPortion = roundMoney(Math.min(rawPrincipalPortion, remainingBalance));

    cumulativeInterest = roundMoney(cumulativeInterest + interestPortion);
    cumulativePrincipal = roundMoney(cumulativePrincipal + principalPortion);
    totalPaid = roundMoney(totalPaid + payment);
    remainingBalance = roundMoney(Math.max(0, remainingBalance - principalPortion));

    month += 1;

    schedule.push({
      month,
      balance: remainingBalance,
      payment,
      interestPortion,
      principalPortion,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  const paidOff = remainingBalance <= BALANCE_EPSILON;

  if (!paidOff) {
    throw new Error('Loan did not pay off within the maximum month limit.');
  }

  return {
    schedule,
    payoffMonths: month,
    totalInterest: roundMoney(cumulativeInterest),
    totalPaid: roundMoney(totalPaid),
    monthlyRate,
    paidOff,
  };
};

export const calculateLoanComparison = (input: LoanScenarioInput): LoanComparisonResult => {
  const extraPerMonth = input.extraPayment ?? 0;

  const baseline = calculateLoanScenario({
    ...input,
    extraPayment: 0,
  });

  const accelerated = calculateLoanScenario({
    ...input,
    extraPayment: extraPerMonth,
  });

  const monthsSaved = Math.max(0, baseline.payoffMonths - accelerated.payoffMonths);
  const interestSaved = roundMoney(Math.max(0, baseline.totalInterest - accelerated.totalInterest));
  const totalPaidSaved = roundMoney(Math.max(0, baseline.totalPaid - accelerated.totalPaid));

  return {
    baseline,
    accelerated,
    monthsSaved,
    interestSaved,
    totalPaidSaved,
    extraPerMonth,
  };
};
