import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
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
    await _apiClient.post<Map<String, dynamic>>(
      '/cards',
      data: {
        'uid': uid,
        if (alias != null) 'alias': alias,
        'makePrimary': makePrimary,
      },
    );
  }
}
