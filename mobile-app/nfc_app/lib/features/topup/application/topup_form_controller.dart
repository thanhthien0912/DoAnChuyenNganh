import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../domain/topup_request.dart';
import '../infrastructure/topup_repository.dart';

class TopupFormState {
  const TopupFormState({
    this.isSubmitting = false,
    this.lastRequest,
    this.errorMessage,
  });

  final bool isSubmitting;
  final TopupRequestItem? lastRequest;
  final String? errorMessage;

  TopupFormState copyWith({
    bool? isSubmitting,
    TopupRequestItem? lastRequest,
    String? errorMessage,
  }) {
    return TopupFormState(
      isSubmitting: isSubmitting ?? this.isSubmitting,
      lastRequest: lastRequest ?? this.lastRequest,
      errorMessage: errorMessage,
    );
  }
}

final topupRepositoryProvider = Provider<TopupRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return TopupRepository(apiClient);
});

final topupFormControllerProvider = StateNotifierProvider<TopupFormController, TopupFormState>((ref) {
  return TopupFormController(ref.watch(topupRepositoryProvider));
});

class TopupFormController extends StateNotifier<TopupFormState> {
  TopupFormController(this._repository) : super(const TopupFormState());

  final TopupRepository _repository;

  Future<void> submit({required double amount, String method = 'MANUAL', String? note}) async {
    if (state.isSubmitting) return;
    state = state.copyWith(isSubmitting: true, errorMessage: null);

    try {
      final request = await _repository.createTopup(amount: amount, method: method, note: note);
      state = state.copyWith(isSubmitting: false, lastRequest: request);
    } catch (error) {
      state = state.copyWith(isSubmitting: false, errorMessage: error.toString());
    }
  }
}
