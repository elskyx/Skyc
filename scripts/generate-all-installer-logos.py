# scripts/generate-all-installer-logos.py
"""
Skyc Master Logo & Installer Asset Generator
Generates studio-grade assets for:
- Windows Desktop (Tauri icons, NSIS installer header/sidebar bitmaps, WiX banners, ICO)
- Android APK (Adaptive launcher icons, mipmaps, foreground layers, splash screens)
- Web & Repository (Favicons, web app icons, badges)
Adheres strictly to Anti-Slop principles and Claude-inspired Warm Aesthetic.
"""

import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Define Color Tokens
OBSIDIAN = (25, 25, 24, 255)         # #191918
OBSIDIAN_RGB = (25, 25, 24)
OBSIDIAN_SHEEN = (35, 35, 33, 255)   # #232321
BORDER_SUBTLE = (51, 51, 48, 255)    # #333330
BORDER_RGB = (51, 51, 48)
TERRACOTTA = (217, 119, 87, 255)     # #D97757
TERRACOTTA_RGB = (217, 119, 87)
TERRACOTTA_LIGHT = (226, 132, 102, 255) # #E28466
PARCHMENT = (244, 243, 238, 255)     # #F4F3EE
PARCHMENT_RGB = (244, 243, 238)
TEXT_MUTED = (161, 161, 170, 255)    # #A1A1AA
TEXT_MUTED_RGB = (161, 161, 170)

def draw_skyc_glyph(draw, center_x, center_y, glyph_scale, supersample=2):
    """
    Renders the S-Collector Arc Ribbon, Center Downlink Arrow, and Accent Dot
    with sub-pixel precision.
    """
    ss = supersample
    s = glyph_scale * ss
    
    # Base reference coordinate in 256x256 space is centered at (128, 128)
    def map_pt(x, y):
        dx = (x - 128.0) * s
        dy = (y - 128.0) * s
        return (center_x * ss + dx, center_y * ss + dy)

    stroke_w = max(int(24 * s), int(2 * ss))
    arrow_w = max(int(8 * s), int(1.5 * ss))

    # 1. Upper Arc: center (120, 96), radii bbox [68, 48, 172, 144]
    p_tl = map_pt(68, 48)
    p_br = map_pt(172, 144)
    bbox_upper = [min(p_tl[0], p_br[0]), min(p_tl[1], p_br[1]), max(p_tl[0], p_br[0]), max(p_tl[1], p_br[1])]
    draw.arc(bbox_upper, start=180, end=360, fill=TERRACOTTA, width=stroke_w)

    # 2. Lower Arc: center (132, 184), radii bbox [76, 136, 188, 232]
    p_tl2 = map_pt(76, 136)
    p_br2 = map_pt(188, 232)
    bbox_lower = [min(p_tl2[0], p_br2[0]), min(p_tl2[1], p_br2[1]), max(p_tl2[0], p_br2[0]), max(p_tl2[1], p_br2[1])]
    draw.arc(bbox_lower, start=0, end=180, fill=TERRACOTTA, width=stroke_w)

    # 3. Connecting S-Spine
    spine_pts = [
        map_pt(172, 96),
        map_pt(140, 136),
        map_pt(116, 144),
        map_pt(76, 184)
    ]
    draw.line(spine_pts, fill=TERRACOTTA, width=stroke_w, joint='curve')

    # 4. Center Downlink Arrow (Parchment)
    top_p = map_pt(128, 106)
    bot_p = map_pt(128, 142)
    draw.line([top_p, bot_p], fill=PARCHMENT, width=arrow_w)
    
    arr_left = map_pt(116, 130)
    arr_right = map_pt(140, 130)
    draw.line([arr_left, bot_p, arr_right], fill=PARCHMENT, width=arrow_w, joint='curve')

    # 5. Precision Accent Dot
    dot_pt = map_pt(186, 74)
    dot_r = max(int(5 * s), int(1 * ss))
    draw.ellipse([dot_pt[0] - dot_r, dot_pt[1] - dot_r, dot_pt[0] + dot_r, dot_pt[1] + dot_r], fill=PARCHMENT)


def create_skyc_icon(size=512, shape='squircle', foreground_only=False):
    """
    Generates a master icon of any size.
    shape: 'squircle', 'round', 'circle', or 'none'
    foreground_only: for Android Adaptive Icon foreground (transparent background)
    """
    ss = 2
    canvas_w = size * ss
    canvas_h = size * ss
    img = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    center = (size / 2.0, size / 2.0)

    if not foreground_only:
        pad = int(8 * (size / 256.0) * ss)
        box = [pad, pad, canvas_w - pad, canvas_h - pad]

        if shape in ('round', 'circle'):
            # Round icon
            draw.ellipse(box, fill=OBSIDIAN, outline=BORDER_SUBTLE, width=max(int(1.5 * (size / 256.0) * ss), 1))
        elif shape == 'squircle':
            radius = int(58 * (size / 256.0) * ss)
            draw.rounded_rectangle(box, radius=radius, fill=OBSIDIAN, outline=BORDER_SUBTLE, width=max(int(1.5 * (size / 256.0) * ss), 1))

        # Ambient Glow
        glow_layer = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
        g_draw = ImageDraw.Draw(glow_layer)
        glow_r = int(90 * (size / 256.0) * ss)
        cx, cy = int(canvas_w / 2), int(canvas_h / 2)
        g_draw.ellipse([cx - glow_r, cy - glow_r, cx + glow_r, cy + glow_r], fill=(217, 119, 87, 45))
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(int(20 * (size / 256.0) * ss)))
        img.alpha_composite(glow_layer)
        draw = ImageDraw.Draw(img)

    # Scale glyph
    if foreground_only:
        # In Android adaptive icons, safe zone is 66% (72dp out of 108dp)
        glyph_scale = (size / 256.0) * 0.72
    else:
        glyph_scale = (size / 256.0)

    draw_skyc_glyph(draw, center[0], center[1], glyph_scale, supersample=ss)

    return img.resize((size, size), Image.Resampling.LANCZOS)


def create_nsis_header():
    """
    NSIS installer page header image. Dimensions: 150 x 57 (BMP 24-bit RGB)
    """
    w, h = 150, 57
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    # Draw bottom border line
    draw.line([(0, h * ss - 2), (w * ss, h * ss - 2)], fill=BORDER_RGB, width=2)

    # Draw small squircle logo on the left
    icon_size = 40
    icon = create_skyc_icon(icon_size, shape='squircle')
    # Resize with supersample
    icon_ss = icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_ss, (10 * ss, int((h - icon_size) / 2) * ss), icon_ss)

    # Typography
    # Try system fonts or default
    try:
        font_title = ImageFont.truetype("arial.ttf", 15 * ss)
        font_sub = ImageFont.truetype("arial.ttf", 9 * ss)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((58 * ss, 12 * ss), "Skyc Downloader", fill=PARCHMENT_RGB, font=font_title)
    draw.text((58 * ss, 32 * ss), "Universal & Zero-Cloud", fill=TERRACOTTA_RGB, font=font_sub)

    return img.resize((w, h), Image.Resampling.LANCZOS)


def create_nsis_sidebar():
    """
    NSIS installer welcome/finish page sidebar image. Dimensions: 164 x 314 (BMP 24-bit RGB)
    """
    w, h = 164, 314
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    # Subtle vertical highlight gradient
    for y in range(h * ss):
        ratio = y / float(h * ss)
        r = int(25 + 10 * (1 - ratio))
        g = int(25 + 8 * (1 - ratio))
        b = int(24 + 6 * (1 - ratio))
        draw.line([(0, y), (w * ss, y)], fill=(r, g, b))

    # Accent decorative top bar
    draw.rectangle([0, 0, w * ss, 4 * ss], fill=TERRACOTTA_RGB)

    # Logo Tile
    icon_size = 72
    icon = create_skyc_icon(icon_size, shape='squircle')
    icon_ss = icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_ss, (int((w - icon_size) / 2) * ss, 40 * ss), icon_ss)

    # Typography
    try:
        font_title = ImageFont.truetype("arial.ttf", 22 * ss)
        font_tag = ImageFont.truetype("arial.ttf", 10 * ss)
        font_desc = ImageFont.truetype("arial.ttf", 9 * ss)
    except:
        font_title = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        font_desc = ImageFont.load_default()

    # Draw centered text
    draw.text((w * ss / 2, 130 * ss), "Skyc", fill=PARCHMENT_RGB, font=font_title, anchor="mt")
    draw.text((w * ss / 2, 160 * ss), "Save anything, From anywhere.", fill=TERRACOTTA_RGB, font=font_tag, anchor="mt")

    # Divider line
    div_y = 190 * ss
    draw.line([(30 * ss, div_y), ((w - 30) * ss, div_y)], fill=BORDER_RGB, width=2)

    # Feature bullet highlights
    bullets = [
        "100% Client-Side",
        "Zero-Cloud Privacy",
        "High-Speed Downloads",
        "No Tracking / No Ads"
    ]
    cur_y = 205 * ss
    for b in bullets:
        draw.ellipse([(28 * ss, cur_y + 3 * ss), (32 * ss, cur_y + 7 * ss)], fill=TERRACOTTA_RGB)
        draw.text((38 * ss, cur_y), b, fill=TEXT_MUTED_RGB, font=font_desc)
        cur_y += 18 * ss

    return img.resize((w, h), Image.Resampling.LANCZOS)


def create_wix_banner():
    """
    WiX (MSI) Top Banner: 493 x 58 (BMP 24-bit RGB)
    """
    w, h = 493, 58
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    # Bottom border
    draw.line([(0, h * ss - 2), (w * ss, h * ss - 2)], fill=BORDER_RGB, width=2)

    # Logo on right side
    icon_size = 42
    icon = create_skyc_icon(icon_size, shape='squircle')
    icon_ss = icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_ss, ((w - icon_size - 16) * ss, int((h - icon_size) / 2) * ss), icon_ss)

    # Title on left side
    try:
        font_title = ImageFont.truetype("arial.ttf", 15 * ss)
        font_sub = ImageFont.truetype("arial.ttf", 10 * ss)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((20 * ss, 12 * ss), "Skyc Setup", fill=PARCHMENT_RGB, font=font_title)
    draw.text((20 * ss, 32 * ss), "Universal Zero-Cloud Media Downloader", fill=TERRACOTTA_RGB, font=font_sub)

    return img.resize((w, h), Image.Resampling.LANCZOS)


def create_wix_dialog():
    """
    WiX (MSI) Welcome / Finish Dialog: 493 x 312 (BMP 24-bit RGB)
    Left 164px is sidebar banner, right side is installer content.
    """
    w, h = 493, 312
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), (245, 244, 240)) # Warm parchment background for right side
    draw = ImageDraw.Draw(img)

    # Left sidebar background
    sidebar_w = 164
    sidebar = create_nsis_sidebar()
    sidebar_resized = sidebar.resize((sidebar_w, h), Image.Resampling.LANCZOS)
    img.paste(sidebar_resized, (0, 0))

    return img


def create_android_splash(width=1024, height=1024):
    """
    Generates high-res splash screen with centered emblem and obsidian background
    """
    ss = 2
    img = Image.new('RGBA', (width * ss, height * ss), OBSIDIAN)
    
    # Emblem size is approx 24% of smaller dimension
    icon_size = int(min(width, height) * 0.28)
    icon = create_skyc_icon(icon_size, shape='squircle')
    icon_ss = icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    
    cx = int((width - icon_size) / 2) * ss
    cy = int((height - icon_size) / 2) * ss
    img.paste(icon_ss, (cx, cy), icon_ss)

    return img.resize((width, height), Image.Resampling.LANCZOS)


def main():
    print("[*] Generating studio-grade Skyc logo and installer suite...")

    # 1. Output Directories
    dirs = [
        "public/assets/logos/png",
        "public/assets/logos/icons",
        "src-tauri/icons",
        "android/app/src/main/res/mipmap-mdpi",
        "android/app/src/main/res/mipmap-hdpi",
        "android/app/src/main/res/mipmap-xhdpi",
        "android/app/src/main/res/mipmap-xxhdpi",
        "android/app/src/main/res/mipmap-xxxhdpi",
        "android/app/src/main/res/mipmap-anydpi-v26",
        "android/app/src/main/res/drawable",
        "android/app/src/main/res/drawable-mdpi",
        "android/app/src/main/res/drawable-hdpi",
        "android/app/src/main/res/drawable-xhdpi",
        "android/app/src/main/res/drawable-xxhdpi",
        "android/app/src/main/res/drawable-xxxhdpi",
        "android/app/src/main/res/drawable-land",
        "android/app/src/main/res/drawable-port",
        "android/app/src/main/res/values"
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # 2. Master Squircles & PNGs
    master_512 = create_skyc_icon(512, shape='squircle')
    master_512.save("public/assets/logos/png/skyc-app-icon-512.png")
    master_512.save("src-tauri/icons/icon.png")

    master_256 = create_skyc_icon(256, shape='squircle')
    master_256.save("public/assets/logos/png/skyc-app-icon-256.png")
    master_256.save("src-tauri/icons/128x128@2x.png") # Fixed 256px high-DPI icon!
    master_256.save("public/favicon.png")

    master_128 = create_skyc_icon(128, shape='squircle')
    master_128.save("public/assets/logos/png/skyc-app-icon-128.png")
    master_128.save("src-tauri/icons/128x128.png")

    master_64 = create_skyc_icon(64, shape='squircle')
    master_64.save("public/assets/logos/png/skyc-app-icon-64.png")

    master_32 = create_skyc_icon(32, shape='squircle')
    master_32.save("public/assets/logos/png/skyc-app-icon-32.png")
    master_32.save("src-tauri/icons/32x32.png")

    master_16 = create_skyc_icon(16, shape='squircle')
    master_16.save("public/assets/logos/png/skyc-app-icon-16.png")

    # 3. Multi-resolution Windows ICO
    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    master_512.save("src-tauri/icons/icon.ico", format='ICO', sizes=ico_sizes)
    master_512.save("public/favicon.ico", format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print("[+] Windows ICO and PNG icons created.")

    # 4. NSIS & WiX Installer Bitmaps
    nsis_header = create_nsis_header()
    nsis_header.save("src-tauri/icons/header.bmp", format='BMP')

    nsis_sidebar = create_nsis_sidebar()
    nsis_sidebar.save("src-tauri/icons/sidebar.bmp", format='BMP')

    wix_banner = create_wix_banner()
    wix_banner.save("src-tauri/icons/banner.bmp", format='BMP')

    wix_dialog = create_wix_dialog()
    wix_dialog.save("src-tauri/icons/dialog.bmp", format='BMP')
    print("[+] NSIS and WiX installer bitmaps created.")

    # 5. Android Mipmaps (Square & Round)
    densities = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192
    }
    for dens, sz in densities.items():
        sq = create_skyc_icon(sz, shape='squircle')
        sq.save(f"android/app/src/main/res/mipmap-{dens}/ic_launcher.png")

        rnd = create_skyc_icon(sz, shape='round')
        rnd.save(f"android/app/src/main/res/mipmap-{dens}/ic_launcher_round.png")
    print("[+] Android mipmap icons (standard & round) created.")

    # 6. Android Adaptive Icons (API 26+)
    adaptive_densities = {
        "mdpi": 108,
        "hdpi": 162,
        "xhdpi": 216,
        "xxhdpi": 324,
        "xxxhdpi": 432
    }
    for dens, sz in adaptive_densities.items():
        fg = create_skyc_icon(sz, foreground_only=True)
        fg.save(f"android/app/src/main/res/drawable-{dens}/ic_launcher_foreground.png")

    # Default fallback foreground
    create_skyc_icon(432, foreground_only=True).save("android/app/src/main/res/drawable/ic_launcher_foreground.png")

    # Adaptive XMLs
    adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
"""
    with open("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml", "w", encoding="utf-8") as f:
        f.write(adaptive_xml)
    with open("android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml", "w", encoding="utf-8") as f:
        f.write(adaptive_xml)

    # Colors XML
    colors_xml = """<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#191918</color>
    <color name="splash_background">#191918</color>
</resources>
"""
    with open("android/app/src/main/res/values/colors.xml", "w", encoding="utf-8") as f:
        f.write(colors_xml)
    print("[+] Android Adaptive Icons (anydpi-v26) and color tokens created.")

    # 7. Android Splash Screens
    splash_sq = create_android_splash(1024, 1024)
    splash_sq.save("android/app/src/main/res/drawable/splash.png")

    splash_land = create_android_splash(1280, 720)
    splash_land.save("android/app/src/main/res/drawable-land/splash.png")

    splash_port = create_android_splash(720, 1280)
    splash_port.save("android/app/src/main/res/drawable-port/splash.png")
    print("[+] Android splash screens created.")

    print("\n[SUCCESS] ALL INSTALLER LOGOS AND ASSETS COMPILED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
