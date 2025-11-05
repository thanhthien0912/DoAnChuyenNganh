class CardWriteData {
  const CardWriteData({
    required this.writeData,
    required this.studentId,
    required this.fullName,
    required this.cardId,
    required this.signature,
    required this.instructions,
  });

  final String writeData;
  final String studentId;
  final String fullName;
  final String cardId;
  final String signature;
  final List<String> instructions;

  factory CardWriteData.fromJson(Map<String, dynamic> json) {
    return CardWriteData(
      writeData: json['writeData']?.toString() ?? '',
      studentId: json['studentId']?.toString() ?? '',
      fullName: json['fullName']?.toString() ?? '',
      cardId: json['cardId']?.toString() ?? '',
      signature: json['signature']?.toString() ?? '',
      instructions: (json['instructions'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
    );
  }
}
