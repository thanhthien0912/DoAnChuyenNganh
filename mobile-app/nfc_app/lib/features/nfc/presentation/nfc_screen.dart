import 'package:flutter/material.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../application/nfc_controller.dart';

class NfcScreen extends HookConsumerWidget {
  const NfcScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.watch(nfcControllerProvider.notifier);
    final state = ref.watch(nfcControllerProvider);
    final textController = useTextEditingController();
    final format = useState(WriteFormat.text);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Quản lý thẻ NFC'),
        actions: [
          IconButton(
            icon: const Icon(Icons.clear_all),
            onPressed: state.isProcessing ? null : controller.clearLog,
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: textController,
              decoration: const InputDecoration(
                labelText: 'Nội dung cần ghi vào thẻ',
                border: OutlineInputBorder(),
              ),
              maxLines: null,
            ),
            const SizedBox(height: 12),
            SegmentedButton<WriteFormat>(
              segments: const [
                ButtonSegment(value: WriteFormat.text, label: Text('Văn bản'), icon: Icon(Icons.short_text)),
                ButtonSegment(value: WriteFormat.url, label: Text('URL'), icon: Icon(Icons.link)),
              ],
              selected: {format.value},
              onSelectionChanged: (selection) {
                if (selection.isNotEmpty) {
                  format.value = selection.first;
                }
              },
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                ElevatedButton.icon(
                  onPressed: state.isProcessing ? null : controller.readTag,
                  icon: const Icon(Icons.nfc),
                  label: const Text('Đọc thẻ'),
                ),
                ElevatedButton.icon(
                  onPressed: state.isProcessing
                      ? null
                      : () => controller.writeTag(textController.text, format.value),
                  icon: const Icon(Icons.edit),
                  label: const Text('Ghi thẻ'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
                ),
                child: ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: state.log.length,
                  itemBuilder: (context, index) => Text(state.log[index]),
                ),
              ),
            ),
            if (state.isProcessing)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              )
          ],
        ),
      ),
    );
  }
}
