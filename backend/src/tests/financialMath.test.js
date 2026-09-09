// tests/financialMath.test.js
import { FinancialMath } from '../src/utils/financialMath.js';

describe('FinancialMath Precision Engine', () => {
  describe('Unit Conversions (Rupees <-> Paisa)', () => {
    test('converts rupees to integer paisa accurately', () => {
      expect(FinancialMath.toPaisa(100.5)).toBe(10050);
      expect(FinancialMath.toPaisa('49.99')).toBe(4999);
      expect(FinancialMath.toPaisa(0)).toBe(0);
    });

    test('handles floating-point inaccuracies during conversion', () => {
      // Standard JS: 19.99 * 100 = 1998.9999999999998
      expect(FinancialMath.toPaisa(19.99)).toBe(1999);
    });

    test('converts paisa to formatted rupees string', () => {
      expect(FinancialMath.toRupees(10050)).toBe('100.50');
      expect(FinancialMath.toRupees(4999)).toBe('49.99');
      expect(FinancialMath.toRupees(0)).toBe('0.00');
    });
  });

  describe('Equal Splits', () => {
    test('splits evenly without remainders', () => {
      const participants = ['userA', 'userB', 'userC'];
      const splits = FinancialMath.calculateSplit(300, participants, 'EQUAL');

      expect(splits).toEqual({
        userA: 10000,
        userB: 10000,
        userC: 10000,
      });
    });

    test('distributes 1-paisa remainders deterministically across odd totals', () => {
      // Rs. 100 split among 3 people -> 10000 paisa / 3 = 3333 paisa each + 1 paisa remainder
      const participants = ['userA', 'userB', 'userC'];
      const splits = FinancialMath.calculateSplit(100, participants, 'EQUAL');

      expect(splits).toEqual({
        userA: 3334, // Gets 1 paisa remainder
        userB: 3333,
        userC: 3333,
      });

      // Total distributed must exactly equal 10000 paisa
      const totalAllocated = Object.values(splits).reduce((a, b) => a + b, 0);
      expect(totalAllocated).toBe(10000);
    });

    test('handles equal split with 2-paisa remainder', () => {
      // Rs. 100.01 = 10001 paisa split among 3 people -> 3333 base + 2 paisa remainder
      const participants = ['userA', 'userB', 'userC'];
      const splits = FinancialMath.calculateSplit(100.01, participants, 'EQUAL');

      expect(splits).toEqual({
        userA: 3334,
        userB: 3334,
        userC: 3333,
      });

      const totalAllocated = Object.values(splits).reduce((a, b) => a + b, 0);
      expect(totalAllocated).toBe(10001);
    });
  });

  describe('Percentage Splits', () => {
    test('calculates correct share based on percentages', () => {
      const participants = ['userA', 'userB'];
      const customValues = { userA: 60, userB: 40 };
      const splits = FinancialMath.calculateSplit(250, participants, 'PERCENTAGE', customValues);

      expect(splits).toEqual({
        userA: 15000, // 60% of 25000 paisa
        userB: 10000, // 40% of 25000 paisa
      });
    });

    test('ensures zero loss on repeating percentage splits', () => {
      // 33.33%, 33.33%, 33.34% on Rs. 100
      const participants = ['userA', 'userB', 'userC'];
      const customValues = { userA: 33.33, userB: 33.33, userC: 33.34 };
      const splits = FinancialMath.calculateSplit(100, participants, 'PERCENTAGE', customValues);

      expect(splits).toEqual({
        userA: 3333,
        userB: 3333,
        userC: 3334, // Final participant absorbs residual paisa
      });

      const totalAllocated = Object.values(splits).reduce((a, b) => a + b, 0);
      expect(totalAllocated).toBe(10000);
    });
  });

  describe('Exact Splits & Edge Cases', () => {
    test('validates exact split matching total amount', () => {
      const participants = ['userA', 'userB'];
      const customValues = { userA: 40.50, userB: 59.50 };
      const splits = FinancialMath.calculateSplit(100, participants, 'EXACT', customValues);

      expect(splits).toEqual({
        userA: 4050,
        userB: 5950,
      });
    });

    test('throws error if exact split sum does not match total amount', () => {
      const participants = ['userA', 'userB'];
      const customValues = { userA: 40, userB: 50 }; // Sum = 90, Total = 100

      expect(() => {
        FinancialMath.calculateSplit(100, participants, 'EXACT', customValues);
      }).toThrow('Exact split sum (90.00) does not match total amount (100.00).');
    });

    test('handles empty participants list gracefully', () => {
      const splits = FinancialMath.calculateSplit(100, [], 'EQUAL');
      expect(splits).toEqual({});
    });

    test('handles zero total amount gracefully', () => {
      const participants = ['userA', 'userB'];
      const splits = FinancialMath.calculateSplit(0, participants, 'EQUAL');

      expect(splits).toEqual({
        userA: 0,
        userB: 0,
      });
    });
  });
});