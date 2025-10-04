class TransactionItem {
  const TransactionItem({
    required this.id,
    required this.referenceNumber,
    required this.type,
    required this.status,
    required this.amount,
    required this.currency,
    required this.description,
    this.merchantName,
    this.category,
    this.createdAt,
    this.nfcTerminal,
  });

  final String id;
  final String referenceNumber;
  final String type;
  final String status;
  final double amount;
  final String currency;
  final String description;
  final String? merchantName;
  final String? category;
  final DateTime? createdAt;
  final String? nfcTerminal;

  factory TransactionItem.fromJson(Map<String, dynamic> json) {
    return TransactionItem(
      id: json['id']?.toString() ?? '',
      referenceNumber: json['referenceNumber']?.toString() ?? '',
      type: json['type']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      currency: json['currency']?.toString() ?? 'VND',
      description: json['description']?.toString() ?? '',
      merchantName: json['merchantName']?.toString(),
      category: json['category']?.toString(),
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
      nfcTerminal: json['nfcTerminal']?.toString(),
    );
  }
}

class TransactionHistory {
  const TransactionHistory({required this.items, required this.totalCount});

  final List<TransactionItem> items;
  final int totalCount;
}
