import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../../shared/widgets/async_value_widget.dart';
import '../application/favorite_controller.dart';
import '../application/pos_controller.dart';
import '../domain/favorite_transaction.dart';
import '../domain/pos_category.dart';
import '../domain/pos_item.dart';

class POSCategoryScreen extends HookConsumerWidget {
  const POSCategoryScreen({
    super.key,
    required this.category,
  });

  final POSCategory category;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itemsValue = ref.watch(posItemsProvider(category.key));
    final selectedItems = useState<Map<String, int>>({});

    final totalAmount = useMemoized(() {
      double total = 0;
      selectedItems.value.forEach((itemId, quantity) {
        final item = itemsValue.value?.firstWhere(
          (item) => item.id == itemId,
          orElse: () => const POSItem(
            id: '',
            categoryKey: '',
            name: '',
            price: 0,
          ),
        );
        if (item != null && item.price > 0) {
          total += item.price * quantity;
        }
      });
      return total;
    }, [selectedItems.value, itemsValue.value]);

    final selectedCount = selectedItems.value.values.fold<int>(
      0,
      (sum, quantity) => sum + quantity,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(category.name),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(posItemsProvider(category.key));
        },
        child: AsyncValueWidget(
          value: itemsValue,
          builder: (items) {
            if (items.isEmpty) {
              return const Center(
                child: Text('Chưa có sản phẩm nào'),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                final quantity = selectedItems.value[item.id] ?? 0;

                return _ItemCard(
                  item: item,
                  quantity: quantity,
                  onQuantityChanged: (newQuantity) {
                    if (newQuantity <= 0) {
                      final updatedMap = Map<String, int>.from(selectedItems.value)
                        ..remove(item.id);
                      selectedItems.value = updatedMap;
                    } else {
                      selectedItems.value = {
                        ...selectedItems.value,
                        item.id: newQuantity,
                      };
                    }
                  },
                );
              },
            );
          },
        ),
      ),
      bottomNavigationBar: selectedCount > 0
          ? SafeArea(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tổng cộng ($selectedCount sản phẩm)',
                            style: Theme.of(context).textTheme.bodySmall,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formatCurrency(totalAmount, currency: 'VND'),
                            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton.outlined(
                      onPressed: () async {
                        if (selectedItems.value.isEmpty) return;

                        final nameController = TextEditingController();
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            title: const Text('Lưu làm yêu thích'),
                            content: TextField(
                              controller: nameController,
                              decoration: const InputDecoration(
                                labelText: 'Tên giao dịch',
                                hintText: 'VD: Cơm sườn + nước',
                              ),
                              autofocus: true,
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: const Text('Hủy'),
                              ),
                              TextButton(
                                onPressed: () {
                                  if (nameController.text.trim().isEmpty) return;
                                  Navigator.pop(context, true);
                                },
                                child: const Text('Lưu'),
                              ),
                            ],
                          ),
                        );

                        if (confirmed == true && nameController.text.trim().isNotEmpty) {
                          final firstEntry = selectedItems.value.entries.first;
                          final item = itemsValue.value?.firstWhere(
                            (item) => item.id == firstEntry.key,
                          );

                          if (item != null) {
                            final favorite = FavoriteTransaction(
                              id: '',
                              userId: '',
                              name: nameController.text.trim(),
                              categoryKey: category.key,
                              itemId: item.id,
                              quantity: firstEntry.value,
                              totalAmount: totalAmount,
                            );

                            await ref.read(favoriteControllerProvider.notifier).addFavorite(favorite);
                            ref.invalidate(favoritesProvider);

                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Đã lưu giao dịch yêu thích'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                          }
                        }
                      },
                      icon: const Icon(Icons.favorite_border),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      onPressed: () {
                        final selectedItemsList = selectedItems.value.entries
                            .map((entry) {
                              final item = itemsValue.value?.firstWhere(
                                (item) => item.id == entry.key,
                              );
                              return item != null
                                  ? {'item': item, 'quantity': entry.value}
                                  : null;
                            })
                            .whereType<Map<String, dynamic>>()
                            .toList();

                        context.push(
                          '/pos/confirmation',
                          extra: {
                            'items': selectedItemsList,
                            'categoryKey': category.key,
                            'totalAmount': totalAmount,
                          },
                        );
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        child: Text('Thanh toán'),
                      ),
                    ),
                  ],
                ),
              ),
            )
          : null,
    );
  }
}

class _ItemCard extends StatelessWidget {
  const _ItemCard({
    required this.item,
    required this.quantity,
    required this.onQuantityChanged,
  });

  final POSItem item;
  final int quantity;
  final ValueChanged<int> onQuantityChanged;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  if (item.description != null && item.description!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      item.description!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                  const SizedBox(height: 8),
                  Text(
                    formatCurrency(item.price, currency: 'VND'),
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            if (quantity == 0)
              IconButton.filled(
                onPressed: () => onQuantityChanged(1),
                icon: const Icon(Icons.add),
              )
            else
              Row(
                children: [
                  IconButton(
                    onPressed: () => onQuantityChanged(quantity - 1),
                    icon: const Icon(Icons.remove),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      quantity.toString(),
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => onQuantityChanged(quantity + 1),
                    icon: const Icon(Icons.add),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
