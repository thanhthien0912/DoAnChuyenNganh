class POSCategory {
  const POSCategory({
    required this.id,
    required this.key,
    required this.name,
    required this.icon,
    this.description,
    this.isActive = true,
    this.displayOrder = 0,
  });

  final String id;
  final String key;
  final String name;
  final String icon;
  final String? description;
  final bool isActive;
  final int displayOrder;

  factory POSCategory.fromJson(Map<String, dynamic> json) {
    return POSCategory(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      key: json['key']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      icon: json['icon']?.toString() ?? '',
      description: json['description']?.toString(),
      isActive: json['isActive'] as bool? ?? true,
      displayOrder: (json['displayOrder'] as num?)?.toInt() ?? 0,
    );
  }
}
