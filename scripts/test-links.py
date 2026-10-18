import os
import re

def check_html(filepath, base_dir):
    print(f"Checking {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    links = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)
    for l in links:
        if l.startswith('http') or l.startswith('#') or l.startswith('data:'):
            continue
        clean_path = l.split('?')[0].split('#')[0]
        full_path = os.path.join(base_dir, clean_path)
        if not os.path.exists(full_path):
            print(f"[MISSING]: {clean_path} (resolved to {full_path})")
            return False
        else:
            print(f"[OK]: {clean_path}")
    return True

check_html('public/index.html', 'public')
check_html('public/share.html', 'public')
check_html('landing/index.html', 'landing')
