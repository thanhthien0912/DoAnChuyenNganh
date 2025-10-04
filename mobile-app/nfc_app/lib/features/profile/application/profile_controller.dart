import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../domain/profile.dart';
import '../infrastructure/profile_repository.dart';

final profileRepositoryProvider = Provider<ProfileRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return ProfileRepository(apiClient);
});

final profileControllerProvider = FutureProvider<UserProfile>((ref) {
  final repository = ref.watch(profileRepositoryProvider);
  return repository.fetchProfile();
});
