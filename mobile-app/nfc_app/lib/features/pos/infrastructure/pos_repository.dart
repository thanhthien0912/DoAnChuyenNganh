import '../../../core/network/api_client.dart';
import '../domain/favorite_transaction.dart';
import '../domain/pos_category.dart';
import '../domain/pos_item.dart';
import '../domain/pos_transaction_request.dart';

class POSRepository {
  POSRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  final ApiClient _apiClient;

  Future<List<POSCategory>> getCategories() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/pos/categories');
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception('Failed to load POS categories');
    }

    final categoriesJson = data['data']?['categories'] as List<dynamic>? ?? [];
    return categoriesJson
        .map((json) => POSCategory.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<List<POSItem>> getItemsByCategory(String categoryKey) async {
    final response = await _apiClient.get<Map<String, dynamic>>(
      '/pos/categories/$categoryKey/items',
    );
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception('Failed to load POS items');
    }

    final itemsJson = data['data']?['items'] as List<dynamic>? ?? [];
    return itemsJson
        .map((json) => POSItem.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<Map<String, dynamic>> processTransaction(
    POSTransactionRequest request,
  ) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/pos/transaction',
      data: request.toJson(),
    );
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception(data?['error']?['message'] ?? 'Transaction failed');
    }

    return data['data'] as Map<String, dynamic>? ?? {};
  }

  Future<List<FavoriteTransaction>> getFavorites() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/pos/favorites');
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception('Failed to load favorite transactions');
    }

    final favoritesJson = data['data']?['favorites'] as List<dynamic>? ?? [];
    return favoritesJson
        .map((json) => FavoriteTransaction.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  Future<FavoriteTransaction> addFavorite(FavoriteTransaction favorite) async {
    final response = await _apiClient.post<Map<String, dynamic>>(
      '/pos/favorites',
      data: favorite.toJson(),
    );
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception('Failed to add favorite transaction');
    }

    final favoriteJson = data['data']?['favorite'] as Map<String, dynamic>?;
    if (favoriteJson == null) {
      throw Exception('Invalid response data');
    }

    return FavoriteTransaction.fromJson(favoriteJson);
  }

  Future<void> deleteFavorite(String id) async {
    final response = await _apiClient.delete<Map<String, dynamic>>(
      '/pos/favorites/$id',
    );
    final data = response.data;

    if (data == null || data['success'] != true) {
      throw Exception('Failed to delete favorite transaction');
    }
  }
}
