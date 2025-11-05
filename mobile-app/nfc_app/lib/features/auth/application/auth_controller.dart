import 'package:dio/dio.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../../../core/providers.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/auth_state.dart';
import '../domain/auth_user.dart';
import '../infrastructure/auth_repository.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return AuthRepository(apiClient);
});

final authControllerProvider = StateNotifierProvider<AuthController, AuthState>((ref) {
  return AuthController(ref);
});

class AuthController extends StateNotifier<AuthState> {
  AuthController(this._ref) : super(AuthState.unknown()) {
    _restoreSession();
  }

  final Ref _ref;

  TokenStorage get _tokenStorage => _ref.read(tokenStorageProvider);
  AuthRepository get _repository => _ref.read(authRepositoryProvider);

  Future<void> _restoreSession() async {
    try {
      final accessToken = await _tokenStorage.readAccessToken();
      final refreshToken = await _tokenStorage.readRefreshToken();

      if (accessToken == null || accessToken.isEmpty || refreshToken == null || refreshToken.isEmpty) {
        state = AuthState.unauthenticated();
        return;
      }

      state = const AuthState(status: AuthStatus.unknown, isProcessing: true);
      final user = await _repository.fetchProfile();
      state = AuthState.authenticated(user);
    } catch (error) {
      await _tokenStorage.clear();
      state = AuthState.unauthenticated();
    }
  }

  Future<void> login({required String login, required String password}) async {
    state = AuthState.unauthenticated(isProcessing: true);

    try {
      final session = await _repository.login(login: login, password: password);
      await _tokenStorage.saveTokens(
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
      );
      state = AuthState.authenticated(session.user);
    } on DioException catch (error) {
      final message = error.response?.data?['error']?['message']?.toString() ?? 'Đăng nhập thất bại';
      state = AuthState.unauthenticated(errorMessage: message);
    } on FormatException catch (error) {
      state = AuthState.unauthenticated(errorMessage: error.message);
    } catch (_) {
      state = AuthState.unauthenticated(errorMessage: 'Không thể đăng nhập, vui lòng thử lại');
    }
  }

  Future<void> logout() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    try {
      if (refreshToken != null && refreshToken.isNotEmpty) {
        await _repository.logout(refreshToken: refreshToken);
      }
    } catch (_) {
      // ignore logout errors
    } finally {
      await _tokenStorage.clear();
      
      // Invalidate all providers to reset state
      _ref.invalidate(apiClientProvider);
      
      state = AuthState.unauthenticated();
    }
  }

  void clearError() {
    if (state.errorMessage != null) {
      state = state.copyWith(clearError: true);
    }
  }

  AuthUser? get currentUser => state.user;
}
