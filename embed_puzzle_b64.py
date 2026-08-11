import base64
import os

img_path = r"C:\Users\Volodymyr\Downloads\thegame\assets\ch1_puzzle.jpg"
story_path = r"C:\Users\Volodymyr\Downloads\thegame\js\storyData.js"

with open(img_path, "rb") as f:
    b64_str = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/jpeg;base64,{b64_str}"

with open(story_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace image: 'assets/ch1_puzzle.jpg' with Base64 data URI
old_img_ref = "image: 'assets/ch1_puzzle.jpg'"
new_img_ref = f"image: '{data_uri}'"

if old_img_ref in content:
    content = content.replace(old_img_ref, new_img_ref)
    with open(story_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully embedded Base64 puzzle photo in js/storyData.js!")
else:
    print("old_img_ref not found or already replaced!")
