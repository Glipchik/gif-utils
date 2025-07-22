export const createMinimalGif89a = (): Uint8Array => {
  // Minimal valid GIF89a: Header + LSD + no color table + trailer
  return new Uint8Array([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61, // Header: GIF89a

    0x01,
    0x00,
    0x01,
    0x00, // Logical Screen Width & Height: 1x1

    0x00, // Packed Fields: no GCT
    0x00, // Background Color Index
    0x00, // Pixel Aspect Ratio
    0x3b, // Trailer
  ]);
};

export const createGif89aWithGlobalColorTable = (): Uint8Array => {
  return new Uint8Array([
    0x47,
    0x49,
    0x46,
    0x38,
    0x39,
    0x61, // Header: GIF89a
    0x01,
    0x00,
    0x01,
    0x00, // Logical Screen Width & Height: 1x1
    0b10000000, // Packed Fields: GCT flag ON, size = 2^(0+1)=2 entries
    0x00, // Background Color Index
    0x00, // Pixel Aspect Ratio

    // Global Color Table (2 entries * 3 bytes each)
    0x00,
    0x00,
    0x00, // First color: Black (R=0,G=0,B=0)
    0xff,
    0xff,
    0xff, // Second color: White (R=255,G=255,B=255)

    0x3b, // Trailer
  ]);
};

export const createGif89aWithOneFrame = (): Uint8Array => {
  return new Uint8Array([
    // GIF Header (GIF89a)
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61,

    // Logical Screen Descriptor (2x2 pixel)
    0x02, 0x00, // Width: 2
    0x02, 0x00, // Height: 2
    0b10000000, // Packed Fields: GCT flag ON, size = 2^(0+1)=2 entries
    0x00, // Background Color Index
    0x00, // Pixel Aspect Ratio

    // Global Color Table (2 entries * 3 bytes each)
    0x00, 0x00, 0x00, // First color: Black (R=0,G=0,B=0)
    0xff, 0xff, 0xff, // Second color: White (R=255,G=255,B=255)

    // frame 1
    
    // Graphic Control Extension
    0x21, // Extension Introducer
    0xf9, // Graphic Control Label
    0x04, // Block Size (4 bytes)
    0b00000001, // Packed Fields: 
                 // - Reserved: 000 (3 bits)
                 // - Disposal Method: 000 (3 bits) - No disposal specified
                 // - User Input Flag: 0 (1 bit) - No user input expected
                 // - Transparent Color Flag: 1 (1 bit) - Transparent color is given
    0x0a, 0x00, // Delay Time: 10 (in 1/100th seconds = 0.1 seconds)
    0x00, // Transparent Color Index: 0 (black will be transparent)
    0x00, // Block Terminator

    // Image Descriptor
    0x2c, // Image Separator
    0x00, 0x00, // Image Left Position
    0x00, 0x00, // Image Top Position
    0x02, 0x00, // Image Width: 2
    0x02, 0x00, // Image Height: 2
    0b00000000, // Packed Fields: No Local Color Table (use Global Color Table)

    // LZW Minimum Code Size
    0x02, // Minimum LZW code size for 2 colors (2^2 = 4 values, codes 0-3)

    // Image Data - Single valid LZW block for 2x2 image
    0x06, // Block size: 6 bytes
    0x04, // Clear code
    0x01, // First pixel: white (index 1)
    0x00, // Second pixel: black (index 0)
    0x00, // Third pixel: black (index 0)
    0x01, // Fourth pixel: white (index 1)
    0x05, // End of information code
    0x00, // Block Terminator

    // GIF Trailer
    0x3b,
  ]);
};