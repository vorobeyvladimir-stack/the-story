with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

pos = text.find("painters.Konva")
if pos != -1:
    print("painters.Konva snippet:")
    print(text[max(0, pos - 100):min(len(text), pos + 1000)])
else:
    print("painters.Konva not found")
