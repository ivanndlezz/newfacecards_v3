import os, re, collections, json

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
# Walk through shared/components for .css files
def get_css_files():
    css_files = []
    for root, dirs, files in os.walk(base_dir):
        for f in files:
            if f.lower().endswith('.css'):
                css_files.append(os.path.join(root, f))
    return css_files

def strip_comments(content):
    return re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

selectors = collections.defaultdict(list)
keyframes = collections.defaultdict(list)

for path in get_css_files():
    try:
        with open(path, encoding='utf-8') as fp:
            content = fp.read()
    except Exception as e:
        continue
    content_nocomments = strip_comments(content)
    # Find selector blocks
    for m in re.finditer(r'([^{}]+)\{([^}]*)\}', content_nocomments):
        sel_group = m.group(1).strip()
        dec = m.group(2).strip()
        for sel in [s.strip() for s in sel_group.split(',') if s.strip()]:
            selectors[sel].append({"file": path, "declarations": dec})
    # Find keyframes
    for km in re.finditer(r'@keyframes\s+([\w-]+)\s*\{', content_nocomments):
        name = km.group(1)
        keyframes[name].append(path)

# Find duplicates
duplicate_selectors = {sel: occ for sel, occ in selectors.items() if len(occ) > 1}
duplicate_keyframes = {name: paths for name, paths in keyframes.items() if len(paths) > 1}

result = {
    "duplicate_selectors": duplicate_selectors,
    "duplicate_keyframes": duplicate_keyframes,
}
print(json.dumps(result, indent=2))
