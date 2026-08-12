story_path = r"C:\Users\Volodymyr\Downloads\thegame\js\storyData.js"

with open(story_path, "r", encoding="utf-8") as f:
    content = f.read()

target = "grid:{ cols:6, rows:4 }"
replacement = "grid:{ cols:4, rows:4 }"

if target in content:
    content = content.replace(target, replacement)
    with open(story_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated ch1_puzzle grid to 4x4 in js/storyData.js!")
else:
    print("Target grid string not found or already 4x4!")
