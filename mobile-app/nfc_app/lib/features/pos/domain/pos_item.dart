class POSItem {
  const POSItem({
    required this.id,
    required this.categoryKey,
    required this.name,
    this.description,
    required this.price,
    this.image,
    this.isAvailable = true,
    this.displayOrder = 0,
    this.metadata,
  });

  final String id;
  final String categoryKey;
  final String name;
  final String? description;
  final double price;
  final String? image;
  final bool isAvailable;
  final int displayOrder;
  final Map<String, dynamic>? metadata;

  factory POSItem.fromJson(Map<String, dynamic> json) {
    return POSItem(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      categoryKey: json['categoryKey']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString(),
      price: (json['price'] as num?)?.toDouble() ?? 0,
      image: json['image']?.toString(),
      isAvailable: json['isAvailable'] as bool? ?? true,
      displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}
