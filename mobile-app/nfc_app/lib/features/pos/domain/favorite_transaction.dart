import 'pos_item.dart';

class FavoriteTransaction {
  const FavoriteTransaction({
    required this.id,
    required this.userId,
    required this.name,
    required this.categoryKey,
    required this.itemId,
    required this.quantity,
    required this.totalAmount,
    this.itemDetails,
    this.createdAt,
  });

  final String id;
  final String userId;
  final String name;
  final String categoryKey;
  final String itemId;
  final int quantity;
  final double totalAmount;
  final POSItem? itemDetails;
  final DateTime? createdAt;

  factory FavoriteTransaction.fromJson(Map<String, dynamic> json) {
    return FavoriteTransaction(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      categoryKey: json['categoryKey']?.toString() ?? '',
      itemId: json['itemId']?.toString() ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0,
      itemDetails: json['itemId'] is Map<String, dynamic> 
          ? POSItem.fromJson(json['itemId'] as Map<String, dynamic>)
          : null,
      createdAt: json['createdAt'] != null 
          ? DateTime.tryParse(json['createdAt'].toString()) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'categoryKey': categoryKey,
      'itemId': itemId,
      'quantity': quantity,
      'totalAmount': totalAmount,
    };
  }
}
