// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import 'package:nfc_app/features/home/application/home_controller.dart';
import 'package:nfc_app/features/home/domain/home_summary.dart';
import 'package:nfc_app/features/home/presentation/home_screen.dart';
import 'package:nfc_app/features/transactions/domain/transaction.dart';

class _FakeHomeController extends HomeController {
  _FakeHomeController(this.summary);

  final HomeSummary summary;

  @override
  Future<HomeSummary> build() async => summary;
}

void main() {
  final fakeSummary = HomeSummary(
    userName: 'Nguyễn Văn A',
    balance: 1500000,
    currency: 'VND',
    cardStatusLabel: 'Đã liên kết',
    quickActions: const [
      HomeQuickAction(key: 'TOPUP', label: 'Nạp tiền', route: '/topup'),
      HomeQuickAction(key: 'NFC', label: 'Quét NFC', route: '/nfc'),
      HomeQuickAction(key: 'HISTORY', label: 'Lịch sử', route: '/transactions'),
    ],
    recentTransactions: const [
      TransactionItem(
        id: '1',
        referenceNumber: 'TXN1',
        type: 'PAYMENT',
        status: 'COMPLETED',
        amount: 35000,
        currency: 'VND',
        description: 'Thanh toán căn tin',
        createdAt: null,
        merchantName: null,
        category: null,
        nfcTerminal: null,
      ),
    ],
    dailyRemaining: 500000,
    monthlyRemaining: 3000000,
  );

  testWidgets('Trang chủ hiển thị số dư và quick actions', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          homeControllerProvider.overrideWith(() => _FakeHomeController(fakeSummary)),
        ],
        child: const MaterialApp(home: HomeScreen()),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('S-Wallet'), findsOneWidget);
    expect(find.textContaining('Nguyễn Văn A'), findsOneWidget);
    expect(find.text('Nạp tiền'), findsOneWidget);
    expect(find.textContaining('Thanh toán căn tin'), findsOneWidget);
  });
}
