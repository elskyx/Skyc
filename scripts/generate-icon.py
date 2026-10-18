import os
import zlib
import struct

os.makedirs('src-tauri/icons', exist_ok=True)

def make_png(w, h, color):
    raw = b''.join(b'\x00' + bytes(color) * w for _ in range(h))
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data))
    ihdr = b'\x00\x00\x00\rIHDR' + ihdr_data + ihdr_crc
    
    compressed = zlib.compress(raw)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed))
    idat = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc
    
    iend = b'\x00\x00\x00\x00IEND\xaeB`\x82'
    return b'\x89PNG\r\n\x1a\n' + ihdr + idat + iend

icon_bytes = make_png(128, 128, (217, 119, 87)) # Terracotta color
with open('src-tauri/icons/128x128.png', 'wb') as f:
    f.write(icon_bytes)

print('Icon created successfully!')
