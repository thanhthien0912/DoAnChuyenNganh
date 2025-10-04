import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../../shared/widgets/async_value_widget.dart';
import '../../transactions/domain/transaction.dart';
import '../application/home_controller.dart';

final _balanceVisibleProvider = StateProvider<bool>((ref) => true);

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryValue = ref.watch(homeControllerProvider);
    final isBalanceVisible = ref.watch(_balanceVisibleProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('S-Wallet'),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            onPressed: () => context.push('/profile'),
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.read(homeControllerProvider.notifier).refresh(),
        child: AsyncValueWidget(
          value: summaryValue,
          builder: (summary) {
            final balanceText = formatCurrency(summary.balance, currency: summary.currency);
            return SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Xin chào,', style: Theme.of(context).textTheme.titleMedium),
                          const SizedBox(height: 4),
                          Text(
                            summary.userName,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            children: [
                              Text('Số dư ví', style: Theme.of(context).textTheme.titleMedium),
                              const SizedBox(width: 12),
                              IconButton(
                                icon: Icon(isBalanceVisible ? Icons.visibility : Icons.visibility_off),
                                onPressed: () {
                                  ref.read(_balanceVisibleProvider.notifier).state = !isBalanceVisible;
                                },
                              ),
                              const Spacer(),
                              Chip(
                                label: Text(summary.cardStatusLabel),
                                avatar: Icon(
                                  Icons.nfc,
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            isBalanceVisible ? balanceText : '•••••••',
                            style: Theme.of(context).textTheme.headlineMedium,
                          ),
                          const SizedBox(height: 16),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: summary.quickActions.map((action) {
                              return _QuickActionButton(
                                label: action.label,
                                icon: _iconForAction(action.key),
                                onTap: () => context.push(action.route),
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text('Chi tiêu', style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          title: 'Còn lại hôm nay',
                          value: formatCompactCurrency(summary.dailyRemaining, currency: summary.currency),
                          icon: Icons.calendar_today,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          title: 'Còn lại tháng',
                          value: formatCompactCurrency(summary.monthlyRemaining, currency: summary.currency),
                          icon: Icons.bar_chart,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Giao dịch gần đây', style: Theme.of(context).textTheme.titleLarge),
                      TextButton(
                        onPressed: () => context.push('/transactions'),
                        child: const Text('Xem tất cả'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...summary.recentTransactions.map((tx) => _TransactionTile(transaction: tx)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  IconData _iconForAction(String key) {
    switch (key.toUpperCase()) {
      case 'TOPUP':
        return Icons.add_circle_outline;
      case 'NFC':
        return Icons.nfc;
      case 'HISTORY':
        return Icons.history;
      default:
        return Icons.arrow_forward_ios;
    }
  }
}

class _QuickActionButton extends StatelessWidget {
  const _QuickActionButton({required this.label, required this.icon, required this.onTap});

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, size: 28, color: Theme.of(context).colorScheme.onPrimaryContainer),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.title, required this.value, required this.icon});

  final String title;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, color: Theme.of(context).colorScheme.primary),
            const SizedBox(height: 12),
            Text(title, style: Theme.of(context).textTheme.labelLarge),
            const SizedBox(height: 8),
            Text(
              value,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

class _TransactionTile extends StatelessWidget {
  const _TransactionTile({required this.transaction});

  final TransactionItem transaction;

  @override
  Widget build(BuildContext context) {
    final amountStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
          color: transaction.type.toUpperCase() == 'TOPUP'
              ? Colors.teal
              : Theme.of(context).colorScheme.error,
        );
    final dateText = transaction.createdAt != null
        ? DateFormat('dd/MM/yyyy HH:mm').format(transaction.createdAt!.toLocal())
        : '';

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        onTap: () => GoRouter.of(context).push('/transactions/${transaction.referenceNumber}'),
        title: Text(transaction.description),
        subtitle: Text(dateText),
        trailing: Text(
          formatSignedCurrency(
            transaction.amount,
            currency: transaction.currency,
            isCredit: transaction.type.toUpperCase() == 'TOPUP',
          ),
          style: amountStyle,
        ),
      ),
    );
  }
}
