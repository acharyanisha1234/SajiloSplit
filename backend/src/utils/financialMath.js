/**
 * SajiloSplit Financial Precision Engine
 * Prevents floating point errors by storing and computing values in integer subunits (Paisa/Cents).
 */

export class FinancialMath {
  /**
   * Converts a major currency unit (Rupees) to integer subunits (Paisa).
   * @param {number|string} amount
   * @returns {number} Integer paisa
   */
  static toPaisa(amount) {
    const parsed = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(parsed)) return 0;
    return Math.round(parsed * 100);
  }

  /**
   * Converts integer subunits (Paisa) back to major currency unit (Rupees).
   * @param {number} paisa
   * @returns {string} Formatted decimal string with 2 decimal places
   */
  static toRupees(paisa) {
    if (typeof paisa !== 'number' || isNaN(paisa)) return '0.00';
    return (paisa / 100).toFixed(2);
  }

  /**
   * Calculates deterministic split distributions using zero-loss remainder distribution.
   * 
   * @param {number|string} totalAmount Total bill amount in major currency
   * @param {Array<string>} participantIds Array of user/participant IDs
   * @param {'EQUAL'|'PERCENTAGE'|'EXACT'} splitType
   * @param {Object} [customValues] Object mapping participantId to percentage or exact amount
   * @returns {Object<string, number>} Object mapping participantId to allocated paisa
   */
  static calculateSplit(totalAmount, participantIds, splitType = 'EQUAL', customValues = {}) {
    const totalPaisa = this.toPaisa(totalAmount);
    const count = participantIds.length;
    const allocations = {};

    if (count === 0) return allocations;

    if (splitType === 'EQUAL') {
      const baseShare = Math.floor(totalPaisa / count);
      let remainder = totalPaisa - (baseShare * count);

      participantIds.forEach((id, index) => {
        // Distribute remainder 1 paisa at a time in deterministic order
        const extra = index < remainder ? 1 : 0;
        allocations[id] = baseShare + extra;
      });
    } else if (splitType === 'PERCENTAGE') {
      let allocatedTotal = 0;
      
      participantIds.forEach((id, index) => {
        if (index === count - 1) {
          // Last participant gets the exact remaining paisa to guarantee sum equality
          allocations[id] = totalPaisa - allocatedTotal;
        } else {
          const percentage = customValues[id] || 0;
          const share = Math.floor(totalPaisa * (percentage / 100));
          allocations[id] = share;
          allocatedTotal += share;
        }
      });
    } else if (splitType === 'EXACT') {
      let allocatedTotal = 0;
      participantIds.forEach((id) => {
        const exactPaisa = this.toPaisa(customValues[id] || 0);
        allocations[id] = exactPaisa;
        allocatedTotal += exactPaisa;
      });

      if (allocatedTotal !== totalPaisa) {
        throw new Error(`Exact split sum (${this.toRupees(allocatedTotal)}) does not match total amount (${this.toRupees(totalPaisa)}).`);
      }
    }

    return allocations;
  }
}