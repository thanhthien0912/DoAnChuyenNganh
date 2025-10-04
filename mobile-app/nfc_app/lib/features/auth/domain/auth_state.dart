import 'auth_user.dart';

enum AuthStatus { unknown, authenticated, unauthenticated }

class AuthState {
  const AuthState({
    required this.status,
    this.user,
    this.isProcessing = false,
    this.errorMessage,
  });

  final AuthStatus status;
  final AuthUser? user;
  final bool isProcessing;
  final String? errorMessage;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  factory AuthState.unknown() => const AuthState(status: AuthStatus.unknown, isProcessing: true);

  factory AuthState.authenticated(AuthUser user) => AuthState(
        status: AuthStatus.authenticated,
        user: user,
        isProcessing: false,
        errorMessage: null,
      );

  factory AuthState.unauthenticated({bool isProcessing = false, String? errorMessage}) => AuthState(
        status: AuthStatus.unauthenticated,
        user: null,
        isProcessing: isProcessing,
        errorMessage: errorMessage,
      );

  AuthState copyWith({
    AuthStatus? status,
    AuthUser? user,
    bool? isProcessing,
    String? errorMessage,
    bool clearError = false,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      isProcessing: isProcessing ?? this.isProcessing,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
    );
  }
}
