@echo off
title Brick Classico - Build APK
cd /d "D:\EZZO Workspace\PROJECTOS\Game"
chcp 65001 >nul 2>&1

echo.
echo  ╔══════════════════════════════════╗
echo  ║    BRICK CLASSICO - BUILD APK    ║
echo  ╚══════════════════════════════════╝
echo.

:: Step 1 - Preparar www/
echo  [1/4] A preparar www/...
if exist www rmdir /s /q www
mkdir www
copy index.html www\ >nul
xcopy /e /i /q src www\src >nul
echo  [OK] www/ pronto

:: Step 2 - Sync Capacitor
echo  [2/4] A sincronizar com Capacitor...
call npx cap sync
if %errorlevel% neq 0 (
    echo  [ERRO] cap sync falhou!
    pause
    exit /b 1
)
echo  [OK] Capacitor sincronizado

:: Step 3 - Build APK
echo  [3/4] A compilar APK (assembleDebug)...
cd android
if not exist gradlew.bat (
    echo  [ERRO] gradlew.bat nao encontrado em android/
    pause
    exit /b 1
)
call ./gradlew assembleDebug
if %errorlevel% neq 0 (
    echo  [ERRO] Build falhou!
    cd ..
    pause
    exit /b 1
)
cd ..

:: Step 4 - Localizar APK
echo  [4/4] A localizar APK...
for /r android %%f in (*.apk) do (
    echo  [APK] %%f
)
echo.
echo  ╔══════════════════════════════════╗
echo  ║     BUILD CONCLUIDO COM SUCESSO  ║
echo  ╚══════════════════════════════════╝
echo.
pause
