import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/auth_state.dart';
import '../domain/profile.dart';
import '../infrastructure/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProfileRepository(apiClient);
});

final profileControllerProvider = AsyncNotifierProvider<ProfileController, UserProfile>(() {
  return ProfileController();
});

class ProfileController extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() async {
    // Watch auth state to rebuild when user changes
    final authState = ref.watch(authControllerProvider);
    
    // Only fetch if authenticated
    if (authState.status != AuthStatus.authenticated) {
      throw Exception('Not authenticated');
    }
    
    final repository = ref.watch(profileRepositoryProvider);
    return repository.fetchProfile();
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final repository = ref.read(profileRepositoryProvider);
      return repository.fetchProfile();
    });
  }
}
