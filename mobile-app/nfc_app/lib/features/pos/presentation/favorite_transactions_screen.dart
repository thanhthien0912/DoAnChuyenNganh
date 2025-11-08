import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../shared/utils/currency_formatter.dart';
import '../../../shared/widgets/async_value_widget.dart';
import '../application/favorite_controller.dart';

class FavoriteTransactionsScreen extends ConsumerWidget {
  const FavoriteTransactionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesValue = ref.watch(favoritesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Giao dịch yêu thích'),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(favoritesProvider);
        },
        child: AsyncValueWidget(
          value: favoritesValue,
          builder: (favorites) {
            if (favorites.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.favorite_border, size: 64, color: Colors.grey),
                    SizedBox(height: 16),
                    Text(
                      'Chưa có giao dịch yêu thích',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              );
            }

            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: favorites.length,
              itemBuilder: (context, index) {
                final favorite = favorites[index];
                final item = favorite.itemDetails;

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      child: Text(favorite.quantity.toString()),
                    ),
                    title: Text(favorite.name),
                    subtitle: item != null
                        ? Text(
                            '${item.name} - ${formatCurrency(item.price, currency: 'VND')} x ${favorite.quantity}',
                          )
                        : Text('Tổng: ${formatCurrency(favorite.totalAmount, currency: 'VND')}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          formatCurrency(favorite.totalAmount, currency: 'VND'),
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                        ),
                        const SizedBox(width: 8),
                        PopupMenuButton<String>(
                          onSelected: (value) async {
                            if (value == 'use') {
                              if (item != null) {
                                context.push(
                                  '/pos/confirmation',
                                  extra: {
                                    'items': [
                                      {'item': item, 'quantity': favorite.quantity}
                                    ],
                                    'categoryKey': favorite.categoryKey,
                                    'totalAmount': favorite.totalAmount,
                                  },
                                );
                              }
                            } else if (value == 'delete') {
                              final confirmed = await showDialog<bool>(
                                context: context,
                                builder: (context) => AlertDialog(
                                  title: const Text('Xóa giao dịch yêu thích'),
                                  content: const Text(
                                    'Bạn có chắc chắn muốn xóa giao dịch này?',
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, false),
                                      child: const Text('Hủy'),
                                    ),
                                    TextButton(
                                      onPressed: () => Navigator.pop(context, true),
                                      child: const Text('Xóa'),
                                    ),
                                  ],
                                ),
                              );

                              if (confirmed == true) {
                                await ref
                                    .read(favoriteControllerProvider.notifier)
                                    .deleteFavorite(favorite.id);
                                ref.invalidate(favoritesProvider);
                              }
                            }
                          },
                          itemBuilder: (context) => [
                            const PopupMenuItem(
                              value: 'use',
                              child: Row(
                                children: [
                                  Icon(Icons.payment),
                                  SizedBox(width: 8),
                                  Text('Sử dụng'),
                                ],
                              ),
                            ),
                            const PopupMenuItem(
                              value: 'delete',
                              child: Row(
                                children: [
                                  Icon(Icons.delete),
                                  SizedBox(width: 8),
                                  Text('Xóa'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
