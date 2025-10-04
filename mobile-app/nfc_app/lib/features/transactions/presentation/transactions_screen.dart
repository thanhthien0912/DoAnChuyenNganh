import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../../shared/widgets/async_value_widget.dart';
import '../application/transaction_list_controller.dart';
import '../domain/transaction.dart';

class TransactionsScreen extends ConsumerStatefulWidget {
  const TransactionsScreen({super.key});

  @override
  ConsumerState<TransactionsScreen> createState() => _TransactionsScreenState();
}

class _TransactionsScreenState extends ConsumerState<TransactionsScreen> {
  String? _type;
  String? _status;
  DateTimeRange? _range;

  @override
  Widget build(BuildContext context) {
    final transactionsValue = ref.watch(transactionListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Lịch sử giao dịch')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Tất cả'),
                  selected: _type == null,
                  onSelected: (selected) {
                    setState(() {
                      _type = selected ? null : _type;
                    });
                    _applyFilters();
                  },
                ),
                ChoiceChip(
                  label: const Text('Nạp tiền'),
                  selected: _type == 'TOPUP',
                  onSelected: (selected) {
                    setState(() {
                      _type = selected ? 'TOPUP' : null;
                    });
                    _applyFilters();
                  },
                ),
                ChoiceChip(
                  label: const Text('Thanh toán'),
                  selected: _type == 'PAYMENT',
                  onSelected: (selected) {
                    setState(() {
                      _type = selected ? 'PAYMENT' : null;
                    });
                    _applyFilters();
                  },
                ),
                ChoiceChip(
                  label: const Text('Hoàn tiền'),
                  selected: _type == 'REFUND',
                  onSelected: (selected) {
                    setState(() {
                      _type = selected ? 'REFUND' : null;
                    });
                    _applyFilters();
                  },
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    value: _status,
                    isExpanded: true,
                    items: const [
                      DropdownMenuItem<String?>(value: null, child: Text('Tất cả')),
                      DropdownMenuItem<String?>(value: 'COMPLETED', child: Text('Hoàn tất')),
                      DropdownMenuItem<String?>(value: 'PENDING', child: Text('Đang xử lý')),
                      DropdownMenuItem<String?>(value: 'FAILED', child: Text('Thất bại')),
                    ],
                    decoration: const InputDecoration(
                      labelText: 'Trạng thái',
                      border: OutlineInputBorder(),
                    ),
                    onChanged: (value) {
                      setState(() {
                        _status = value;
                      });
                      _applyFilters();
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.date_range),
                    label: Text(_range == null
                        ? 'Khoảng thời gian'
                        : '${DateFormat('dd/MM').format(_range!.start)} - ${DateFormat('dd/MM').format(_range!.end)}'),
                    onPressed: () async {
                      final now = DateTime.now();
                      final selected = await showDateRangePicker(
                        context: context,
                        firstDate: DateTime(now.year - 1),
                        lastDate: DateTime(now.year + 1),
                        initialDateRange: _range,
                      );
                      if (selected != null) {
                        setState(() {
                          _range = selected;
                        });
                        _applyFilters();
                      }
                    },
                  ),
                ),
                IconButton(
                  onPressed: () {
                    setState(() {
                      _type = null;
                      _status = null;
                      _range = null;
                    });
                    _applyFilters();
                  },
                  icon: const Icon(Icons.clear_all),
                  tooltip: 'Xoá bộ lọc',
                )
              ],
            ),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: AsyncValueWidget<List<TransactionItem>>(
              value: transactionsValue,
              builder: (items) {
                if (items.isEmpty) {
                  return const Center(child: Text('Không có giao dịch nào'));
                }
                return ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final tx = items[index];
                    final isCredit = tx.type.toUpperCase() == 'TOPUP';
                    final amountText = formatSignedCurrency(
                      tx.amount,
                      currency: tx.currency,
                      isCredit: isCredit,
                    );
                    final dateText = tx.createdAt != null
                        ? DateFormat('dd/MM/yyyy HH:mm').format(tx.createdAt!.toLocal())
                        : '';
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      child: ListTile(
                        onTap: () => context.push('/transactions/${tx.referenceNumber}'),
                        title: Text(tx.description),
                        subtitle: Text('$dateText • ${tx.status}'),
                        trailing: Text(amountText),
                      ),
                    );
                  },
                );
              },
            ),
          )
        ],
      ),
    );
  }

  void _applyFilters() {
    final filter = TransactionFilter(
      type: _type,
      status: _status,
      startDate: _range?.start,
      endDate: _range?.end,
    );
    ref.read(transactionListProvider.notifier).applyFilter(filter);
  }
}
