import 'package:dio/dio.dart';

import '../../../core/network/api_client.dart';
import '../domain/transaction.dart';

class TransactionRepository {
  TransactionRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<TransactionItem>> fetchTransactions({
    int page = 1,
    int limit = 20,
    String? type,
    String? status,
    String? category,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/transactions/history',
      queryParameters: {
        'page': page,
        'limit': limit,
        if (type != null && type.isNotEmpty) 'type': type,
        if (status != null && status.isNotEmpty) 'status': status,
        if (category != null && category.isNotEmpty) 'category': category,
        if (startDate != null) 'startDate': startDate.toIso8601String(),
        if (endDate != null) 'endDate': endDate.toIso8601String(),
      },
    );
    final data = response.data?['data'] as Map<String, dynamic>?;
    final list = data?['transactions'] as List<dynamic>?;
    if (list == null) {
      return const [];
    }
    return list.map((item) => TransactionItem.fromJson(item as Map<String, dynamic>)).toList();
  }

  Future<TransactionItem> fetchByReference(String referenceNumber) async {
    final response = await _apiClient.get<Map<String, dynamic>>('/transactions/reference/$referenceNumber');
    final data = response.data?['data'] as Map<String, dynamic>?;
    final transaction = data?['transaction'] as Map<String, dynamic>?;
    if (transaction == null) {
      throw DioException(requestOptions: RequestOptions(path: ''), error: 'Không tìm thấy giao dịch');
    }
    return TransactionItem.fromJson(transaction);
  }
}
