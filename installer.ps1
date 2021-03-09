Write-Host "@FedaiUserBot" -ForegroundColor Cyan -BackgroundColor Black
Set-ExecutionPolicy RemoteSigned -scope CurrentUser
Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')
Write-Host "Installing scoop" -ForegroundColor DarkGreen
scoop update
scoop install nodejs --global
scoop install git

$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
Write-Host "Installing Fedai" -ForegroundColor White -BackgroundColor DarkGreen

git clone https://github.com/muhammedkpln/fedai-userbot
Set-Location fedai-userbot
npm install @adiwajshing/baileys
npm install chalk
node qr.js
