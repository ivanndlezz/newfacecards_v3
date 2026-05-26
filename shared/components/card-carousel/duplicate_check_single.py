import os, re, collections, json, sys

file_path = r'c:/Users/Ivan Gonzalez/Sitios/newfacecards_v3/shared/components/card-carousel/card-carousel-latest.css'

with open(file_path, encoding='utf-8') as f:
    content = f.read()

# Remove comments
content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)

selectors = collections.defaultdict(list)
keyframes = collections.defaultdict(list)

for m in re.finditer(r'([^{}]+)\{([^}]*)\}', content):
    sel_group = m.group(1).strip()
    decl = m.group(2).strip()
    for sel in [s.strip() for s in sel_group.split(',') if s.strip()]:
        selectors[sel].append(decl)

for km in re.finditer(r'@keyframes\s+([\w-]+)\s*\{', content):
    name = km.group(1)
    keyframes[name].append(True)

duplicate_selectors = {sel: occ for sel, occ in selectors.items() if len(occ) > 1}
duplicate_keyframes = [name for name, occ in keyframes.items() if len(occ) > 1]

result = {
    "duplicate_selectors": list(duplicate_selectors.keys()),
    "duplicate_keyframes": duplicate_keyframes
}
print(json.dumps(result, indent=2))
