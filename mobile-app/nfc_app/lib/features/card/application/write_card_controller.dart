import 'package:flutter/services.dart';
import 'package:flutter_nfc_kit/flutter_nfc_kit.dart' as nfc;
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:ndef/ndef.dart' as ndef;

import '../../../core/providers.dart';
import '../../auth/application/auth_controller.dart';
import '../../auth/domain/auth_state.dart';
import '../domain/card_write_data.dart';
import '../infrastructure/card_repository.dart';

final cardRepositoryProvider = Provider<CardRepository>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return CardRepository(apiClient);
});

enum WriteCardStatus { idle, loading, writing, success, error }

class WriteCardState {
  const WriteCardState({
    this.status = WriteCardStatus.idle,
    this.cardData,
    this.errorMessage,
    this.log = const [],
  });

  final WriteCardStatus status;
  final CardWriteData? cardData;
  final String? errorMessage;
  final List<String> log;

  WriteCardState copyWith({
    WriteCardStatus? status,
    CardWriteData? cardData,
    String? errorMessage,
    List<String>? log,
    bool clearError = false,
  }) {
    return WriteCardState(
      status: status ?? this.status,
      cardData: cardData ?? this.cardData,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      log: log ?? this.log,
    );
  }
}

class WriteCardController extends StateNotifier<WriteCardState> {
  WriteCardController(this._ref) : super(const WriteCardState()) {
    // Listen to auth state changes to reset state on logout/login
    _ref.listen<AuthState>(authControllerProvider, (previous, next) {
      // Reset state when user logs out or changes
      if (previous?.user?.id != next.user?.id) {
        state = const WriteCardState();
      }
    });
  }

  final Ref _ref;

  CardRepository get _repository => _ref.read(cardRepositoryProvider);

  Future<void> loadCardData() async {
    if (state.status == WriteCardStatus.loading) return;

    state = state.copyWith(
      status: WriteCardStatus.loading,
      log: [...state.log, 'Đang tạo dữ liệu ghi thẻ...'],
    );

    try {
      final cardData = await _repository.generateWriteData();
      state = state.copyWith(
        status: WriteCardStatus.idle,
        cardData: cardData,
        log: [
          ...state.log,
          'Dữ liệu đã sẵn sàng!',
          'MSSV: ${cardData.studentId}',
          'Tên: ${cardData.fullName}',
          '---',
        ],
      );
    } catch (error) {
      state = state.copyWith(
        status: WriteCardStatus.error,
        errorMessage: 'Không thể tạo dữ liệu: $error',
        log: [...state.log, 'Lỗi: $error', '---'],
      );
    }
  }

  Future<void> writeCard() async {
    final cardData = state.cardData;
    if (cardData == null) {
      state = state.copyWith(
        errorMessage: 'Vui lòng tải dữ liệu trước',
        log: [...state.log, 'Lỗi: Chưa có dữ liệu ghi thẻ'],
      );
      return;
    }

    if (state.status == WriteCardStatus.writing) return;

    state = state.copyWith(
      status: WriteCardStatus.writing,
      log: [...state.log, 'Chạm thẻ NFC vào điện thoại...'],
    );

    try {
      // Poll for NFC tag
      final tag = await nfc.FlutterNfcKit.poll(
        timeout: const Duration(seconds: 10),
      );

      state = state.copyWith(
        log: [...state.log, 'Đã phát hiện thẻ: ${tag.type}', 'Đang ghi dữ liệu...'],
      );

      // Get UID from tag
      final uid = tag.id;

      // Write NDEF record with student card data
      final record = ndef.TextRecord(
        language: 'en',
        text: cardData.writeData,
      );

      await nfc.FlutterNfcKit.writeNDEFRecords([record]);

      state = state.copyWith(
        log: [
          ...state.log,
          'Ghi thẻ thành công!',
          'UID: $uid',
          'Đang liên kết thẻ với tài khoản...',
        ],
      );

      // Link card to user account
      try {
        await _repository.linkCard(
          uid: uid,
          alias: 'Thẻ sinh viên ${cardData.studentId}',
          makePrimary: true,
        );

        state = state.copyWith(
          status: WriteCardStatus.success,
          log: [
            ...state.log,
            'Liên kết thẻ thành công!',
            'Thẻ đã sẵn sàng sử dụng.',
            '---',
          ],
        );
      } catch (linkError) {
        state = state.copyWith(
          status: WriteCardStatus.success,
          log: [
            ...state.log,
            'Cảnh báo: Ghi thẻ thành công nhưng liên kết thất bại',
            'Vui lòng liên kết thủ công trong phần Quản lý thẻ',
            '---',
          ],
        );
      }
    } on PlatformException catch (error) {
      state = state.copyWith(
        status: WriteCardStatus.error,
        errorMessage: error.message ?? error.code,
        log: [...state.log, 'Lỗi NFC: ${error.message ?? error.code}', '---'],
      );
    } catch (error) {
      state = state.copyWith(
        status: WriteCardStatus.error,
        errorMessage: 'Lỗi ghi thẻ: $error',
        log: [...state.log, 'Lỗi ghi thẻ: $error', '---'],
      );
    } finally {
      try {
        await nfc.FlutterNfcKit.finish();
      } catch (_) {}
    }
  }

  void clearLog() {
    state = state.copyWith(log: []);
  }

  void reset() {
    state = const WriteCardState();
  }
}

final writeCardControllerProvider =
    StateNotifierProvider<WriteCardController, WriteCardState>((ref) {
  return WriteCardController(ref);
});
