import '../../transactions/domain/transaction.dart';

class HomeQuickAction {
  const HomeQuickAction({required this.key, required this.label, required this.route});

  final String key;
  final String label;
  final String route;

  factory HomeQuickAction.fromJson(Map<String, dynamic> json) {
    return HomeQuickAction(
      key: json['key'] as String? ?? '',
      label: json['label'] as String? ?? '',
      route: json['route'] as String? ?? '',
    );
  }
}

class CardInfo {
  const CardInfo({
    required this.id,
    required this.uid,
    required this.alias,
    required this.status,
    required this.isPrimary,
    this.statusLabel,
  });

  final String id;
  final String uid;
  final String alias;
  final String status;
  final bool isPrimary;
  final String? statusLabel;

  factory CardInfo.fromJson(Map<String, dynamic> json) {
    return CardInfo(
      id: json['id']?.toString() ?? '',
      uid: json['uid']?.toString() ?? '',
      alias: json['alias']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      isPrimary: json['isPrimary'] as bool? ?? false,
      statusLabel: json['statusLabel']?.toString(),
    );
  }
}

class HomeSummary {
  const HomeSummary({
    required this.userName,
    required this.balance,
    required this.currency,
    required this.cardStatusLabel,
    required this.quickActions,
    required this.recentTransactions,
    required this.dailyRemaining,
    required this.monthlyRemaining,
  });

  final String userName;
  final double balance;
  final String currency;
  final String cardStatusLabel;
  final List<HomeQuickAction> quickActions;
  final List<TransactionItem> recentTransactions;
  final double dailyRemaining;
  final double monthlyRemaining;

  factory HomeSummary.fromJson(Map<String, dynamic> json) {
    final cards = json['cards'] as Map<String, dynamic>?;
    final quickActionList = (json['quickActions'] as List<dynamic>? ?? [])
        .map((e) => HomeQuickAction.fromJson(e as Map<String, dynamic>))
        .toList();
    final recentTransactions = (json['recentTransactions'] as List<dynamic>? ?? [])
        .map((item) => TransactionItem.fromJson(item as Map<String, dynamic>))
        .toList();

    return HomeSummary(
      userName: json['user']?['fullName']?.toString() ?? '',
      balance: (json['wallet']?['balance'] as num?)?.toDouble() ?? 0,
      currency: json['wallet']?['currency']?.toString() ?? 'VND',
      cardStatusLabel: cards?['statusLabel']?.toString() ?? 'Chưa liên kết',
      quickActions: quickActionList,
      recentTransactions: recentTransactions,
      dailyRemaining: (json['stats']?['dailyRemaining'] as num?)?.toDouble() ?? 0,
      monthlyRemaining: (json['stats']?['monthlyRemaining'] as num?)?.toDouble() ?? 0,
    );
  }
}
