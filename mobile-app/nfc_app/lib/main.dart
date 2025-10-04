import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_hooks/flutter_hooks.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart' as nfc;
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:ndef/ndef.dart' as ndef;

void main() {
  runApp(const ProviderScope(child: NfcApp()));
}

enum WriteFormat {
  text,
  url,
}

class NfcApp extends StatelessWidget {
  const NfcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NFC Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      home: const NfcHomePage(),
    );
  }
}

class NfcState {
  const NfcState({
    this.isProcessing = false,
    this.log = const <String>[],
  });

  final bool isProcessing;
  final List<String> log;

  NfcState copyWith({bool? isProcessing, List<String>? log}) {
    return NfcState(
      isProcessing: isProcessing ?? this.isProcessing,
      log: log ?? this.log,
    );
  }
}

class NfcController extends StateNotifier<NfcState> {
  NfcController() : super(const NfcState());

  Future<void> readTag() async {
    if (state.isProcessing) return;
    state = state.copyWith(isProcessing: true);

    final logs = [...state.log, 'Đang chờ thẻ NFC...'];
    state = state.copyWith(log: logs);

    try {
      final tag = await nfc.FlutterNfcKit.poll(timeout: const Duration(seconds: 10));
      final newLogs = [...state.log, 'Đã phát hiện thẻ: ${tag.type}'];
      state = state.copyWith(log: newLogs);

      final records = await nfc.FlutterNfcKit.readNDEFRecords();

      if (records.isEmpty) {
        state = state.copyWith(log: [...state.log, 'Thẻ không chứa bản ghi NDEF.']);
      } else {
        for (final record in records) {
          state = state.copyWith(log: [...state.log, _describeRecord(record)]);
        }
      }
    } on PlatformException catch (error) {
      final message = error.message ?? error.code;
      state = state.copyWith(log: [...state.log, 'Lỗi NFC: $message']);
    } catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi đọc thẻ: $error']);
    } finally {
      try {
        await nfc.FlutterNfcKit.finish();
      } catch (_) {}
      state = state.copyWith(
        isProcessing: false,
        log: [...state.log, '---'],
      );
    }
  }

  Future<void> writeTag(String message, WriteFormat format) async {
    if (state.isProcessing) return;
    final trimmed = message.trim();
    if (trimmed.isEmpty) {
      state = state.copyWith(log: [...state.log, 'Nội dung không được để trống.']);
      return;
    }

    String payload = trimmed;
    if (format == WriteFormat.url) {
      try {
        payload = _normalizeUrl(trimmed);
      } on FormatException catch (error) {
        state = state.copyWith(log: [...state.log, 'URL không hợp lệ: ${error.message}.']);
        return;
      }
    }

    state = state.copyWith(isProcessing: true, log: [...state.log, 'Chạm thẻ để ghi NDEF...']);

    try {
      final tag = await nfc.FlutterNfcKit.poll(timeout: const Duration(seconds: 10));
      state = state.copyWith(log: [...state.log, 'Đã phát hiện thẻ: ${tag.type}']);

      await nfc.FlutterNfcKit.writeNDEFRecords([
        _buildRecord(payload, format),
      ]);

      final label = format == WriteFormat.text ? 'văn bản' : 'URL';
      state = state.copyWith(log: [...state.log, 'Ghi $label thành công: "$payload"']);
    } on PlatformException catch (error) {
      final message = error.message ?? error.code;
      state = state.copyWith(log: [...state.log, 'Lỗi NFC: $message']);
    } catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi ghi thẻ: $error']);
    } finally {
      try {
        await nfc.FlutterNfcKit.finish();
      } catch (_) {}
      state = state.copyWith(
        isProcessing: false,
        log: [...state.log, '---'],
      );
    }
  }

  void clearLog() {
    state = state.copyWith(log: const <String>[]);
  }

  ndef.NDEFRecord _buildRecord(String value, WriteFormat format) {
    switch (format) {
      case WriteFormat.text:
        return ndef.TextRecord(language: 'vi', text: value);
      case WriteFormat.url:
        return ndef.UriRecord.fromString(value);
    }
  }
}

final nfcControllerProvider = StateNotifierProvider<NfcController, NfcState>((ref) {
  return NfcController();
});

class NfcHomePage extends HookConsumerWidget {
  const NfcHomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final controller = ref.watch(nfcControllerProvider.notifier);
    final state = ref.watch(nfcControllerProvider);
    final textController = useTextEditingController();
    final writeFormat = useState(WriteFormat.text);

    return Scaffold(
      appBar: AppBar(
        title: const Text('NFC Reader & Writer'),
        actions: [
          IconButton(
            onPressed: state.isProcessing ? null : controller.clearLog,
            icon: const Icon(Icons.clear_all),
            tooltip: 'Xoá log',
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
                ButtonSegment(
                  value: WriteFormat.text,
                  icon: Icon(Icons.short_text),
                  label: Text('Văn bản'),
                ),
                ButtonSegment(
                  value: WriteFormat.url,
                  icon: Icon(Icons.link),
                  label: Text('URL'),
                ),
              ],
              selected: {writeFormat.value},
              onSelectionChanged: (selection) {
                if (selection.isNotEmpty) {
                  writeFormat.value = selection.first;
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
                  label: const Text('Đọc thẻ NFC'),
                ),
                ElevatedButton.icon(
                  onPressed: state.isProcessing
                      ? null
                      : () => controller.writeTag(textController.text, writeFormat.value),
                  icon: const Icon(Icons.edit),
                  label: const Text('Ghi vào thẻ'),
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
                  itemBuilder: (context, index) {
                    return Text(state.log[index]);
                  },
                ),
              ),
            ),
            if (state.isProcessing)
              const Padding(
                padding: EdgeInsets.only(top: 12),
                child: LinearProgressIndicator(),
              ),
          ],
        ),
      ),
    );
  }
}

String _describeRecord(ndef.NDEFRecord record) {
  if (record is ndef.TextRecord) {
    final language = record.language?.isNotEmpty == true ? ' (${record.language})' : '';
    final text = record.text ?? '';
    return 'Văn bản$language: $text';
  }
  if (record is ndef.UriRecord) {
    final uri = record.uriString ?? record.iriString ?? '';
    return 'URL: $uri';
  }
  return 'Bản ghi khác: ${record.runtimeType}';
}

String _normalizeUrl(String value) {
  final candidate = value.trim();
  final parsed = Uri.tryParse(candidate);
  if (parsed == null || parsed.path.isEmpty && parsed.host.isEmpty) {
    throw const FormatException('không thể phân tích URL');
  }
  if (parsed.hasScheme) {
    return parsed.toString();
  }
  final withScheme = Uri.parse('https://$candidate');
  if (withScheme.host.isEmpty) {
    throw const FormatException('không thể phân tích URL');
  }
  return withScheme.toString();
}
