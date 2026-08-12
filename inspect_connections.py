with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

for m in re.finditer(r"connection", text, re.IGNORECASE):
    p = m.start()
    print("---")
    print(text[max(0, p - 40):min(len(text), p + 150)])
