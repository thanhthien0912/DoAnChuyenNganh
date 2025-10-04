import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../domain/topup_request.dart';

class TopupRepository {
  TopupRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<TopupRequestItem> createTopup({required double amount, String method = 'MANUAL', String? note}) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/wallet/topups',
      data: {
        'amount': amount,
        'method': method,
        if (note != null && note.trim().isNotEmpty) 'note': note.trim(),
        'pinVerified': true,
      },
      options: Options(headers: {'x-pin-verified': 'true'}),
    );

    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw const FormatException('Không tạo được yêu cầu nạp tiền');
    }
    return TopupRequestItem.fromJson(data);
  }

  Future<List<TopupRequestItem>> fetchRequests() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/wallet/topups');
    final data = response.data?['data'] as Map<String, dynamic>?;
    final list = data?['requests'] as List<dynamic>?;
    if (list == null) {
      return const [];
    }
    return list
        .map((item) => TopupRequestItem.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
