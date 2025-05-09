# PowerShell script to add the family_owner_id column to the users table

# Database connection parameters
$pgHost = "localhost"
$pgPort = "5432"
$pgUser = "postgres"
$pgPassword = "postgres"
$pgDatabase = "daswos"

# SQL command to add the column
$sqlCommand = "ALTER TABLE users ADD COLUMN IF NOT EXISTS family_owner_id INTEGER;"

# Path to psql.exe - adjust this to match your PostgreSQL installation
$psqlPath = "C:\Program Files\PostgreSQL\15\bin\psql.exe"
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\14\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\13\bin\psql.exe"
}
if (-not (Test-Path $psqlPath)) {
    $psqlPath = "C:\Program Files\PostgreSQL\12\bin\psql.exe"
}

# Check if psql.exe exists
if (-not (Test-Path $psqlPath)) {
    Write-Host "Could not find psql.exe. Please install PostgreSQL or add it to your PATH."
    exit 1
}

# Set the PGPASSWORD environment variable
$env:PGPASSWORD = $pgPassword

# Run the SQL command
try {
    Write-Host "Connecting to PostgreSQL database..."
    & $psqlPath -h $pgHost -p $pgPort -U $pgUser -d $pgDatabase -c $sqlCommand
    Write-Host "Column added successfully!"
} catch {
    Write-Host "Error adding column: $_"
    exit 1
} finally {
    # Clear the PGPASSWORD environment variable
    $env:PGPASSWORD = ""
}
