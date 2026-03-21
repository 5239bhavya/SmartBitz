git config user.name "Bhavya"
git config user.email "bhavyapatel5239@gmail.com"
git add .
git commit -m "Prepare for push"
git remote remove origin 2>$null
git remote add origin https://github.com/5239bhavya/SmartBitz.git
git branch -M main
git push origin main -f
