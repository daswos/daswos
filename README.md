# DASWOS APPLICATION

## STARTUP INSTRUCTIONS

### Local Development

```
1. INSTALL DEPENDENCIES:
   npm install

2. START APPLICATION (choose one):
   - Windows: start.bat
   - PowerShell: .\start.ps1
   - If port conflicts occur: start-auto-port.bat
   - Command line: npm run dev

3. ACCESS APPLICATION:
   http://localhost:5000
```

### Docker Deployment

```
1. BUILD AND PUSH DOCKER IMAGE:
   docker-build-push.bat

2. RUN DOCKER CONTAINER:
   docker-run.bat

3. ACCESS APPLICATION:
   http://localhost:5000
```

## DATABASE SETUP

```
1. SETUP DATABASE:
   npm run db:push
```
