/**
 * Calculates the monthly payment for a loan
 * @param {number} principal - The loan amount
 * @param {number} interestRate - Annual interest rate (in percentage)
 * @param {number} termYears - Loan term in years
 * @returns {number} Monthly payment amount
 */
export const calculateLoanPayment = (principal, interestRate, termYears) => {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    
    if (monthlyRate === 0) {
      return principal / totalPayments;
    }
    
    const payment = principal * monthlyRate * Math.pow(1 + monthlyRate, totalPayments) / 
                    (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    return parseFloat(payment.toFixed(2));
  };
  
  /**
   * Calculates the future value of an investment
   * @param {number} principal - Initial investment amount
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} interestRate - Annual interest rate (in percentage)
   * @param {number} years - Number of years
   * @returns {number} Future value
   */
  export const calculateFutureValue = (principal, monthlyContribution, interestRate, years) => {
    const monthlyRate = interestRate / 100 / 12;
    const months = years * 12;
    
    // Future value of the principal
    const principalFV = principal * Math.pow(1 + monthlyRate, months);
    
    // Future value of the monthly contributions
    let contributionFV = 0;
    if (monthlyRate > 0) {
      contributionFV = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    } else {
      contributionFV = monthlyContribution * months;
    }
    
    return parseFloat((principalFV + contributionFV).toFixed(2));
  };
  
  /**
   * Calculates the savings rate
   * @param {number} income - Total income
   * @param {number} expenses - Total expenses
   * @returns {number} Savings rate as a percentage
   */
  export const calculateSavingsRate = (income, expenses) => {
    if (income === 0) return 0;
    
    const savings = income - expenses;
    const savingsRate = (savings / income) * 100;
    
    return parseFloat(savingsRate.toFixed(2));
  };
  
  /**
   * Formats a number as a currency string
   * @param {number} value - Number to format
   * @param {string} currencyCode - Currency code (default: 'USD')
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (value, currencyCode = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  };
  
  /**
   * Calculates the number of months to reach a financial goal
   * @param {number} targetAmount - Target amount to reach
   * @param {number} currentAmount - Current amount saved
   * @param {number} monthlyContribution - Monthly contribution amount
   * @param {number} interestRate - Annual interest rate (in percentage)
   * @returns {number} Number of months needed
   */
  export const calculateMonthsToGoal = (targetAmount, currentAmount, monthlyContribution, interestRate) => {
    if (targetAmount <= currentAmount) return 0;
    if (monthlyContribution <= 0 && interestRate <= 0) return Infinity;
    
    const monthlyRate = interestRate / 100 / 12;
    
    // If no interest, simple division
    if (monthlyRate === 0) {
      return Math.ceil((targetAmount - currentAmount) / monthlyContribution);
    }
    
    // With interest, use logarithmic formula
    const months = Math.log(
      (monthlyContribution + (monthlyRate * targetAmount)) / 
      (monthlyContribution + (monthlyRate * currentAmount))
    ) / Math.log(1 + monthlyRate);
    
    return Math.ceil(months);
  };
  
  /**
   * Generates categorical spending data for reporting
   * @param {Array} transactions - Array of transaction objects
   * @returns {Object} Object with spending by category
   */
  export const getSpendingByCategory = (transactions) => {
    const categoryTotals = transactions.reduce((acc, transaction) => {
      if (transaction.amount < 0) { // Only count expenses
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
      }
      return acc;
    }, {});
    
    return categoryTotals;
  };
  
  /**
   * Calculates the net worth
   * @param {Array} assets - Array of asset objects with value property
   * @param {Array} liabilities - Array of liability objects with value property
   * @returns {number} Net worth
   */
  export const calculateNetWorth = (assets, liabilities) => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    
    return parseFloat((totalAssets - totalLiabilities).toFixed(2));
  };