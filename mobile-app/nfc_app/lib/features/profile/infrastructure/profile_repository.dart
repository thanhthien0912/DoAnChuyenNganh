import '../../../core/network/api_client.dart';
import '../domain/profile.dart';

class ProfileRepository {
  ProfileRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<UserProfile> fetchProfile() async {
    final response = await _apiClient.get<Map<String, dynamic>>('/auth/profile');
    final data = response.data?['data'] as Map<String, dynamic>?;
    if (data == null || data['user'] == null) {
      throw const FormatException('Không đọc được dữ liệu hồ sơ');
    }
    return UserProfile.fromJson(data['user'] as Map<String, dynamic>);
  }
}
