import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../domain/auth_user.dart';

class AuthSession {
  const AuthSession({required this.user, required this.accessToken, required this.refreshToken});

  final AuthUser user;
  final String accessToken;
  final String refreshToken;
}

class AuthRepository {
  AuthRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<AuthSession> login({required String login, required String password}) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/auth/login',
      data: {
        'login': login,
        'password': password,
      },
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw const FormatException('Dữ liệu đăng nhập không hợp lệ');
    }

    final userJson = data['user'] as Map<String, dynamic>?;
    final tokens = data['tokens'] as Map<String, dynamic>?;
    if (userJson == null || tokens == null) {
      throw const FormatException('Thiếu thông tin người dùng hoặc token');
    }

    final accessToken = tokens['accessToken']?.toString();
    final refreshToken = tokens['refreshToken']?.toString();

    if (accessToken == null || refreshToken == null) {
      throw const FormatException('Token không hợp lệ');
    }

    return AuthSession(
      user: AuthUser.fromJson(userJson),
      accessToken: accessToken,
      refreshToken: refreshToken,
    );
  }

  Future<AuthUser> fetchProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/auth/profile');
    final data = response.data?['data'] as Map<String, dynamic>?;
    final user = data?['user'] as Map<String, dynamic>?;
    if (user == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        error: 'Không đọc được thông tin người dùng',
      );
    }
    return AuthUser.fromJson(user);
  }

  Future<void> logout({required String refreshToken}) async {
    await _apiClient.post<void>(
      '/auth/logout',
      data: {'refreshToken': refreshToken},
    );
  }
}
