@echo off
title Brick Classico - Servidor Local
cd /d "D:\EZZO Workspace\PROJECTOS\Game"

chcp 65001 >nul 2>&1

:menu
cls
echo.
echo  ╔══════════════════════════════════╗
echo  ║     BRICK CLASSICO - LAUNCHER    ║
echo  ╠══════════════════════════════════╣
echo  ║                                  ║
echo  ║  1. Iniciar Jogo                 ║
echo  ║  2. Atualizar (git pull)         ║
echo  ║  3. Abrir GitHub Releases        ║
echo  ║  4. Sair                         ║
echo  ║                                  ║
echo  ╚══════════════════════════════════╝
echo.
set /p opcao="Escolha uma opcao (1-4): "

if "%opcao%"=="1" goto start
if "%opcao%"=="2" goto update
if "%opcao%"=="3" goto releases
if "%opcao%"=="4" goto sair
goto menu

:update
echo.
echo  >>  A verificar actualizacoes...
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRO] Git nao encontrado. Instala o Git: https://git-scm.com/
    echo.
    pause
    goto menu
)

git remote -v >nul 2>&1
if %errorlevel% neq 0 (
    echo  [AVISO] Repositorio git nao configurado.
    echo  Executa: git init ^&^& git remote add origin https://github.com/eliassebastiao/ezzogame.git
    echo.
    pause
    goto menu
)

echo  >>  git fetch --tags
git fetch --tags
echo.
echo  >>  git pull origin main
git pull origin main
if %errorlevel% equ 0 (
    echo.
    echo  [OK] Repositorio actualizado!
    echo  >>  npm install
    call npm install
) else (
    echo.
    echo  [AVISO] Falha ao atualizar. Verifica conflitos manuais.
)
echo.
pause
goto menu

:releases
echo.
echo  >>  A abrir pagina de releases no browser...
start https://github.com/eliassebastiao/ezzogame/releases/latest
echo.
pause
goto menu

:start
echo.
echo  ╔══════════════════════════════════╗
echo  ║     BRICK CLASSICO - SERVER      ║
echo  ╠══════════════════════════════════╣
echo  ║  A iniciar servidor...           ║
echo  ╚══════════════════════════════════╝
echo.

:: Verificar se a porta 8081 ja esta em uso
netstat -ano | findstr :8081 >nul 2>&1
if %errorlevel% == 0 (
    echo.
    echo  [AVISO] A porta 8081 ja esta em uso!
    echo  A matar processo anterior...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo  >>  Abrindo http://localhost:8081 no browser...
echo.

start http://localhost:8081
node server.js

echo.
pause
goto menu

:sair
exit /b 0
