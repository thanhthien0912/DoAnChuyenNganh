import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../application/profile_controller.dart';
import '../../auth/application/auth_controller.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final profileValue = ref.watch(profileControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Thông tin cá nhân')),
      body: profileValue.when(
        data: (profile) {
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              CircleAvatar(
                radius: 40,
                child: Text(profile.fullName.isNotEmpty ? profile.fullName[0] : '?'),
              ),
              const SizedBox(height: 16),
              Center(
                child: Text(
                  profile.fullName,
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
              ),
              const SizedBox(height: 24),
              _InfoTile(label: 'MSSV', value: profile.studentId),
              _InfoTile(label: 'Email', value: profile.email),
              _InfoTile(label: 'Lớp', value: profile.className),
              _InfoTile(label: 'Trạng thái', value: profile.accountStatus),
              const SizedBox(height: 24),
              FilledButton.icon(
                onPressed: () => ref.read(authControllerProvider.notifier).logout(),
                icon: const Icon(Icons.logout),
                label: const Text('Đăng xuất'),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(child: Text(error.toString())),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(label),
        subtitle: Text(value.isNotEmpty ? value : 'Chưa cập nhật'),
      ),
    );
  }
}
