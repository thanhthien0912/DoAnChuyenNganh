import 'package:intl/intl.dart';

String formatCurrency(num amount, {required String currency, bool showSymbolAfter = true}) {
  final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '', decimalDigits: 0);
  final formatted = formatter.format(amount);
  return showSymbolAfter ? '$formatted $currency' : '$currency $formatted';
}

String formatSignedCurrency(num amount, {required String currency, required bool isCredit}) {
  final sign = isCredit ? '+' : '-';
  final formatter = NumberFormat.currency(locale: 'vi_VN', symbol: '', decimalDigits: 0);
  return '$sign${formatter.format(amount)} $currency';
}

String formatCompactCurrency(num amount, {required String currency}) {
  final formatter = NumberFormat.compactCurrency(locale: 'vi_VN', symbol: '', decimalDigits: 0);
  return '${formatter.format(amount)} $currency';
}
