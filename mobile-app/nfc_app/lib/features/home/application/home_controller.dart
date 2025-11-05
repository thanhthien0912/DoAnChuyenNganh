import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/auth_state.dart';
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
    // Watch auth state to rebuild when user changes
    final authState = ref.watch(authControllerProvider);
    
    // Only fetch if authenticated
    if (authState.status != AuthStatus.authenticated) {
      throw Exception('Not authenticated');
    }
    
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
