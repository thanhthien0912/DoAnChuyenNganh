import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../card/application/card_list_controller.dart';
import '../../../card/presentation/widgets/password_dialog.dart';
import '../../application/home_controller.dart';
import '../../domain/home_summary.dart';

class CardDetailDialog extends ConsumerWidget {
  const CardDetailDialog({
    super.key,
    required this.card,
    required this.studentId,
    required this.fullName,
  });

  final CardInfo card;
  final String studentId;
  final String fullName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dialog(
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primaryContainer,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(28),
                  topRight: Radius.circular(28),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.credit_card,
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                        size: 32,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Thông tin thẻ',
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                color: Theme.of(context).colorScheme.onPrimaryContainer,
                                fontWeight: FontWeight.bold,
                              ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          Icons.close,
                          color: Theme.of(context).colorScheme.onPrimaryContainer,
                        ),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Student Info
                  _InfoSection(
                    title: 'Thông tin sinh viên',
                    icon: Icons.person,
                    children: [
                      _InfoRow(label: 'MSSV', value: studentId),
                      _InfoRow(label: 'Họ và tên', value: fullName),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Card Info
                  _InfoSection(
                    title: 'Thông tin thẻ NFC',
                    icon: Icons.nfc,
                    children: [
                      _InfoRow(
                        label: 'Tên thẻ',
                        value: card.alias.isNotEmpty ? card.alias : 'Chưa đặt tên',
                      ),
                      _InfoRow(
                        label: 'UID',
                        value: card.uid,
                        trailing: IconButton(
                          icon: const Icon(Icons.copy, size: 18),
                          onPressed: () {
                            Clipboard.setData(ClipboardData(text: card.uid));
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Đã sao chép UID')),
                            );
                          },
                        ),
                      ),
                      _InfoRow(
                        label: 'Trạng thái',
                        value: card.status == 'ACTIVE' ? 'Hoạt động' : 'Đã khóa',
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // Security Section
                  _InfoSection(
                    title: 'Bảo mật',
                    icon: Icons.security,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: card.isLocked
                              ? Colors.green.shade50
                              : Colors.orange.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: card.isLocked
                                ? Colors.green.shade200
                                : Colors.orange.shade200,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              card.isLocked ? Icons.lock : Icons.lock_open,
                              color: card.isLocked
                                  ? Colors.green.shade700
                                  : Colors.orange.shade700,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    card.isLocked
                                        ? 'Thẻ đang được khóa'
                                        : 'Thẻ chưa được khóa',
                                    style: TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: card.isLocked
                                          ? Colors.green.shade900
                                          : Colors.orange.shade900,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    card.isLocked
                                        ? 'Thẻ được bảo vệ, không thể thay đổi'
                                        : 'Khuyến nghị khóa thẻ để bảo mật',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: card.isLocked
                                          ? Colors.green.shade700
                                          : Colors.orange.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            FilledButton.icon(
                              onPressed: () => _handleToggleLock(context, ref),
                              icon: Icon(card.isLocked ? Icons.lock_open : Icons.lock),
                              label: Text(card.isLocked ? 'Mở khóa' : 'Khóa'),
                              style: FilledButton.styleFrom(
                                backgroundColor: card.isLocked
                                    ? Colors.orange
                                    : Colors.green,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Actions
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pop();
                            context.push('/cards');
                          },
                          icon: const Icon(Icons.settings),
                          label: const Text('Quản lý thẻ'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => _handleDeleteCard(context, ref),
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
          ],
        ),
      ),
    );
  }

  Future<void> _handleToggleLock(BuildContext context, WidgetRef ref) async {
    final password = await PasswordDialog.show(
      context,
      title: card.isLocked ? 'Mở khóa thẻ' : 'Khóa thẻ',
      message: card.isLocked
          ? 'Mở khóa sẽ cho phép bạn ghi thẻ mới hoặc cập nhật. Vui lòng nhập mật khẩu.'
          : 'Khóa thẻ sẽ bảo vệ thẻ khỏi thay đổi trái phép. Vui lòng nhập mật khẩu.',
    );

    if (password == null || password.isEmpty) return;

    if (!context.mounted) return;

    try {
      await ref.read(cardListControllerProvider.notifier).toggleLock(
            cardId: card.id,
            lock: !card.isLocked,
            password: password,
          );

      // Refresh home
      await ref.read(homeControllerProvider.notifier).refresh();

      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              card.isLocked ? 'Đã mở khóa thẻ thành công' : 'Đã khóa thẻ thành công',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: ${error.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _handleDeleteCard(BuildContext context, WidgetRef ref) async {
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

      // Refresh home
      await ref.read(homeControllerProvider.notifier).refresh();

      if (context.mounted) {
        Navigator.of(context).pop(); // Close dialog
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Đã xóa thẻ thành công'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (error) {
      if (context.mounted) {
        String errorMsg = error.toString();
        if (errorMsg.startsWith('Exception: ')) {
          errorMsg = errorMsg.substring(11);
        }
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Lỗi: $errorMsg'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  static Future<void> show(
    BuildContext context, {
    required CardInfo card,
    required String studentId,
    required String fullName,
  }) {
    return showDialog(
      context: context,
      builder: (context) => CardDetailDialog(
        card: card,
        studentId: studentId,
        fullName: fullName,
      ),
    );
  }
}

class _InfoSection extends StatelessWidget {
  const _InfoSection({
    required this.title,
    required this.icon,
    required this.children,
  });

  final String title;
  final IconData icon;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 20, color: Theme.of(context).colorScheme.primary),
            const SizedBox(width: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...children,
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    this.trailing,
  });

  final String label;
  final String value;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
