with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

pos = text.find("forceConnectionWhileDragging")
if pos != -1:
    print("forceConnectionWhileDragging snippet:")
    print(text[max(0, pos - 100):min(len(text), pos + 300)])
else:
    print("forceConnectionWhileDragging not found")
