import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../domain/card_model.dart';
import '../domain/card_write_data.dart';

class CardRepository {
  CardRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<CardWriteData> generateWriteData() async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/cards/generate-write-data',
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        error: 'Không thể tạo dữ liệu ghi thẻ',
      );
    }

    return CardWriteData.fromJson(data);
  }

  Future<void> linkCard({
    required String uid,
    String? alias,
    bool makePrimary = false,
  }) async {
    try {
      await _apiClient.post<Map<String, dynamic>>(
        '/cards',
        data: {
          'uid': uid,
          if (alias != null) 'alias': alias,
          'makePrimary': makePrimary,
        },
      );
    } on DioException catch (e) {
      // Extract error message from response
      final errorMessage = e.response?.data?['error']?['message'] as String?;
      if (errorMessage != null && errorMessage.isNotEmpty) {
        throw Exception(errorMessage);
      }
      rethrow;
    }
  }

  Future<List<CardModel>> getUserCards() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/cards');

    final data = response.data?['data'] as List<dynamic>?;
    if (data == null) {
      throw DioException(
        requestOptions: response.requestOptions,
        error: 'Không thể tải danh sách thẻ',
      );
    }

    return data
        .map((json) => CardModel.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<CardModel> toggleCardLock({
    required String cardId,
    required bool lock,
    required String password,
  }) async {
    try {
      final response = await _apiClient.put<Map<String, dynamic>>(
        '/cards/$cardId/toggle-lock',
        data: {
          'lock': lock,
          'password': password,
        },
      );

      final data = response.data?['data'] as Map<String, dynamic>?;
      if (data == null) {
        throw DioException(
          requestOptions: response.requestOptions,
          error: 'Không thể thay đổi trạng thái khóa',
        );
      }

      return CardModel.fromJson(data);
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error']?['message'] as String?;
      if (errorMessage != null && errorMessage.isNotEmpty) {
        throw Exception(errorMessage);
      }
      rethrow;
    }
  }

  Future<void> deleteCard({
    required String cardId,
    required String password,
  }) async {
    try {
      await _apiClient.delete<Map<String, dynamic>>(
        '/cards/$cardId',
        data: {
          'password': password,
        },
      );
    } on DioException catch (e) {
      final errorMessage = e.response?.data?['error']?['message'] as String?;
      if (errorMessage != null && errorMessage.isNotEmpty) {
        throw Exception(errorMessage);
      }
      rethrow;
    }
  }
}
