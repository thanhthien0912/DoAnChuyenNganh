import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../transactions/application/transaction_detail_controller.dart';

class TransactionDetailScreen extends ConsumerWidget {
  const TransactionDetailScreen({super.key, required this.referenceNumber});

  final String referenceNumber;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailValue = ref.watch(transactionDetailProvider(referenceNumber));

    return Scaffold(
      appBar: AppBar(title: Text('Hoá đơn $referenceNumber')),
      body: detailValue.when(
        data: (transaction) {
          final amountText = formatCurrency(transaction.amount, currency: transaction.currency);
          final dateText = transaction.createdAt != null
              ? DateFormat('dd/MM/yyyy HH:mm').format(transaction.createdAt!.toLocal())
              : 'Không rõ thời gian';

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Số tiền', style: Theme.of(context).textTheme.labelLarge),
                      const SizedBox(height: 6),
                      Text(amountText, style: Theme.of(context).textTheme.headlineSmall),
                      const SizedBox(height: 16),
                      _InfoRow(label: 'Loại giao dịch', value: transaction.type),
                      _InfoRow(label: 'Trạng thái', value: transaction.status),
                      _InfoRow(label: 'Thời gian', value: dateText),
                      if (transaction.merchantName != null)
                        _InfoRow(label: 'Địa điểm', value: transaction.merchantName!),
                      if (transaction.nfcTerminal != null)
                        _InfoRow(label: 'Thiết bị NFC', value: transaction.nfcTerminal!),
                      _InfoRow(label: 'Mã tham chiếu', value: transaction.referenceNumber),
                      const SizedBox(height: 16),
                      Text(transaction.description),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text(error.toString())),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelMedium),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: Theme.of(context).textTheme.bodyLarge,
            ),
          ),
        ],
      ),
    );
  }
}
