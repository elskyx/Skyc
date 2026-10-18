import os
import math
from PIL import Image, ImageDraw, ImageFilter

os.makedirs('public/assets/logos/png', exist_ok=True)
os.makedirs('public/assets/logos/icons', exist_ok=True)

# Colors
OBSIDIAN = (25, 25, 24, 255)
OBSIDIAN_DARK = (18, 18, 17, 255)
PARCHMENT = (244, 243, 238, 255)
TERRACOTTA = (217, 119, 87, 255)
TERRACOTTA_LIGHT = (226, 132, 102, 255)
BORDER_SUBTLE = (45, 45, 43, 255)

def create_concept_4_capsule(size=512):
    scale = size / 256.0
    # Create image with super-sampling (2x) for razor-sharp anti-aliasing
    ss = 2
    img_size = size * ss
    img = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base squircle
    pad = int(8 * scale * ss)
    radius = int(58 * scale * ss)
    box = [pad, pad, img_size - pad, img_size - pad]
    
    # Rounded rect background
    draw.rounded_rectangle(box, radius=radius, fill=OBSIDIAN, outline=BORDER_SUBTLE, width=int(2 * ss))

    # Ambient glow
    glow_size = int(180 * scale * ss)
    glow = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    g_draw = ImageDraw.Draw(glow)
    center = img_size // 2
    g_radius = int(90 * scale * ss)
    g_draw.ellipse([center - g_radius, center - g_radius, center + g_radius, center + g_radius], fill=(217, 119, 87, 45))
    glow = glow.filter(ImageFilter.GaussianBlur(int(20 * scale * ss)))
    img.alpha_composite(glow)

    # Re-draw context on composited image
    draw = ImageDraw.Draw(img)

    # Primary S-Collector Ribbon
    # Draw thick smooth arc path using line segments
    stroke_w = int(24 * scale * ss)
    
    # Upper Arc
    arc1_bbox = [int(68 * scale * ss), int(48 * scale * ss), int(172 * scale * ss), int(144 * scale * ss)]
    draw.arc(arc1_bbox, start=180, end=360, fill=TERRACOTTA, width=stroke_w)
    
    # Lower Arc
    arc2_bbox = [int(76 * scale * ss), int(136 * scale * ss), int(188 * scale * ss), int(232 * scale * ss)]
    draw.arc(arc2_bbox, start=0, end=180, fill=TERRACOTTA, width=stroke_w)

    # Connecting Spine
    spine_points = [
        (int(172 * scale * ss), int(96 * scale * ss)),
        (int(140 * scale * ss), int(136 * scale * ss)),
        (int(116 * scale * ss), int(144 * scale * ss)),
        (int(76 * scale * ss), int(184 * scale * ss))
    ]
    draw.line(spine_points, fill=TERRACOTTA, width=stroke_w, joint='curve')

    # Center Downlink Arrow (Parchment)
    arrow_w = int(8 * scale * ss)
    cx = center
    top_y = int(106 * scale * ss)
    bot_y = int(144 * scale * ss)
    draw.line([(cx, top_y), (cx, bot_y)], fill=PARCHMENT, width=arrow_w)
    draw.line([(cx - int(12 * scale * ss), bot_y - int(12 * scale * ss)), (cx, bot_y), (cx + int(12 * scale * ss), bot_y - int(12 * scale * ss))], fill=PARCHMENT, width=arrow_w, joint='curve')

    # Accent Dot
    dot_r = int(6 * scale * ss)
    draw.ellipse([int(186 * scale * ss) - dot_r, int(74 * scale * ss) - dot_r, int(186 * scale * ss) + dot_r, int(74 * scale * ss) + dot_r], fill=PARCHMENT)

    # Resize down with Lanczos filter for studio quality anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

# Generate Master Assets
master_512 = create_concept_4_capsule(512)
master_512.save('public/assets/logos/png/skyc-app-icon-512.png')

master_256 = create_concept_4_capsule(256)
master_256.save('public/assets/logos/png/skyc-app-icon-256.png')

master_128 = create_concept_4_capsule(128)
master_128.save('public/assets/logos/png/skyc-app-icon-128.png')

master_64 = create_concept_4_capsule(64)
master_64.save('public/assets/logos/png/skyc-app-icon-64.png')

master_32 = create_concept_4_capsule(32)
master_32.save('public/assets/logos/png/skyc-app-icon-32.png')

master_16 = create_concept_4_capsule(16)
master_16.save('public/assets/logos/png/skyc-app-icon-16.png')

# Update favicon and app icons in public & tauri
master_256.save('public/favicon.png')
master_128.save('src-tauri/icons/128x128.png')
master_32.save('src-tauri/icons/32x32.png')
master_512.save('src-tauri/icons/icon.ico', format='ICO', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])

print("Logo suite generated successfully!")
