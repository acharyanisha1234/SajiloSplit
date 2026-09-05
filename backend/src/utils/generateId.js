const generateTransactionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `TXN-${timestamp}-${random}`.toUpperCase();
};

const generateGroupId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6);
  return `GRP-${timestamp}-${random}`.toUpperCase();
};

module.exports = {
  generateTransactionId,
  generateGroupId
};