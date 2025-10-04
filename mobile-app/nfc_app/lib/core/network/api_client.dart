import 'dart:async';

import 'package:dio/dio.dart';

import '../storage/token_storage.dart';

class ApiClient {
  ApiClient({required Dio dio, required TokenStorage tokenStorage})
      : _dio = dio,
        _tokenStorage = tokenStorage {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await _tokenStorage.readAccessToken();
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401) {
          final refreshed = await _refreshToken();
          if (refreshed) {
            final requestOptions = error.requestOptions;
            final cloned = await _retry(requestOptions);
            handler.resolve(cloned);
            return;
          }
        }
        handler.next(error);
      },
    ));
  }

  final Dio _dio;
  final TokenStorage _tokenStorage;

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> post<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<Response<T>> patch<T>(
    String path, {
    Object? data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await _tokenStorage.readRefreshToken();
    if (refreshToken == null || refreshToken.isEmpty) {
      return false;
    }

    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/auth/refresh-token',
        data: {'refreshToken': refreshToken},
        options: Options(headers: {'Authorization': null}),
      );

      final tokens = response.data?['data']?['tokens'] as Map<String, dynamic>?;
      if (tokens == null) {
        return false;
      }

      final newAccess = tokens['accessToken'] as String?;
      final newRefresh = tokens['refreshToken'] as String? ?? refreshToken;

      if (newAccess == null) {
        return false;
      }

      await _tokenStorage.saveTokens(accessToken: newAccess, refreshToken: newRefresh);
      return true;
    } catch (_) {
      await _tokenStorage.clear();
      return false;
    }
  }

  Future<Response<dynamic>> _retry(RequestOptions requestOptions) {
    final options = Options(
      method: requestOptions.method,
      headers: requestOptions.headers,
      contentType: requestOptions.contentType,
      responseType: requestOptions.responseType,
      followRedirects: requestOptions.followRedirects,
      validateStatus: requestOptions.validateStatus,
      receiveDataWhenStatusError: requestOptions.receiveDataWhenStatusError,
    );

    return _dio.request<dynamic>(
      requestOptions.path,
      data: requestOptions.data,
      queryParameters: requestOptions.queryParameters,
      options: options,
      cancelToken: requestOptions.cancelToken,
      onReceiveProgress: requestOptions.onReceiveProgress,
      onSendProgress: requestOptions.onSendProgress,
    );
  }
}
