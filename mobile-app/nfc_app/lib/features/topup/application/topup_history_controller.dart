import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../domain/topup_request.dart';
import '../infrastructure/topup_repository.dart';
import 'topup_form_controller.dart';

final topupHistoryProvider = AsyncNotifierProvider<TopupHistoryController, List<TopupRequestItem>>(() {
  return TopupHistoryController();
});

class TopupHistoryController extends AsyncNotifier<List<TopupRequestItem>> {
  @override
  Future<List<TopupRequestItem>> build() async {
    final repo = ref.watch(topupRepositoryProvider);
    return repo.fetchRequests();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(topupRepositoryProvider);
      return repo.fetchRequests();
    });
  }
}
