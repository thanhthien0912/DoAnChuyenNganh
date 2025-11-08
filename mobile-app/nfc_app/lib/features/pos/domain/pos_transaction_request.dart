class POSTransactionRequest {
  const POSTransactionRequest({
    required this.itemId,
    required this.quantity,
    required this.categoryKey,
    this.nfcData,
  });

  final String itemId;
  final int quantity;
  final String categoryKey;
  final Map<String, dynamic>? nfcData;

  Map<String, dynamic> toJson() {
    return {
      'itemId': itemId,
      'quantity': quantity,
      'categoryKey': categoryKey,
      if (nfcData != null) 'nfcData': nfcData,
    };
  }
}
