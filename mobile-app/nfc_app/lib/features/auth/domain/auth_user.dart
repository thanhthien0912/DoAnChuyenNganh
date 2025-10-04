class AuthUser {
  const AuthUser({
    required this.id,
    required this.studentId,
    required this.email,
    required this.role,
    required this.isActive,
    this.firstName,
    this.lastName,
  });

  final String id;
  final String studentId;
  final String email;
  final String role;
  final bool isActive;
  final String? firstName;
  final String? lastName;

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    final profile = json['profile'] as Map<String, dynamic>?;
    return AuthUser(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'user',
      isActive: json['isActive'] == true,
      firstName: profile?['firstName']?.toString(),
      lastName: profile?['lastName']?.toString(),
    );
  }
}
