import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../domain/transaction.dart';
import '../infrastructure/transaction_repository.dart';

final transactionRepositoryProvider = Provider<TransactionRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return TransactionRepository(apiClient);
});

class TransactionFilter {
  const TransactionFilter({this.type, this.status, this.category, this.startDate, this.endDate});

  final String? type;
  final String? status;
  final String? category;
  final DateTime? startDate;
  final DateTime? endDate;

  TransactionFilter copyWith({
    String? type,
    String? status,
    String? category,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    return TransactionFilter(
      type: type ?? this.type,
      status: status ?? this.status,
      category: category ?? this.category,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
    );
  }
}

final transactionFilterProvider = StateProvider<TransactionFilter>((ref) => const TransactionFilter());

final transactionListProvider = AsyncNotifierProvider<TransactionListController, List<TransactionItem>>(() {
  return TransactionListController();
});

class TransactionListController extends AsyncNotifier<List<TransactionItem>> {
  @override
  Future<List<TransactionItem>> build() async {
    final repo = ref.watch(transactionRepositoryProvider);
    final filter = ref.watch(transactionFilterProvider);
    return repo.fetchTransactions(
      type: filter.type,
      status: filter.status,
      category: filter.category,
      startDate: filter.startDate,
      endDate: filter.endDate,
    );
  }

  Future<void> applyFilter(TransactionFilter filter) async {
    ref.read(transactionFilterProvider.notifier).state = filter;
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => build());
  }

  Future<void> refresh() async {
    state = await AsyncValue.guard(() => build());
  }
}
