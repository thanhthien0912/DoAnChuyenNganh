import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../application/write_card_controller.dart';

class WriteCardScreen extends ConsumerStatefulWidget {
  const WriteCardScreen({super.key});

  @override
  ConsumerState<WriteCardScreen> createState() => _WriteCardScreenState();
}

class _WriteCardScreenState extends ConsumerState<WriteCardScreen> {
  @override
  void initState() {
    super.initState();
    // Auto load card data when screen opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(writeCardControllerProvider.notifier).loadCardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = ref.watch(writeCardControllerProvider.notifier);
    final state = ref.watch(writeCardControllerProvider);

    ref.listen<WriteCardState>(writeCardControllerProvider, (previous, next) {
      if (next.status == WriteCardStatus.error && next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(next.errorMessage!),
            backgroundColor: Colors.red,
          ),
        );
      } else if (next.status == WriteCardStatus.success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Ghi thẻ thành công!'),
            backgroundColor: Colors.green,
          ),
        );
      }
    });

    return Scaffold(
      appBar: AppBar(
        title: const Text('Ghi thẻ sinh viên'),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: state.status == WriteCardStatus.writing
                ? null
                : controller.clearLog,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Info Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(
                          Icons.credit_card,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Thông tin thẻ',
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    if (state.cardData != null) ...[
                      _InfoRow(
                        label: 'MSSV',
                        value: state.cardData!.studentId,
                      ),
                      _InfoRow(
                        label: 'Họ tên',
                        value: state.cardData!.fullName,
                      ),
                      _InfoRow(
                        label: 'Mã thẻ',
                        value: state.cardData!.cardId,
                      ),
                    ] else if (state.status != WriteCardStatus.loading) ...[
                      const Text(
                        'Đang tải thông tin...',
                        style: TextStyle(fontStyle: FontStyle.italic),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Instructions
            if (state.cardData != null) ...[
              Card(
                color: Theme.of(context).colorScheme.primaryContainer,
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Theme.of(context).colorScheme.onPrimaryContainer,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Hướng dẫn',
                            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                                ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...state.cardData!.instructions.asMap().entries.map(
                            (entry) => Padding(
                              padding: const EdgeInsets.symmetric(vertical: 4),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${entry.key + 1}. ',
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                                    ),
                                  ),
                                  Expanded(
                                    child: Text(
                                      entry.value,
                                      style: TextStyle(
                                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Buttons
            if (state.cardData == null)
              Center(
                child: state.status == WriteCardStatus.loading
                    ? const CircularProgressIndicator()
                    : FilledButton.icon(
                        onPressed: controller.loadCardData,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Tải lại'),
                      ),
              )
            else
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  FilledButton.icon(
                    onPressed: state.status == WriteCardStatus.writing
                        ? null
                        : controller.writeCard,
                    icon: const Icon(Icons.nfc),
                    label: state.status == WriteCardStatus.writing
                        ? const Text('Đang ghi...')
                        : const Text('Chạm thẻ để ghi'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton.icon(
                    onPressed: state.status == WriteCardStatus.writing
                        ? null
                        : controller.loadCardData,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Tạo lại dữ liệu'),
                  ),
                ],
              ),
            const SizedBox(height: 16),

            // Log
            Expanded(
              child: Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        'Nhật ký',
                        style: Theme.of(context).textTheme.titleSmall,
                      ),
                    ),
                    const Divider(height: 1),
                    Expanded(
                      child: state.log.isEmpty
                          ? const Center(
                              child: Text(
                                'Chưa có hoạt động',
                                style: TextStyle(
                                  fontStyle: FontStyle.italic,
                                  color: Colors.grey,
                                ),
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(12),
                              itemCount: state.log.length,
                              itemBuilder: (context, index) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 2),
                                child: Text(
                                  state.log[index],
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ),

            // Loading indicator
            if (state.status == WriteCardStatus.loading ||
                state.status == WriteCardStatus.writing)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              ),
          ],
        ),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value),
          ),
        ],
      ),
    );
  }
}
