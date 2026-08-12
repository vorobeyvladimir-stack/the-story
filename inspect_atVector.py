with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

for m in re.finditer(r"atVector", text):
    p = m.start()
    print("---")
    print(text[max(0, p - 60):min(len(text), p + 250)])
