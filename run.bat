@echo off
setlocal

REM ─── Medica — single command launcher ───────────────────────────────
REM Usage: run.bat
REM Compiles all Java sources and launches the application.
REM Requires: Java 11+ on PATH, lib\ folder with the two JARs.
REM ────────────────────────────────────────────────────────────────────

set MAIN=com.medica.MedicaApp
set SRC=src\main\java
set OUT=target\classes
set CP=lib\postgresql-42.7.3.jar;lib\jbcrypt-0.4.jar

REM Check config.properties
if not exist "config.properties" (
    echo.
    echo  [ERROR] config.properties not found.
    echo  Copy config.properties.example to config.properties
    echo  and fill in your Supabase credentials.
    echo.
    pause
    exit /b 1
)

REM Create output directory
if not exist "%OUT%" mkdir "%OUT%"

REM Compile
echo Compiling...
javac -cp "%CP%" -d "%OUT%" -sourcepath "%SRC%" ^
    %SRC%\com\medica\MedicaApp.java ^
    %SRC%\com\medica\auth\*.java ^
    %SRC%\com\medica\db\*.java ^
    %SRC%\com\medica\model\*.java ^
    %SRC%\com\medica\observer\*.java ^
    %SRC%\com\medica\service\*.java ^
    %SRC%\com\medica\ui\*.java

if %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Compilation failed.
    pause
    exit /b 1
)

REM Run
echo.
java -cp "%OUT%;%CP%" %MAIN%
