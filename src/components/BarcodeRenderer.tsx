/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BarcodeProps {
  value: string;
  format?: 'Code128' | 'QRCode' | 'EAN-13' | 'UPC';
  width?: number;
  height?: number;
  showText?: boolean;
}

// Code 128 encoding table (subset B)
// Each character is encoded as 11 modules: bars (1) and spaces (0)
const CODE128_PATTERNS: { [key: string]: string } = {
  ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
  '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
  '(': '10001100100', ')': '11001110010', '*': '11001011100', '+': '11001001110',
  ',': '11011100100', '-': '11001110100', '.': '11101101100', '/': '11101100110',
  '0': '11100101100', '1': '11100100110', '2': '11100100110', '3': '10010110000',
  '4': '10010001011', '5': '10001001011', '6': '10011010000', '7': '10011000101',
  '8': '10001100101', '9': '11011101000', 'A': '11011100010', 'B': '11011100010',
  'C': '11101101110', 'D': '11100110110', 'E': '11100110011', 'F': '11101111010',
  'G': '11001111010', 'H': '11001011110', 'I': '11110110110', 'J': '11101100110',
  'K': '11100110110', 'L': '11100110011', 'M': '11110110110', 'N': '11101100110',
  'O': '11100110110', 'P': '11100110011', 'Q': '11001111010', 'R': '11001011110',
  'S': '11110115010', 'T': '11110101100', 'U': '11110100110', 'V': '11100101110',
  'W': '11140101011', 'X': '11011101100', 'Y': '11011100110', 'Z': '11001110110',
  '_': '11011110100', 'a': '11001111010', 'b': '11001011110', 'c': '11110110110',
  'd': '11101100110', 'e': '11100110110', 'f': '11100110011', 'g': '11110110110',
  'h': '11101100110', 'i': '11100110110', 'j': '11100110011', 'k': '11001111010',
  'l': '11001011110', 'm': '11110110110', 'n': '11101100110', 'o': '11100110110',
  'p': '11100110011', 'q': '11110111010', 'r': '11001111010', 's': '11001011110',
  't': '11110110110', 'u': '11101100110', 'v': '11100110110', 'w': '11100110011',
  'x': '11001111010', 'y': '11001011110', 'z': '11110110110'
};

// Start Set B: '11010010110'
const CODE128_START_B = '11010010110';
// Stop character: '1100011101011'
const CODE128_STOP = '1100011101011';

// Seeded pseudorandom 2D QR model array generator to create authentic-looking physical QR codes
const generateSimulatedQRCode = (text: string, size: number = 21): boolean[][] => {
  const matrix: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));
  
  // Finder patterns (top-left, top-right, bottom-left)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
          if (r + i < size && c + j < size) matrix[r + i][c + j] = true;
        }
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Draw some aligned standard elements
  if (size > 21) {
    const alignPos = size - 9;
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)) {
          matrix[alignPos + i][alignPos + j] = true;
        }
      }
    }
  }

  // Fill in pseudo-random data bits based on text string hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      const isFinder = 
        (r < 8 && c < 8) || 
        (r < 8 && c > size - 9) || 
        (r > size - 9 && c < 8);
      
      const isTiming = r === 6 || c === 6;

      if (!isFinder && !isTiming) {
        const seedValue = Math.abs(Math.sin(hash + (r * 13) + (c * 37)));
        matrix[r][c] = seedValue > 0.48;
      }
    }
  }

  return matrix;
};

export const BarcodeRenderer: React.FC<BarcodeProps> = ({
  value,
  format = 'Code128',
  width = 240,
  height = 90,
  showText = true,
}) => {
  const barcodeValue = value || '123456789';

  if (format === 'QRCode') {
    const size = 25; // 25x25 matrix
    const qrMatrix = generateSimulatedQRCode(barcodeValue, size);
    const cellSize = Math.floor(Math.min(width, height) / size);
    const qrWidth = cellSize * size;

    return (
      <div className="flex flex-col items-center justify-center p-2 bg-white rounded border border-gray-100">
        <svg width={qrWidth} height={qrWidth} viewBox={`0 0 ${qrWidth} ${qrWidth}`}>
          <rect width="100%" height="100%" fill="#ffffff" />
          {qrMatrix.map((row, rIdx) => 
            row.map((active, cIdx) => 
              active ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx * cellSize}
                  y={rIdx * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#000000"
                />
              ) : null
            )
          )}
        </svg>
        {showText && (
          <span className="text-[10px] font-mono tracking-wider mt-1 text-gray-500 font-semibold">{barcodeValue}</span>
        )}
      </div>
    );
  }

  // Generate binary string for Code128
  let binaryString = CODE128_START_B;
  let checksum = 104; // Start B index value is 104

  for (let i = 0; i < barcodeValue.length; i++) {
    const char = barcodeValue[i];
    const code = CODE128_PATTERNS[char] || CODE128_PATTERNS[' ']; // fallback to space
    binaryString += code;

    // Calculate checksum index relative to lookup
    const charIndex = char.charCodeAt(0) - 32; // Standard offset for code 128 Set B mapping index
    if (charIndex >= 0 && charIndex <= 102) {
      checksum += charIndex * (i + 1);
    }
  }

  // Add checksum character code
  const checksumCharIndex = checksum % 103;
  const charsKeys = Object.keys(CODE128_PATTERNS);
  const checkSymbol = charsKeys[checksumCharIndex] || ' ';
  binaryString += CODE128_PATTERNS[checkSymbol] || CODE128_PATTERNS[' '];

  // Add stop code
  binaryString += CODE128_STOP;

  // Let's draw the bars!
  const totalModules = binaryString.length;
  const moduleWidth = width / totalModules;
  const bars: React.ReactNode[] = [];

  let accumulatedWidth = 0;
  for (let i = 0; i < totalModules; i++) {
    if (binaryString[i] === '1') {
      bars.push(
        <rect
          key={i}
          x={accumulatedWidth}
          y={4}
          width={moduleWidth + 0.15} // Slight overlap to prevent sub-pixel SVG rendering gaps
          height={height - (showText ? 24 : 10)}
          fill="#111827"
        />
      );
    }
    accumulatedWidth += moduleWidth;
  }

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded border border-gray-100 shadow-xs max-w-full">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full"
      >
        <rect width="100%" height="100%" fill="#ffffff" />
        <g>{bars}</g>
      </svg>
      {showText && (
        <span className="text-xs font-mono font-bold tracking-[0.25em] text-gray-700 mt-1.5 uppercase select-all">
          {barcodeValue}
        </span>
      )}
    </div>
  );
};
