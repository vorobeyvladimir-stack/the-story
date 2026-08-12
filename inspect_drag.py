with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

import re

pos = text.find("preventOffstageDrag")
print("preventOffstageDrag snippet:")
print(text[max(0, pos - 100):min(len(text), pos + 1000)])
