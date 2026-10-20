# scripts/generate_all_icons_character.py
"""
Skyc Master Mascot & Multi-Platform Icon Suite Generator
Generates:
1. Windows Desktop (Tauri icons, NSIS & WiX installer bitmaps, multi-res ICO)
2. Android APK (Adaptive launcher icons, mipmaps, foreground layers)
3. Web & Repository (Favicons, web app icons, SVG logos)
4. Synchronizes to About-Skyc repository and gemini/landing
"""

import os
import shutil
import base64
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC_IMAGE_PATH = r"C:/Users/ADVAN/.gemini/antigravity/brain/2af10064-42d1-4113-b467-4c829017e7ad/.user_uploaded/media_1792500862315_cc27eb0c.png"
ROOT_DIR = r"c:\Users\ADVAN\OneDrive\Desktop\morirecreate\gemini"
ABOUT_SKYC_DIR = r"c:\Users\ADVAN\OneDrive\Desktop\morirecreate\About-Skyc"

BG_OBSIDIAN = (18, 21, 28, 255)
BG_OBSIDIAN_RGB = (18, 21, 28)
BORDER_GOLD = (225, 185, 110, 80)
BORDER_GOLD_SOLID = (225, 185, 110)
PARCHMENT_RGB = (244, 243, 238)
TEXT_MUTED_RGB = (161, 161, 170)

def create_master_canvases():
    src = Image.open(SRC_IMAGE_PATH).convert('RGBA')
    master_size = 1024
    
    # -------------------------------------------------------------
    # 1. Master Squircle Canvas
    # -------------------------------------------------------------
    canvas = Image.new('RGBA', (master_size, master_size), BG_OBSIDIAN)
    
    # Subtle ambient radial glow behind the character
    glow = Image.new('RGBA', (master_size, master_size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([200, 200, 824, 824], fill=(66, 133, 244, 40)) # Soft blue sheen
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas.alpha_composite(glow)

    w = 1000
    h = int(src.height * (w / src.width)) # 846
    scaled = src.resize((w, h), Image.Resampling.LANCZOS)

    # Feather top and side edges so studio gradient blends into BG_OBSIDIAN
    alpha_mask = Image.new('L', (w, h), 255)
    draw_mask = ImageDraw.Draw(alpha_mask)
    for y in range(40):
        f = int(255 * (y / 40.0))
        draw_mask.line([(0, y), (w, y)], fill=f)

    for x in range(35):
        f = int(255 * (x / 35.0))
        for y in range(h - 150):
            curr_l = alpha_mask.getpixel((x, y))
            alpha_mask.putpixel((x, y), min(curr_l, f))
            curr_r = alpha_mask.getpixel((w - 1 - x, y))
            alpha_mask.putpixel((w - 1 - x, y), min(curr_r, f))

    scaled.putalpha(alpha_mask)

    pos_x = (master_size - w) // 2
    pos_y = master_size - h # 178, anchors to bottom
    canvas.paste(scaled, (pos_x, pos_y), scaled)

    # Squircle masking
    sq_mask = Image.new('L', (master_size, master_size), 0)
    ImageDraw.Draw(sq_mask).rounded_rectangle([0, 0, master_size, master_size], radius=230, fill=255)
    
    master_squircle = Image.new('RGBA', (master_size, master_size), (0, 0, 0, 0))
    master_squircle.paste(canvas, (0, 0), sq_mask)
    
    # Elegant double rim border
    border_draw = ImageDraw.Draw(master_squircle)
    border_draw.rounded_rectangle([2, 2, master_size - 4, master_size - 4], radius=228, outline=(225, 185, 110, 85), width=4)
    border_draw.rounded_rectangle([6, 6, master_size - 8, master_size - 8], radius=224, outline=(255, 255, 255, 20), width=2)

    # -------------------------------------------------------------
    # 2. Master Round Canvas (for Android round icon)
    # -------------------------------------------------------------
    round_mask = Image.new('L', (master_size, master_size), 0)
    ImageDraw.Draw(round_mask).ellipse([16, 16, master_size - 16, master_size - 16], fill=255)
    
    master_round = Image.new('RGBA', (master_size, master_size), (0, 0, 0, 0))
    master_round.paste(canvas, (0, 0), round_mask)
    
    round_border_draw = ImageDraw.Draw(master_round)
    round_border_draw.ellipse([18, 18, master_size - 18, master_size - 18], outline=(225, 185, 110, 85), width=4)

    # -------------------------------------------------------------
    # 3. Master Foreground Canvas (for Android Adaptive Icons)
    # Safe zone in 1024x1024 is inner 66% ~ 680px diameter circle
    # -------------------------------------------------------------
    master_foreground = Image.new('RGBA', (master_size, master_size), (0, 0, 0, 0))
    fg_w = 780
    fg_h = int(src.height * (fg_w / src.width))
    fg_scaled = src.resize((fg_w, fg_h), Image.Resampling.LANCZOS)
    
    # Soft circular vignette on foreground
    fg_alpha = Image.new('L', (fg_w, fg_h), 255)
    fg_pos_x = (master_size - fg_w) // 2
    fg_pos_y = (master_size - fg_h) // 2 + 30 # centered vertically
    master_foreground.paste(fg_scaled, (fg_pos_x, fg_pos_y), fg_scaled)

    return master_squircle, master_round, master_foreground

def create_nsis_header(squircle_icon):
    w, h = 150, 57
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), BG_OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    draw.line([(0, h * ss - 2), (w * ss, h * ss - 2)], fill=(45, 48, 56), width=2)

    icon_size = 42
    icon_resized = squircle_icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_resized, (10 * ss, int((h - icon_size) / 2) * ss), icon_resized)

    try:
        font_title = ImageFont.truetype("arial.ttf", 15 * ss)
        font_sub = ImageFont.truetype("arial.ttf", 9 * ss)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((58 * ss, 12 * ss), "Skyc Downloader", fill=PARCHMENT_RGB, font=font_title)
    draw.text((58 * ss, 32 * ss), "Universal & Zero-Cloud", fill=BORDER_GOLD_SOLID, font=font_sub)

    return img.resize((w, h), Image.Resampling.LANCZOS)

def create_nsis_sidebar(squircle_icon):
    w, h = 164, 314
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), BG_OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    for y in range(h * ss):
        ratio = y / float(h * ss)
        r = int(18 + 12 * (1 - ratio))
        g = int(21 + 10 * (1 - ratio))
        b = int(28 + 8 * (1 - ratio))
        draw.line([(0, y), (w * ss, y)], fill=(r, g, b))

    draw.rectangle([0, 0, w * ss, 4 * ss], fill=BORDER_GOLD_SOLID)

    icon_size = 80
    icon_resized = squircle_icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_resized, (int((w - icon_size) / 2) * ss, 36 * ss), icon_resized)

    try:
        font_title = ImageFont.truetype("arial.ttf", 22 * ss)
        font_tag = ImageFont.truetype("arial.ttf", 10 * ss)
        font_desc = ImageFont.truetype("arial.ttf", 9 * ss)
    except:
        font_title = ImageFont.load_default()
        font_tag = ImageFont.load_default()
        font_desc = ImageFont.load_default()

    draw.text((w * ss / 2, 134 * ss), "Skyc", fill=PARCHMENT_RGB, font=font_title, anchor="mt")
    draw.text((w * ss / 2, 164 * ss), "Save anything, From anywhere.", fill=BORDER_GOLD_SOLID, font=font_tag, anchor="mt")

    div_y = 194 * ss
    draw.line([(30 * ss, div_y), ((w - 30) * ss, div_y)], fill=(45, 48, 56), width=2)

    bullets = [
        "100% Client-Side",
        "Zero-Cloud Privacy",
        "High-Speed Downloads",
        "No Tracking / No Ads"
    ]
    cur_y = 210 * ss
    for b in bullets:
        draw.ellipse([(28 * ss, cur_y + 3 * ss), (32 * ss, cur_y + 7 * ss)], fill=BORDER_GOLD_SOLID)
        draw.text((38 * ss, cur_y), b, fill=TEXT_MUTED_RGB, font=font_desc)
        cur_y += 18 * ss

    return img.resize((w, h), Image.Resampling.LANCZOS)

def create_wix_banner(squircle_icon):
    w, h = 493, 58
    ss = 2
    img = Image.new('RGB', (w * ss, h * ss), BG_OBSIDIAN_RGB)
    draw = ImageDraw.Draw(img)

    draw.line([(0, h * ss - 2), (w * ss, h * ss - 2)], fill=(45, 48, 56), width=2)

    icon_size = 44
    icon_resized = squircle_icon.resize((icon_size * ss, icon_size * ss), Image.Resampling.LANCZOS)
    img.paste(icon_resized, ((w - icon_size - 16) * ss, int((h - icon_size) / 2) * ss), icon_resized)

    try:
        font_title = ImageFont.truetype("arial.ttf", 15 * ss)
        font_sub = ImageFont.truetype("arial.ttf", 10 * ss)
    except:
        font_title = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    draw.text((20 * ss, 12 * ss), "Skyc Setup", fill=PARCHMENT_RGB, font=font_title)
    draw.text((20 * ss, 32 * ss), "Universal Zero-Cloud Media Downloader", fill=BORDER_GOLD_SOLID, font=font_sub)

    return img.resize((w, h), Image.Resampling.LANCZOS)

def create_wix_dialog(sidebar_img):
    w, h = 493, 312
    img = Image.new('RGB', (w, h), (245, 244, 240))
    sidebar_resized = sidebar_img.resize((164, h), Image.Resampling.LANCZOS)
    img.paste(sidebar_resized, (0, 0))
    return img

def create_svg_logo(squircle_png_path, output_svg_path):
    with open(squircle_png_path, "rb") as f:
        b64_data = base64.b64encode(f.read()).decode("utf-8")

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <!-- Skyc Official Mascot Logo -->
  <image width="1024" height="1024" href="data:image/png;base64,{b64_data}"/>
</svg>'''
    with open(output_svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

def main():
    print("[*] Generating master canvases from mascot image...")
    master_sq, master_rnd, master_fg = create_master_canvases()
    
    # Save master intermediate assets
    os.makedirs("scratch", exist_ok=True)
    master_sq.save("scratch/master_squircle.png")
    master_rnd.save("scratch/master_round.png")
    master_fg.save("scratch/master_fg.png")

    sq_512 = master_sq.resize((512, 512), Image.Resampling.LANCZOS)
    sq_256 = master_sq.resize((256, 256), Image.Resampling.LANCZOS)
    sq_128 = master_sq.resize((128, 128), Image.Resampling.LANCZOS)
    sq_64  = master_sq.resize((64, 64), Image.Resampling.LANCZOS)
    sq_48  = master_sq.resize((48, 48), Image.Resampling.LANCZOS)
    sq_32  = master_sq.resize((32, 32), Image.Resampling.LANCZOS)
    sq_16  = master_sq.resize((16, 16), Image.Resampling.LANCZOS)

    # -------------------------------------------------------------
    # 1. Desktop & Tauri Assets (gemini/src-tauri/icons)
    # -------------------------------------------------------------
    print("[*] Generating Windows & Tauri Desktop icons...")
    tauri_dir = os.path.join(ROOT_DIR, "src-tauri/icons")
    os.makedirs(tauri_dir, exist_ok=True)
    
    sq_512.save(os.path.join(tauri_dir, "icon.png"))
    sq_256.save(os.path.join(tauri_dir, "128x128@2x.png"))
    sq_128.save(os.path.join(tauri_dir, "128x128.png"))
    sq_32.save(os.path.join(tauri_dir, "32x32.png"))

    ico_sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    sq_512.save(os.path.join(tauri_dir, "icon.ico"), format='ICO', sizes=ico_sizes)

    # NSIS & WiX bitmaps
    nsis_header = create_nsis_header(sq_128)
    nsis_header.save(os.path.join(tauri_dir, "header.bmp"), format='BMP')

    nsis_sidebar = create_nsis_sidebar(sq_128)
    nsis_sidebar.save(os.path.join(tauri_dir, "sidebar.bmp"), format='BMP')

    wix_banner = create_wix_banner(sq_128)
    wix_banner.save(os.path.join(tauri_dir, "banner.bmp"), format='BMP')

    wix_dialog = create_wix_dialog(nsis_sidebar)
    wix_dialog.save(os.path.join(tauri_dir, "dialog.bmp"), format='BMP')

    # -------------------------------------------------------------
    # 2. Android APK Icons (gemini/android/app/src/main/res)
    # -------------------------------------------------------------
    print("[*] Generating Android mipmaps & adaptive icons...")
    res_dir = os.path.join(ROOT_DIR, "android/app/src/main/res")
    
    densities = {
        "mdpi": 48,
        "hdpi": 72,
        "xhdpi": 96,
        "xxhdpi": 144,
        "xxxhdpi": 192
    }
    for dens, sz in densities.items():
        mipmap_dir = os.path.join(res_dir, f"mipmap-{dens}")
        os.makedirs(mipmap_dir, exist_ok=True)
        master_sq.resize((sz, sz), Image.Resampling.LANCZOS).save(os.path.join(mipmap_dir, "ic_launcher.png"))
        master_rnd.resize((sz, sz), Image.Resampling.LANCZOS).save(os.path.join(mipmap_dir, "ic_launcher_round.png"))

    adaptive_densities = {
        "mdpi": 108,
        "hdpi": 162,
        "xhdpi": 216,
        "xxhdpi": 324,
        "xxxhdpi": 432
    }
    for dens, sz in adaptive_densities.items():
        draw_dir = os.path.join(res_dir, f"drawable-{dens}")
        os.makedirs(draw_dir, exist_ok=True)
        master_fg.resize((sz, sz), Image.Resampling.LANCZOS).save(os.path.join(draw_dir, "ic_launcher_foreground.png"))

    # Fallback drawable
    os.makedirs(os.path.join(res_dir, "drawable"), exist_ok=True)
    master_fg.resize((432, 432), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "drawable/ic_launcher_foreground.png"))

    # -------------------------------------------------------------
    # 3. Web & Public Assets (gemini/public)
    # -------------------------------------------------------------
    print("[*] Generating Web & Public assets...")
    pub_dir = os.path.join(ROOT_DIR, "public")
    logos_png_dir = os.path.join(pub_dir, "assets/logos/png")
    os.makedirs(logos_png_dir, exist_ok=True)

    sq_512.save(os.path.join(logos_png_dir, "skyc-app-icon-512.png"))
    sq_256.save(os.path.join(logos_png_dir, "skyc-app-icon-256.png"))
    sq_128.save(os.path.join(logos_png_dir, "skyc-app-icon-128.png"))
    sq_64.save(os.path.join(logos_png_dir, "skyc-app-icon-64.png"))
    sq_32.save(os.path.join(logos_png_dir, "skyc-app-icon-32.png"))
    sq_16.save(os.path.join(logos_png_dir, "skyc-app-icon-16.png"))

    sq_256.save(os.path.join(pub_dir, "favicon.png"))
    sq_512.save(os.path.join(pub_dir, "favicon.ico"), format='ICO', sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64)])

    # Generate SVGs
    svg_pub = os.path.join(pub_dir, "logo.svg")
    svg_logo_pub = os.path.join(pub_dir, "assets/logos/skyc-logo.svg")
    create_svg_logo("scratch/master_squircle.png", svg_pub)
    shutil.copyfile(svg_pub, svg_logo_pub)

    # -------------------------------------------------------------
    # 4. Mirror to android/app/src/main/assets/public
    # -------------------------------------------------------------
    print("[*] Mirroring to android web assets...")
    android_pub = os.path.join(ROOT_DIR, "android/app/src/main/assets/public")
    if os.path.exists(android_pub):
        shutil.copyfile(os.path.join(pub_dir, "favicon.ico"), os.path.join(android_pub, "favicon.ico"))
        shutil.copyfile(os.path.join(pub_dir, "favicon.png"), os.path.join(android_pub, "favicon.png"))
        shutil.copyfile(os.path.join(pub_dir, "logo.svg"), os.path.join(android_pub, "logo.svg"))
        android_logos_png = os.path.join(android_pub, "assets/logos/png")
        os.makedirs(android_logos_png, exist_ok=True)
        for fname in os.listdir(logos_png_dir):
            shutil.copyfile(os.path.join(logos_png_dir, fname), os.path.join(android_logos_png, fname))
        shutil.copyfile(svg_pub, os.path.join(android_pub, "assets/logos/skyc-logo.svg"))

    # -------------------------------------------------------------
    # 5. Mirror to gemini/landing
    # -------------------------------------------------------------
    print("[*] Mirroring to gemini/landing...")
    landing_dir = os.path.join(ROOT_DIR, "landing")
    if os.path.exists(landing_dir):
        shutil.copyfile(os.path.join(pub_dir, "favicon.ico"), os.path.join(landing_dir, "favicon.ico"))
        shutil.copyfile(os.path.join(pub_dir, "favicon.png"), os.path.join(landing_dir, "favicon.png"))
        shutil.copyfile(os.path.join(pub_dir, "logo.svg"), os.path.join(landing_dir, "logo.svg"))

    # -------------------------------------------------------------
    # 6. Mirror to About-Skyc Repository
    # -------------------------------------------------------------
    print("[*] Mirroring to About-Skyc repository...")
    if os.path.exists(ABOUT_SKYC_DIR):
        shutil.copyfile(os.path.join(pub_dir, "favicon.ico"), os.path.join(ABOUT_SKYC_DIR, "favicon.ico"))
        shutil.copyfile(os.path.join(pub_dir, "favicon.png"), os.path.join(ABOUT_SKYC_DIR, "favicon.png"))
        shutil.copyfile(os.path.join(pub_dir, "logo.svg"), os.path.join(ABOUT_SKYC_DIR, "logo.svg"))

    print("[SUCCESS] All icons across Skyc & About-Skyc successfully updated!")

if __name__ == "__main__":
    main()
