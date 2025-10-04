import '../../../core/network/api_client.dart';
import '../../transactions/domain/transaction.dart';
import '../domain/home_summary.dart';

class HomeRepository {
  HomeRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<HomeSummary> fetchHomeSummary() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/wallet/home');
    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null) {
      throw const FormatException('Không đọc được dữ liệu trang chủ');
    }
    return HomeSummary.fromJson(data);
  }

  Future<List<TransactionItem>> fetchRecentTransactions() async {
    final summary = await fetchHomeSummary();
    return summary.recentTransactions;
  }
}
