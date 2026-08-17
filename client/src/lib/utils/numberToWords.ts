export function numberToVietnameseWords(num: number): string {
  if (num === 0) return 'Không đồng chẵn.';

  const str = num.toString();
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const scales = ['', 'nghìn', 'triệu', 'tỉ', 'nghìn tỉ', 'triệu tỉ'];

  function readBlock(n: string, full: boolean = false): string {
    const a = parseInt(n[0]);
    const b = parseInt(n[1]);
    const c = parseInt(n[2]);
    let res = '';
    
    if (a !== 0 || full) res += digits[a] + ' trăm ';
    
    if (b === 0) {
      if (c !== 0) {
        if (a !== 0 || full) res += 'linh ';
        res += digits[c] + ' ';
      }
    } else if (b === 1) {
      res += 'mười ';
      if (c === 5) res += 'lăm ';
      else if (c !== 0) res += digits[c] + ' ';
    } else {
      res += digits[b] + ' mươi ';
      if (c === 1) res += 'mốt ';
      else if (c === 4) res += 'tư ';
      else if (c === 5) res += 'lăm ';
      else if (c !== 0) res += digits[c] + ' ';
    }
    
    return res;
  }

  let blocks: string[] = [];
  let current = str;
  while (current.length > 0) {
    blocks.unshift(current.slice(-3).padStart(3, '0'));
    current = current.slice(0, -3);
  }

  let result = '';
  for (let i = 0; i < blocks.length; i++) {
    const blockNum = parseInt(blocks[i]);
    if (blockNum !== 0) {
      const readPart = readBlock(blocks[i], i > 0);
      result += readPart + scales[blocks.length - 1 - i] + ' ';
    }
  }

  let finalString = result.trim().replace(/\s+/g, ' ');
  // Handle some edge cases where "không trăm linh" at the beginning is stripped
  if (finalString.startsWith('không trăm linh ')) {
    finalString = finalString.substring('không trăm linh '.length);
  } else if (finalString.startsWith('không trăm ')) {
    finalString = finalString.substring('không trăm '.length);
  }

  finalString = finalString.charAt(0).toUpperCase() + finalString.slice(1);
  return finalString + ' đồng chẵn.';
}
