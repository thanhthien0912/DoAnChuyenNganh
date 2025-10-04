import 'package:flutter/services.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart' as nfc;
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:ndef/ndef.dart' as ndef;

enum WriteFormat { text, url }

class NfcState {
  const NfcState({this.isProcessing = false, this.log = const <String>[]});

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
    state = state.copyWith(isProcessing: true, log: [...state.log, 'Đang chờ thẻ NFC...']);

    try {
      final tag = await nfc.FlutterNfcKit.poll(timeout: const Duration(seconds: 10));
      state = state.copyWith(log: [...state.log, 'Đã phát hiện thẻ: ${tag.type}']);

      final records = await nfc.FlutterNfcKit.readNDEFRecords();
      if (records.isEmpty) {
        state = state.copyWith(log: [...state.log, 'Thẻ không chứa bản ghi NDEF.']);
      } else {
        for (final record in records) {
          state = state.copyWith(log: [...state.log, _describeRecord(record)]);
        }
      }
    } on PlatformException catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi NFC: ${error.message ?? error.code}']);
    } catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi đọc thẻ: $error']);
    } finally {
      try {
        await nfc.FlutterNfcKit.finish();
      } catch (_) {}
      state = state.copyWith(isProcessing: false, log: [...state.log, '---']);
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
        state = state.copyWith(log: [...state.log, 'URL không hợp lệ: ${error.message}']);
        return;
      }
    }

    state = state.copyWith(isProcessing: true, log: [...state.log, 'Chạm thẻ để ghi NDEF...']);

    try {
      final tag = await nfc.FlutterNfcKit.poll(timeout: const Duration(seconds: 10));
      state = state.copyWith(log: [...state.log, 'Đã phát hiện thẻ: ${tag.type}']);

      await nfc.FlutterNfcKit.writeNDEFRecords([_buildRecord(payload, format)]);
      state = state.copyWith(log: [...state.log, 'Ghi thành công: $payload']);
    } on PlatformException catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi NFC: ${error.message ?? error.code}']);
    } catch (error) {
      state = state.copyWith(log: [...state.log, 'Lỗi ghi thẻ: $error']);
    } finally {
      try {
        await nfc.FlutterNfcKit.finish();
      } catch (_) {}
      state = state.copyWith(isProcessing: false, log: [...state.log, '---']);
    }
  }

  void clearLog() {
    state = state.copyWith(log: const []);
  }

  ndef.NDEFRecord _buildRecord(String value, WriteFormat format) {
    switch (format) {
      case WriteFormat.text:
        return ndef.TextRecord(language: 'vi', text: value);
      case WriteFormat.url:
        return ndef.UriRecord.fromString(value);
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
    if (parsed == null || (parsed.path.isEmpty && parsed.host.isEmpty)) {
      throw const FormatException('Không thể phân tích URL');
    }
    if (parsed.hasScheme) {
      return parsed.toString();
    }
    final withScheme = Uri.parse('https://$candidate');
    if (withScheme.host.isEmpty) {
      throw const FormatException('Không thể phân tích URL');
    }
    return withScheme.toString();
  }
}

final nfcControllerProvider = StateNotifierProvider<NfcController, NfcState>((ref) {
  return NfcController();
});
