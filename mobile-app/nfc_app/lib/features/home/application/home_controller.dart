import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../domain/home_summary.dart';
import '../infrastructure/home_repository.dart';

final homeRepositoryProvider = Provider<HomeRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return HomeRepository(apiClient);
});

final homeControllerProvider = AsyncNotifierProvider<HomeController, HomeSummary>(() {
  return HomeController();
});

class HomeController extends AsyncNotifier<HomeSummary> {
  @override
  Future<HomeSummary> build() async {
    final repo = ref.watch(homeRepositoryProvider);
    return repo.fetchHomeSummary();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repo = ref.read(homeRepositoryProvider);
      return repo.fetchHomeSummary();
    });
  }
}
