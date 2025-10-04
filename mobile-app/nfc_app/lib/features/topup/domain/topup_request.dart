class TopupRequestItem {
  const TopupRequestItem({
    required this.id,
    required this.referenceNumber,
    required this.amount,
    required this.currency,
    required this.status,
    required this.method,
    this.note,
    this.createdAt,
  });

  final String id;
  final String referenceNumber;
  final double amount;
  final String currency;
  final String status;
  final String method;
  final String? note;
  final DateTime? createdAt;

  factory TopupRequestItem.fromJson(Map<String, dynamic> json) {
    return TopupRequestItem(
      id: json['id']?.toString() ?? '',
      referenceNumber: json['referenceNumber']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0,
      currency: json['currency']?.toString() ?? 'VND',
      status: json['status']?.toString() ?? '',
      method: json['method']?.toString() ?? '',
      note: json['note']?.toString(),
      createdAt: json['createdAt'] != null ? DateTime.tryParse(json['createdAt'].toString()) : null,
    );
  }
}
