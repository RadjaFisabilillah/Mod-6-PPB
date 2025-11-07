@echo off
set PORT=5000
set RULE_NAME="Local Backend Server Port %PORT%"

netsh advfirewall firewall add rule name="Local Backend Server Port 5000" dir=in action=allow protocol=TCP localport=5000

echo.
echo Firewall rule "%RULE_NAME%" created successfully.
echo.
pause