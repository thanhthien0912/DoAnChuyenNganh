import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:intl/intl.dart';

import '../application/card_list_controller.dart';
import '../domain/card_model.dart';
import 'widgets/password_dialog.dart';

class CardListScreen extends ConsumerWidget {
  const CardListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cardsValue = ref.watch(cardListControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý thẻ'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.read(cardListControllerProvider.notifier).refresh();
            },
          ),
        ],
      ),
      body: cardsValue.when(
        data: (cards) {
          if (cards.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.credit_card_off,
                    size: 80,
                    color: Colors.grey.shade400,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Chưa có thẻ nào',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Vào Thông tin cá nhân > Ghi thẻ sinh viên',
                    style: TextStyle(color: Colors.grey.shade500),
                  ),
                  const SizedBox(height: 24),
                  FilledButton.icon(
                    onPressed: () => context.push('/write-card'),
                    icon: const Icon(Icons.add_card),
                    label: const Text('Ghi thẻ mới'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: cards.length,
            itemBuilder: (context, index) {
              final card = cards[index];
              return _CardItem(
                card: card,
                onToggleLock: (lock) => _handleToggleLock(
                  context,
                  ref,
                  card,
                  lock,
                ),
                onDelete: () => _handleDeleteCard(
                  context,
                  ref,
                  card,
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 80,
                color: Colors.red.shade400,
              ),
              const SizedBox(height: 16),
              Text(
                'Không thể tải danh sách thẻ',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 8),
              Text(
                error.toString(),
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600),
              ),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () {
                  ref.read(cardListControllerProvider.notifier).refresh();
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleToggleLock(
    BuildContext context,
    WidgetRef ref,
    CardModel card,
    bool lock,
  ) async {
    final password = await PasswordDialog.show(
      context,
      title: lock ? 'Khóa thẻ' : 'Mở khóa thẻ',
      message: lock
          ? 'Sau khi khóa, thẻ sẽ được bảo vệ khỏi việc sử dụng trái phép. Vui lòng nhập mật khẩu để xác nhận.'
          : 'Mở khóa sẽ cho phép bạn ghi thẻ mới hoặc cập nhật thẻ này. Vui lòng nhập mật khẩu để xác nhận.',
    );

    if (password == null || password.isEmpty) return;

    if (!context.mounted) return;

    try {
      await ref.read(cardListControllerProvider.notifier).toggleLock(
            cardId: card.id,
            lock: lock,
            password: password,
          );

      if (context.mounted) {
        // Clear any existing snackbars first
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(lock ? 'Đã khóa thẻ thành công' : 'Đã mở khóa thẻ thành công'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        String errorMsg = error.toString();
        if (errorMsg.startsWith('Exception: ')) {
          errorMsg = errorMsg.substring(11);
        }
        // Clear any existing snackbars first
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $errorMsg'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }

  Future<void> _handleDeleteCard(
    BuildContext context,
    WidgetRef ref,
    CardModel card,
  ) async {
    // Confirm deletion first
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Xác nhận xóa thẻ'),
        content: Text(
          'Bạn có chắc chắn muốn xóa thẻ "${card.alias.isNotEmpty ? card.alias : 'Thẻ sinh viên'}"?\n\n'
          'Hành động này không thể hoàn tác.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Hủy'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Xóa'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;
    if (!context.mounted) return;

    // Ask for password
    final password = await PasswordDialog.show(
      context,
      title: 'Xác nhận mật khẩu',
      message: 'Vui lòng nhập mật khẩu để xác nhận xóa thẻ.',
    );

    if (password == null || password.isEmpty) return;
    if (!context.mounted) return;

    try {
      await ref.read(cardListControllerProvider.notifier).deleteCard(
            cardId: card.id,
            password: password,
          );

      if (context.mounted) {
        // Clear any existing snackbars first
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã xóa thẻ thành công'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        String errorMsg = error.toString();
        if (errorMsg.startsWith('Exception: ')) {
          errorMsg = errorMsg.substring(11);
        }
        // Clear any existing snackbars first
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $errorMsg'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}

class _CardItem extends StatelessWidget {
  const _CardItem({
    required this.card,
    required this.onToggleLock,
    required this.onDelete,
  });

  final CardModel card;
  final Function(bool lock) onToggleLock;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        card.alias.isNotEmpty ? card.alias : 'Thẻ sinh viên',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'UID: ${card.uid}',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              fontFamily: 'monospace',
                              color: Colors.grey.shade600,
                            ),
                      ),
                    ],
                  ),
                ),
                if (card.isPrimary)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.primary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Chính',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            const Divider(height: 1),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _InfoRow(
                        icon: Icons.event,
                        label: 'Liên kết',
                        value: DateFormat('dd/MM/yyyy').format(card.linkedAt),
                      ),
                      if (card.lastUsedAt != null) ...[
                        const SizedBox(height: 4),
                        _InfoRow(
                          icon: Icons.access_time,
                          label: 'Sử dụng cuối',
                          value: DateFormat('dd/MM/yyyy HH:mm')
                              .format(card.lastUsedAt!),
                        ),
                      ],
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: card.isLocked
                        ? Colors.green.shade50
                        : Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: card.isLocked
                          ? Colors.green.shade200
                          : Colors.orange.shade200,
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        card.isLocked ? Icons.lock : Icons.lock_open,
                        size: 16,
                        color: card.isLocked
                            ? Colors.green.shade700
                            : Colors.orange.shade700,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        card.isLocked ? 'Đang khóa' : 'Chưa khóa',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: card.isLocked
                              ? Colors.green.shade700
                              : Colors.orange.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => onToggleLock(!card.isLocked),
                    icon: Icon(card.isLocked ? Icons.lock_open : Icons.lock),
                    label: Text(card.isLocked ? 'Mở khóa' : 'Khóa thẻ'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: onDelete,
                    icon: const Icon(Icons.delete_outline),
                    label: const Text('Xóa thẻ'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade600),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: TextStyle(
            fontSize: 13,
            color: Colors.grey.shade600,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
}
