import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../domain/home_summary.dart';
import 'card_detail_dialog.dart';

class CardManagementWidget extends ConsumerWidget {
  const CardManagementWidget({
    super.key,
    required this.primaryCard,
    required this.studentId,
    required this.fullName,
  });

  final CardInfo? primaryCard;
  final String studentId;
  final String fullName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return InkWell(
      onTap: primaryCard != null
          ? () => CardDetailDialog.show(
                context,
                card: primaryCard!,
                studentId: studentId,
                fullName: fullName,
              )
          : () => context.push('/write-card'),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: primaryCard != null
              ? (primaryCard!.isLocked ? Colors.green.shade50 : Colors.orange.shade50)
              : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: primaryCard != null
                ? (primaryCard!.isLocked ? Colors.green.shade200 : Colors.orange.shade200)
                : Colors.grey.shade300,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              primaryCard != null ? Icons.credit_card : Icons.credit_card_off,
              size: 18,
              color: primaryCard != null
                  ? (primaryCard!.isLocked ? Colors.green.shade700 : Colors.orange.shade700)
                  : Colors.grey.shade600,
            ),
            const SizedBox(width: 6),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Thông tin thẻ:',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade600,
                  ),
                ),
                if (primaryCard != null) ...[
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        primaryCard!.isLocked ? Icons.lock : Icons.lock_open,
                        size: 12,
                        color: primaryCard!.isLocked
                            ? Colors.green.shade700
                            : Colors.orange.shade700,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        primaryCard!.isLocked ? 'Đang khóa' : 'Chưa khóa',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: primaryCard!.isLocked
                              ? Colors.green.shade900
                              : Colors.orange.shade900,
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  Text(
                    'Chưa có thẻ',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade700,
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.arrow_forward_ios,
              size: 12,
              color: Colors.grey.shade600,
            ),
          ],
        ),
      ),
    );
  }
}
