class CardModel {
  const CardModel({
    required this.id,
    required this.uid,
    required this.alias,
    required this.status,
    required this.isPrimary,
    required this.isLocked,
    required this.linkedAt,
    this.lastUsedAt,
    this.lockedAt,
  });

  final String id;
  final String uid;
  final String alias;
  final String status;
  final bool isPrimary;
  final bool isLocked;
  final DateTime linkedAt;
  final DateTime? lastUsedAt;
  final DateTime? lockedAt;

  factory CardModel.fromJson(Map<String, dynamic> json) {
    try {
      return CardModel(
        id: (json['id'] ?? json['_id'] ?? '').toString(),
        uid: (json['uid'] ?? '').toString(),
        alias: (json['alias'] ?? '').toString(),
        status: (json['status'] ?? 'ACTIVE').toString(),
        isPrimary: json['isPrimary'] as bool? ?? false,
        isLocked: json['isLocked'] as bool? ?? false,
        linkedAt: json['linkedAt'] != null 
            ? DateTime.parse(json['linkedAt'].toString())
            : DateTime.now(),
        lastUsedAt: json['lastUsedAt'] != null
            ? DateTime.tryParse(json['lastUsedAt'].toString())
            : null,
        lockedAt: json['lockedAt'] != null
            ? DateTime.tryParse(json['lockedAt'].toString())
            : null,
      );
    } catch (e) {
      print('CardModel.fromJson error: $e');
      print('JSON: $json');
      rethrow;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'uid': uid,
      'alias': alias,
      'status': status,
      'isPrimary': isPrimary,
      'isLocked': isLocked,
      'linkedAt': linkedAt.toIso8601String(),
      'lastUsedAt': lastUsedAt?.toIso8601String(),
      'lockedAt': lockedAt?.toIso8601String(),
    };
  }

  String get maskedUid {
    if (uid.length <= 8) return uid;
    final parts = <String>[];
    for (var i = 0; i < uid.length; i += 2) {
      if (i + 2 <= uid.length) {
        parts.add(uid.substring(i, i + 2));
      } else {
        parts.add(uid.substring(i));
      }
    }
    return parts.join(':');
  }
}
