import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../../../core/providers.dart';
import '../domain/pos_category.dart';
import '../domain/pos_item.dart';
import '../domain/pos_transaction_request.dart';
import '../infrastructure/pos_repository.dart';

final posRepositoryProvider = Provider<POSRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return POSRepository(apiClient: apiClient);
});

final posCategoriesProvider = FutureProvider<List<POSCategory>>((ref) async {
  final repository = ref.watch(posRepositoryProvider);
  return repository.getCategories();
});

final posItemsProvider =
    FutureProvider.family<List<POSItem>, String>((ref, categoryKey) async {
  final repository = ref.watch(posRepositoryProvider);
  return repository.getItemsByCategory(categoryKey);
});

class POSController extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  POSController({required this.repository}) : super(const AsyncValue.loading());

  final POSRepository repository;

  Future<void> processTransaction(POSTransactionRequest request) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return await repository.processTransaction(request);
    });
  }

  void reset() {
    state = const AsyncValue.loading();
  }
}

final posControllerProvider =
    StateNotifierProvider<POSController, AsyncValue<Map<String, dynamic>>>(
  (ref) {
    final repository = ref.watch(posRepositoryProvider);
    return POSController(repository: repository);
  },
);
