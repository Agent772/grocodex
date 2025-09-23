// EAN-8 checksum validation utility
// Returns true if the code is a valid EAN-8 barcode (length 8, all digits, correct checksum)

export function isValidEAN8(barcode: string): boolean {
    if (!/^[0-9]{8}$/.test(barcode)) return false;
    const digits = barcode.split('').map(Number);
    // EAN-8 checksum: sum of digits in odd positions (except last) * 3 + sum of digits in even positions (except last)
    let sum = 0;
    for (let i = 0; i < 7; i++) {
        sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return digits[7] === checksum;
}

// EAN-13 checksum validation utility
export function isValidEAN13(barcode: string): boolean {
    if (!/^[0-9]{13}$/.test(barcode)) return false;
    const digits = barcode.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += digits[i] * (i % 2 === 0 ? 1 : 3);
    }
    const checksum = (10 - (sum % 10)) % 10;
    return digits[12] === checksum;
}
