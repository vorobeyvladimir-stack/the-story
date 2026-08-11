with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re
matches = re.findall(r"outline[\w.]*", text)
print("Outline matches:", set(matches[:20]))

palette = re.findall(r"(\w+Outline|\w+Template|\w+Piece)", text)
print("Palette matches:", set(palette[:20]))
