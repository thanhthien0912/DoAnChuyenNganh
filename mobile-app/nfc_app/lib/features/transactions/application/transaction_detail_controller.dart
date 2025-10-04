import 'package:hooks_riverpod/hooks_riverpod.dart';

import '../domain/transaction.dart';
import '../infrastructure/transaction_repository.dart';
import 'transaction_list_controller.dart';

final transactionDetailProvider = FutureProvider.family<TransactionItem, String>((ref, reference) {
  final repo = ref.watch(transactionRepositoryProvider);
  return repo.fetchByReference(reference);
});
