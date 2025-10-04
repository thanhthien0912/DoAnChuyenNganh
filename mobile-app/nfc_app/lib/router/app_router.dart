import 'package:go_router/go_router.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../features/auth/application/auth_controller.dart';
import '../features/auth/domain/auth_state.dart';
import '../features/auth/presentation/login_screen.dart';
import '../features/auth/presentation/splash_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/nfc/presentation/nfc_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/topup/presentation/topup_screen.dart';
import '../features/transactions/presentation/transaction_detail_screen.dart';
import '../features/transactions/presentation/transactions_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final status = authState.status;
      final location = state.uri.path;
      final isLoggingIn = location == '/login';
      final isSplash = location == '/splash';

      if (status == AuthStatus.unknown) {
        return isSplash ? null : '/splash';
      }

      if (status == AuthStatus.unauthenticated) {
        return isLoggingIn ? null : '/login';
      }

      if (status == AuthStatus.authenticated) {
        if (isLoggingIn || isSplash) {
          return '/home';
        }
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: '/topup',
        name: 'topup',
        builder: (context, state) => const TopupScreen(),
      ),
      GoRoute(
        path: '/transactions',
        name: 'transactions',
        builder: (context, state) => const TransactionsScreen(),
        routes: [
          GoRoute(
            path: ':reference',
            name: 'transaction-detail',
            builder: (context, state) {
              final reference = state.pathParameters['reference'] ?? '';
              return TransactionDetailScreen(referenceNumber: reference);
            },
          ),
        ],
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/nfc',
        name: 'nfc',
        builder: (context, state) => const NfcScreen(),
      ),
    ],
  );
});
