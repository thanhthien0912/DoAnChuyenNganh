import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../domain/card_model.dart';
import '../infrastructure/card_repository.dart';

final cardRepositoryProvider = Provider<CardRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CardRepository(apiClient);
});

final cardListControllerProvider =
    AsyncNotifierProvider<CardListController, List<CardModel>>(() {
  return CardListController();
});

class CardListController extends AsyncNotifier<List<CardModel>> {
  CardRepository get _repository => ref.read(cardRepositoryProvider);

  @override
  Future<List<CardModel>> build() async {
    return _repository.getUserCards();
  }

  Future<void> refresh() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      return _repository.getUserCards();
    });
  }

  Future<void> toggleLock({
    required String cardId,
    required bool lock,
    required String password,
  }) async {
    // Perform toggle - let error propagate if it fails
    await _repository.toggleCardLock(
      cardId: cardId,
      lock: lock,
      password: password,
    );
    
    // Toggle succeeded - now silently refresh the list
    // Don't let refresh errors affect state
    try {
      final cards = await _repository.getUserCards();
      state = AsyncValue.data(cards);
    } catch (e) {
      // Refresh failed but toggle succeeded
      // Update the card's lock status in current state manually
      final currentState = state;
      if (currentState is AsyncData<List<CardModel>>) {
        final updatedCards = currentState.value.map((card) {
          if (card.id == cardId) {
            return CardModel(
              id: card.id,
              uid: card.uid,
              alias: card.alias,
              status: card.status,
              isPrimary: card.isPrimary,
              isLocked: lock,
              linkedAt: card.linkedAt,
              lastUsedAt: card.lastUsedAt,
              lockedAt: lock ? DateTime.now() : null,
            );
          }
          return card;
        }).toList();
        state = AsyncValue.data(updatedCards);
      }
      print('Silent refresh failed after toggle: $e');
    }
  }

  Future<void> deleteCard({
    required String cardId,
    required String password,
  }) async {
    // Perform delete - let error propagate if it fails
    await _repository.deleteCard(
      cardId: cardId,
      password: password,
    );
    
    // Delete succeeded - now silently refresh the list
    // Don't let refresh errors affect state
    try {
      final cards = await _repository.getUserCards();
      state = AsyncValue.data(cards);
    } catch (e) {
      // Refresh failed but delete succeeded
      // Remove the card from current state manually
      final currentState = state;
      if (currentState is AsyncData<List<CardModel>>) {
        final updatedCards = currentState.value
            .where((card) => card.id != cardId)
            .toList();
        state = AsyncValue.data(updatedCards);
      }
      print('Silent refresh failed after delete: $e');
    }
  }
}
