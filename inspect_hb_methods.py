with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
methods = set(re.findall(r"\.([a-zA-Z0-9_]+)\s*=\s*function", text))
print("Found functions:", sorted([m for m in methods if not m.startswith('_')]))

# Search for image-related methods
img_methods = [m for m in methods if 'image' in m.lower() or 'img' in m.lower()]
print("Image methods:", img_methods)
