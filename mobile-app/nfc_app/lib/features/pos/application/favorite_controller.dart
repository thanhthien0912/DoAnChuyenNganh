import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../domain/favorite_transaction.dart';
import '../infrastructure/pos_repository.dart';
import 'pos_controller.dart';

final favoritesProvider = FutureProvider<List<FavoriteTransaction>>((ref) async {
  final repository = ref.watch(posRepositoryProvider);
  return repository.getFavorites();
});

class FavoriteController extends StateNotifier<AsyncValue<void>> {
  FavoriteController({required this.repository}) : super(const AsyncValue.data(null));

  final POSRepository repository;

  Future<void> addFavorite(FavoriteTransaction favorite) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await repository.addFavorite(favorite);
    });
  }

  Future<void> deleteFavorite(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await repository.deleteFavorite(id);
    });
  }
}

final favoriteControllerProvider = StateNotifierProvider<FavoriteController, AsyncValue<void>>(
  (ref) {
    final repository = ref.watch(posRepositoryProvider);
    return FavoriteController(repository: repository);
  },
);
