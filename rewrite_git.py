import subprocess

cmd = [
    'git', 'filter-branch', '-f', '--env-filter',
    'GIT_AUTHOR_NAME="Bhavya"; GIT_AUTHOR_EMAIL="bhavyapatel5239@gmail.com"; GIT_COMMITTER_NAME="Bhavya"; GIT_COMMITTER_EMAIL="bhavyapatel5239@gmail.com"; export GIT_AUTHOR_NAME GIT_AUTHOR_EMAIL GIT_COMMITTER_NAME GIT_COMMITTER_EMAIL;',
    'HEAD'
]
print("Starting git filter-branch...")
result = subprocess.run(cmd, capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
print("Finished history rewrite.")
