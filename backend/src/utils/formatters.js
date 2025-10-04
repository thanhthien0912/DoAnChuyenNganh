const toPlainNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof value === 'object' && typeof value.toString === 'function') {
    const parsed = Number(value.toString());
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const formatTransaction = (transaction) => {
  if (!transaction) {
    return null;
  }

  let processedBy = null;
  if (transaction.processedBy) {
    if (typeof transaction.processedBy === 'object') {
      const profile = transaction.processedBy.profile;
      processedBy = {
        id: transaction.processedBy._id || transaction.processedBy,
        studentId: transaction.processedBy.studentId,
        fullName: profile
          ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
          : undefined
      };
    } else {
      processedBy = { id: transaction.processedBy };
    }
  }

  return {
    id: transaction._id,
    userId: transaction.userId?._id || transaction.userId,
    walletId: transaction.walletId?._id || transaction.walletId,
    referenceNumber: transaction.referenceNumber,
    type: transaction.type,
    status: transaction.status,
    amount: toPlainNumber(transaction.amount),
    currency: transaction.walletId?.currency || transaction.currency || 'VND',
    description: transaction.description,
    category: transaction.metadata?.category || null,
    merchantName: transaction.metadata?.merchantName || null,
    location: transaction.metadata?.location?.coordinates ? {
      type: transaction.metadata.location.type,
      coordinates: transaction.metadata.location.coordinates
    } : null,
    nfcTerminal: transaction.nfcData?.terminalId || null,
    nfcDevice: transaction.nfcData?.deviceId || null,
    notes: transaction.metadata?.notes || null,
    processedAt: transaction.processedAt || null,
    processedBy,
    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt
  };
};

const formatTopupRequest = (request, overrides = {}) => {
  if (!request) {
    return null;
  }

  return {
    id: request._id,
    referenceNumber: request.referenceNumber,
    amount: toPlainNumber(request.amount),
    status: request.status,
    method: request.method,
    note: request.note,
    createdAt: request.createdAt,
    processedAt: request.processedAt,
    rejectionReason: request.rejectionReason,
    currency: overrides.currency || request.currency || 'VND',
    ...overrides
  };
};

module.exports = {
  toPlainNumber,
  formatTransaction,
  formatTopupRequest
};
