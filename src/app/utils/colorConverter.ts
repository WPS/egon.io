export function rgbaToHex(rgba: string) {
  if (isValidHex(rgba)) {
    return rgba;
  }
  const [r, g, b, a] = rgba.match(/\d+(\.\d+)?/g)!.map((it) => +it);
  const red = r.toString(16).padStart(2, '0');
  const green = g.toString(16).padStart(2, '0');
  const blue = b.toString(16).padStart(2, '0');
  const alpha = Math.round(a * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${red}${green}${blue}${alpha}`;
}

const isValidHex = (hex: string) => /^#([A-Fa-f0-9]{3,4}){1,2}$/.test(hex);
const getChunksFromString = (st: string, chunkSize: number) =>
  st.match(new RegExp(`.{${chunkSize}}`, 'g')) ?? [];
const convertHexUnitTo256 = (hexStr: string) =>
  parseInt(hexStr.repeat(2 / hexStr.length), 16);
const getAlphafloat = (a: number | undefined) => {
  if (typeof a !== 'undefined') {
    return Math.round((a / 255 + Number.EPSILON) * 100) / 100; // Runden auf 2 oder weniger Nachkommastellen
  }
  return 1;
};

export const isHexWithAlpha = (hex: string | null | undefined) =>
  hex?.startsWith('#') && (hex?.length === 5 || hex?.length === 9);

export const hexToRGBA = (hex: string) => {
  if (!isValidHex(hex)) {
    throw new Error('Invalid HEX');
  }
  const chunkSize = Math.floor((hex.length - 1) / 3); // 1 falls hex 3-4 Stellen, 2 falls hex 6 oder 8 Stellen
  const hexArr = getChunksFromString(hex.slice(1), chunkSize);
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return `rgba(${r},${g},${b},${getAlphafloat(a)})`;
};
