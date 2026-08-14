import subprocess
import time
import os
import json
import sys

def run_puzzle_tests():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    test_html = os.path.join(script_dir, 'puzzle_regression.test.html').replace('\\', '/')
    log_path = os.path.join(script_dir, 'test_output.log')

    if os.path.exists(log_path):
        try: os.remove(log_path)
        except: pass

    chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
    p = subprocess.Popen([
        chrome_path,
        '--enable-logging=v=1',
        f'--log-file={log_path}',
        '--headless',
        f'file:///{test_html}'
    ])

    time.sleep(3)
    p.terminate()

    results = None
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                if 'TEST_RESULTS_JSON:' in line:
                    idx = line.find('TEST_RESULTS_JSON:')
                    json_str = line[idx + len('TEST_RESULTS_JSON:'):].strip()
                    if json_str.endswith('", source:'):
                        json_str = json_str.rsplit('", source:', 1)[0]
                    # Find matching closing brace
                    last_brace = json_str.rfind('}')
                    if last_brace != -1:
                        json_str = json_str[:last_brace+1]
                    try:
                        results = json.loads(json_str)
                    except Exception as e:
                        print("Error parsing JSON:", e, "Raw string:", json_str)
                elif 'TEST 1' in line or 'TEST 2' in line or 'CONSOLE' in line:
                    print(line.strip())

        try: os.remove(log_path)
        except: pass

    print("========================================")
    print("        PUZZLE REGRESSION RESULTS       ")
    print("========================================")
    if results:
        print(f"Test 1 (Neighbor Validation): {'PASSED [OK]' if results.get('test1_neighbor_validation') else 'FAILED [X]'}")
        print(f"Test 2 (Cluster Integrity):   {'PASSED [OK]' if results.get('test2_cluster_connection') else 'FAILED [X]'}")
        print(f"ALL TESTS PASSED:             {results.get('allPassed')}")
        print("----------------------------------------")
        for log_entry in results.get('logs', []):
            print(f"[{log_entry.get('status', 'info').upper()}] {log_entry.get('msg')}")
    else:
        print("Could not retrieve test results. Check Chrome headless execution.")
    print("========================================")
    return results

if __name__ == '__main__':
    run_puzzle_tests()
