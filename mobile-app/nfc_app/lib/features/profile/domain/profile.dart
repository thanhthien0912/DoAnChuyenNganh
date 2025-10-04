class UserProfile {
  const UserProfile({
    required this.studentId,
    required this.fullName,
    required this.email,
    required this.className,
    required this.accountStatus,
  });

  final String studentId;
  final String fullName;
  final String email;
  final String className;
  final String accountStatus;

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>?;
    final firstName = profile?['firstName']?.toString() ?? '';
    final lastName = profile?['lastName']?.toString() ?? '';

    return UserProfile(
      studentId: json['studentId']?.toString() ?? '',
      fullName: '$firstName $lastName'.trim(),
      email: json['email']?.toString() ?? '',
      className: profile?['className']?.toString() ?? 'Chưa cập nhật',
      accountStatus: json['isActive'] == true ? 'Đang hoạt động' : 'Bị khoá',
    );
  }
}
