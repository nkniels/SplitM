import subprocess, sys, os

os.chdir(r'c:\Users\DELL.ST\.gemini\antigravity-ide\scratch\SplitM\splitm-v2')

result = subprocess.run(
    ['npm', 'run', 'build'],
    capture_output=True, text=True, shell=True
)

output = result.stdout + result.stderr
print(output)

with open('build_result.txt', 'w') as f:
    f.write(f'EXIT CODE: {result.returncode}\n\n')
    f.write(output)

print(f'\nEXIT CODE: {result.returncode}')
