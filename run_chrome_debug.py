import subprocess
import os
import time

html_path = r"C:\Users\Volodymyr\Downloads\thegame\index.html"
log_path = r"C:\Users\Volodymyr\Downloads\thegame\chrome_debug.log"

if os.path.exists(log_path):
    os.remove(log_path)

chrome_cmd = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    f"--enable-logging=v=1",
    f"--log-file={log_path}",
    "--headless",
    "--disable-gpu",
    f"file:///{html_path}"
]

print("Launching Chrome headless...")
try:
    p = subprocess.Popen(chrome_cmd)
    time.sleep(3)
    p.terminate()
    print("Chrome finished.")

    if os.path.exists(log_path):
        with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
            print("=== CHROME LOG ===")
            print(f.read()[:3000])
    else:
        print("Log file not created.")
except Exception as e:
    print("Error launching chrome:", e)
