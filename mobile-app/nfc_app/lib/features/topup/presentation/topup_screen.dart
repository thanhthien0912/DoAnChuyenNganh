import 'dart:async';

import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../../shared/widgets/async_value_widget.dart';
import '../application/topup_form_controller.dart';
import '../application/topup_history_controller.dart';
import '../domain/topup_request.dart';

class TopupScreen extends ConsumerStatefulWidget {
  const TopupScreen({super.key});

  @override
  ConsumerState<TopupScreen> createState() => _TopupScreenState();
}

class _TopupScreenState extends ConsumerState<TopupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _amountController = TextEditingController();
  final _noteController = TextEditingController();
  String _method = 'MANUAL';
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    // Auto-refresh every 30 seconds
    _refreshTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      ref.read(topupHistoryProvider.notifier).refresh();
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _amountController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(topupFormControllerProvider);
    final historyValue = ref.watch(topupHistoryProvider);

    ref.listen(topupFormControllerProvider, (previous, next) {
      if (previous?.lastRequest != next.lastRequest && next.lastRequest != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Đã gửi yêu cầu ${next.lastRequest!.referenceNumber}')),
        );
        ref.read(topupHistoryProvider.notifier).refresh();
        _amountController.clear();
        _noteController.clear();
      }
      if (previous?.errorMessage != next.errorMessage && next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(next.errorMessage!)),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(title: const Text('Nạp tiền S-Wallet')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Chọn nguồn nạp', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      DropdownButtonFormField<String>(
                        value: _method,
                        decoration: const InputDecoration(border: OutlineInputBorder()),
                        items: const [
                          DropdownMenuItem(value: 'MANUAL', child: Text('Nạp thủ công (tại quầy)')),
                        ],
                        onChanged: (value) {
                          if (value != null) {
                            setState(() {
                              _method = value;
                            });
                          }
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _amountController,
                        decoration: const InputDecoration(
                          labelText: 'Số tiền cần nạp',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.payments_outlined),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          final parsed = double.tryParse(value ?? '');
                          if (parsed == null || parsed <= 0) {
                            return 'Vui lòng nhập số tiền hợp lệ';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _noteController,
                        decoration: const InputDecoration(
                          labelText: 'Ghi chú (không bắt buộc)',
                          border: OutlineInputBorder(),
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          icon: const Icon(Icons.send),
                          onPressed: formState.isSubmitting
                              ? null
                              : () {
                                  if (_formKey.currentState?.validate() != true) return;
                                  final amount = double.parse(_amountController.text);
                                  ref.read(topupFormControllerProvider.notifier).submit(
                                        amount: amount,
                                        method: _method,
                                        note: _noteController.text,
                                      );
                                },
                          label: formState.isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Gửi yêu cầu nạp'),
                        ),
                      )
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Lịch sử yêu cầu', style: Theme.of(context).textTheme.titleLarge),
                IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () => ref.read(topupHistoryProvider.notifier).refresh(),
                )
              ],
            ),
            AsyncValueWidget<List<TopupRequestItem>>(
              value: historyValue,
              builder: (items) {
                if (items.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.all(12),
                    child: Text('Chưa có yêu cầu nào'),
                  );
                }
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        title: Text('Yêu cầu ${item.referenceNumber}'),
                        subtitle: Text(_buildSubtitle(item)),
                        trailing: Chip(
                          label: Text(_getStatusLabel(item.status)),
                          backgroundColor: _getStatusColor(item.status),
                        ),
                      ),
                    );
                  },
                );
              },
            )
          ],
        ),
      ),
    );
  }

  String _buildSubtitle(TopupRequestItem item) {
    final amountText = formatCurrency(item.amount, currency: item.currency);
    final timeText = item.createdAt != null
        ? DateFormat('dd/MM/yyyy HH:mm').format(item.createdAt!.toLocal())
        : 'Không rõ thời gian';
    if (item.note != null && item.note!.isNotEmpty) {
      return '$amountText • $timeText\n${item.note}';
    }
    return '$amountText • $timeText';
  }

  String _getStatusLabel(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'Chờ duyệt';
      case 'APPROVED':
        return 'Đã duyệt';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return Colors.orange.shade100;
      case 'APPROVED':
        return Colors.green.shade100;
      case 'REJECTED':
        return Colors.red.shade100;
      case 'CANCELLED':
        return Colors.grey.shade200;
      default:
        return Colors.blue.shade100;
    }
  }
}
