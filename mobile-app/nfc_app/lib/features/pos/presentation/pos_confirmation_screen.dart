import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart' as nfc;
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../home/application/home_controller.dart';
import '../application/pos_controller.dart';
import '../domain/pos_item.dart';
import '../domain/pos_transaction_request.dart';

class POSConfirmationScreen extends HookConsumerWidget {
  const POSConfirmationScreen({
    super.key,
    required this.items,
    required this.categoryKey,
    required this.totalAmount,
  });

  final List<Map<String, dynamic>> items;
  final String categoryKey;
  final double totalAmount;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isProcessing = useState(false);
    final statusMessage = useState<String>('');
    final hasScanned = useState(false);

    Future<void> handleNFCPayment() async {
      if (isProcessing.value || hasScanned.value) return;

      isProcessing.value = true;
      statusMessage.value = 'Vui lòng đưa thẻ sinh viên gần điện thoại...';

      try {
        final tag = await nfc.FlutterNfcKit.poll(
          timeout: const Duration(seconds: 30),
        );

        statusMessage.value = 'Đã phát hiện thẻ NFC. Đang xử lý thanh toán...';
        hasScanned.value = true;

        final nfcData = {
          'deviceId': tag.id,
          'terminalId': 'MOBILE_POS',
          'transactionId': DateTime.now().millisecondsSinceEpoch.toString(),
          'timestamp': DateTime.now().toIso8601String(),
        };

        // Process each item as a separate transaction or combine them
        if (items.length == 1) {
          final itemData = items.first;
          final item = itemData['item'] as POSItem;
          final quantity = itemData['quantity'] as int;

          print('DEBUG - Item ID: ${item.id}');
          print('DEBUG - Quantity: $quantity');
          print('DEBUG - Category Key: $categoryKey');
          print('DEBUG - NFC Data: $nfcData');

          final request = POSTransactionRequest(
            itemId: item.id,
            quantity: quantity,
            categoryKey: categoryKey,
            nfcData: nfcData,
          );

          print('DEBUG - Request JSON: ${request.toJson()}');

          await ref.read(posControllerProvider.notifier).processTransaction(request);
        } else {
          // For multiple items, combine into one transaction with the first item
          // (or you could loop and create multiple transactions)
          final itemData = items.first;
          final item = itemData['item'] as POSItem;
          final totalQuantity = items.fold<int>(
            0,
            (sum, itemData) => sum + (itemData['quantity'] as int),
          );

          final request = POSTransactionRequest(
            itemId: item.id,
            quantity: totalQuantity,
            categoryKey: categoryKey,
            nfcData: nfcData,
          );

          await ref.read(posControllerProvider.notifier).processTransaction(request);
        }

        final result = ref.read(posControllerProvider);

        result.when(
          data: (data) {
            statusMessage.value = 'Thanh toán thành công!';
            ref.invalidate(homeControllerProvider);

            Future.delayed(const Duration(seconds: 1), () {
              if (context.mounted) {
                context.go('/home');
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Thanh toán thành công!'),
                    backgroundColor: Colors.green,
                  ),
                );
              }
            });
          },
          error: (error, stack) {
            statusMessage.value = 'Lỗi: ${error.toString()}';
            hasScanned.value = false;
          },
          loading: () {},
        );
      } on PlatformException catch (error) {
        statusMessage.value = 'Lỗi NFC: ${error.message ?? error.code}';
        hasScanned.value = false;
      } catch (error) {
        statusMessage.value = 'Lỗi: ${error.toString()}';
        hasScanned.value = false;
      } finally {
        try {
          await nfc.FlutterNfcKit.finish();
        } catch (_) {}
        isProcessing.value = false;
      }
    }

    useEffect(() {
      Future.delayed(const Duration(milliseconds: 500), handleNFCPayment);
      return null;
    }, []);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Xác nhận thanh toán'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Chi tiết đơn hàng',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 16),
                    ...items.map((itemData) {
                      final item = itemData['item'] as POSItem;
                      final quantity = itemData['quantity'] as int;
                      final itemTotal = item.price * quantity;

                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('${item.name} x$quantity'),
                            ),
                            Text(
                              formatCurrency(itemTotal, currency: 'VND'),
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ],
                        ),
                      );
                    }),
                    const Divider(height: 24),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'Tổng cộng',
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ),
                        Text(
                          formatCurrency(totalAmount, currency: 'VND'),
                          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (isProcessing.value)
                      const CircularProgressIndicator()
                    else if (hasScanned.value && statusMessage.value.contains('thành công'))
                      const Icon(
                        Icons.check_circle,
                        color: Colors.green,
                        size: 80,
                      )
                    else if (statusMessage.value.contains('Lỗi'))
                      const Icon(
                        Icons.error,
                        color: Colors.red,
                        size: 80,
                      )
                    else
                      Icon(
                        Icons.nfc,
                        size: 80,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    const SizedBox(height: 24),
                    Text(
                      statusMessage.value.isNotEmpty
                          ? statusMessage.value
                          : 'Đang khởi tạo...',
                      style: Theme.of(context).textTheme.titleMedium,
                      textAlign: TextAlign.center,
                    ),
                    if (!isProcessing.value && !hasScanned.value && statusMessage.value.contains('Lỗi')) ...[
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: handleNFCPayment,
                        icon: const Icon(Icons.refresh),
                        label: const Text('Thử lại'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
