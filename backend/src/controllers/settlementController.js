import mongoose from 'mongoose';
import { FinancialMath } from '../utils/financialMath.js';

export const processSettlement = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { payerId, payeeId, amount, groupId } = req.body;
    const paisaAmount = FinancialMath.toPaisa(amount);

    if (paisaAmount <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Settlement amount must be greater than 0.' });
    }

    // 1. Fetch relevant ledger models within session
    const UserLedger = mongoose.model('UserLedger');
    
    // 2. Perform atomic balance updates
    await UserLedger.updateOne(
      { userId: payerId, groupId },
      { $inc: { netBalancePaisa: paisaAmount } },
      { session }
    );

    await UserLedger.updateOne(
      { userId: payeeId, groupId },
      { $inc: { netBalancePaisa: -paisaAmount } },
      { session }
    );

    // 3. Log settlement record
    const Settlement = mongoose.model('Settlement');
    const record = new Settlement({
      payerId,
      payeeId,
      groupId,
      amountPaisa: paisaAmount,
      status: 'COMPLETED'
    });
    
    await record.save({ session });

    // Commit changes across all operations atomically
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Settlement processed cleanly.',
      settlementId: record._id,
      amountRupees: FinancialMath.toRupees(paisaAmount)
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ error: 'Settlement transaction failed: ' + error.message });
  }
};