class InMemoryTransactionRepository {
  constructor() {
    this.transactions = new Map();
  }

  add(checkoutRequestId, transaction) {
    this.transactions.set(checkoutRequestId, transaction);
  }

  updateFromCallback(callback) {
    const checkoutRequestId = callback?.CheckoutRequestID;
    const transaction = this.transactions.get(checkoutRequestId);
    if (!transaction) return false;

    transaction.status = callback.ResultCode === 0 ? 'completed' : 'failed';
    transaction.resultCode = callback.ResultCode;
    transaction.resultDescription = callback.ResultDesc;
    transaction.callbackReceivedAt = new Date().toISOString();
    return true;
  }
}

module.exports = { InMemoryTransactionRepository };
