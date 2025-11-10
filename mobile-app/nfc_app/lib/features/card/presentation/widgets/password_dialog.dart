import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';

class PasswordDialog extends HookWidget {
  const PasswordDialog({
    super.key,
    required this.title,
    required this.message,
  });

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    final passwordController = useTextEditingController();
    final isObscure = useState(true);
    final isLoading = useState(false);

    return AlertDialog(
      title: Text(title),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(message),
          const SizedBox(height: 16),
          TextField(
            controller: passwordController,
            obscureText: isObscure.value,
            autofocus: true,
            decoration: InputDecoration(
              labelText: 'Mật khẩu tài khoản',
              border: const OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: Icon(
                  isObscure.value ? Icons.visibility : Icons.visibility_off,
                ),
                onPressed: () => isObscure.value = !isObscure.value,
              ),
            ),
            onSubmitted: (_) {
              if (passwordController.text.isNotEmpty) {
                Navigator.of(context).pop(passwordController.text);
              }
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: isLoading.value ? null : () => Navigator.of(context).pop(),
          child: const Text('Hủy'),
        ),
        FilledButton(
          onPressed: isLoading.value
              ? null
              : () {
                  if (passwordController.text.isEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Vui lòng nhập mật khẩu'),
                        backgroundColor: Colors.red,
                      ),
                    );
                    return;
                  }
                  Navigator.of(context).pop(passwordController.text);
                },
          child: const Text('Xác nhận'),
        ),
      ],
    );
  }

  static Future<String?> show(
    BuildContext context, {
    required String title,
    required String message,
  }) {
    return showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (context) => PasswordDialog(
        title: title,
        message: message,
      ),
    );
  }
}
