with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "r", encoding="utf-8") as f:
    text = f.read()

# Replace headbreaker=r; with headbreaker=r;window.headbreaker=r;
if "headbreaker=r;" in text and "window.headbreaker=r;" not in text:
    text = text.replace("headbreaker=r;", "headbreaker=r;window.headbreaker=r;")
    with open(r"C:\Users\Volodymyr\Downloads\thegame\js\lib\headbreaker.js", "w", encoding="utf-8") as f:
        f.write(text)
    print("Successfully patched js/lib/headbreaker.js to export window.headbreaker!")
else:
    print("Already patched or pattern not found.")
