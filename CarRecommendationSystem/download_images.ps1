# Create the directory for serving static images
$imagesDir = "src/main/resources/static/images"
if (!(Test-Path -Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force
}

# Read and parse cars.json
$jsonPath = "src/main/resources/data/cars.json"
$cars = Get-Content -Raw -Path $jsonPath | ConvertFrom-Json

# List of Unsplash royalty-free car images to cycle through
$unsplashUrls = @(
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80", # SUV
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80", # Sedan
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80", # Sports/Hatch
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&w=600&q=80", # Luxury SUV
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80"  # Hatchback
)

Write-Host "Starting download of 40 car images..."
$index = 0

foreach ($car in $cars) {
    # Generate clean filename based on brand and model
    $cleanBrand = $car.brand.ToLower().Replace(" ", "_")
    $cleanModel = $car.model.ToLower().Replace(" ", "_")
    $filename = "${cleanBrand}_${cleanModel}.jpg"
    $localPath = Join-Path -Path $imagesDir -ChildPath $filename
    
    # Cycle through unsplash URLs
    $urlIndex = $index % $unsplashUrls.Length
    $imageUrl = $unsplashUrls[$urlIndex]
    
    Write-Host "Downloading image for $($car.brand) $($car.model) -> $filename"
    try {
        Invoke-WebRequest -Uri $imageUrl -OutFile $localPath -TimeoutSec 10 -ErrorAction Stop
    } catch {
        Write-Host "Failed to download $filename. Creating a local placeholder."
        # Create a tiny 1x1 black pixel file as a fallback
        [byte[]]$bytes = 0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,0x01,0x01,0x00,0x60,0x00,0x60,0x00,0x00,0xFF,0xDB,0x00,0x43,0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,0x07,0x07,0x07,0x09,0x09,0x08,0x0A,0x0C,0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,0x24,0x2E,0x27,0x20,0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,0x39,0x3D,0x38,0x32,0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,0x00,0x01,0x01,0x01,0x11,0x00,0xFF,0xC4,0x00,0x14,0x00,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x09,0xFF,0xDA,0x00,0x08,0x01,0x01,0x00,0x00,0x3F,0x00,0x37,0xFF,0xD9
        [System.IO.File]::WriteAllBytes($localPath, $bytes)
    }
    
    # Update JSON imageurl field relative to context path
    $car.imageurl = "/images/$filename"
    $index++
}

# Save updated cars.json
$updatedJson = ConvertTo-Json $cars -Depth 100
[System.IO.File]::WriteAllBytes($jsonPath, [System.Text.Encoding]::UTF8.GetBytes($updatedJson))
Write-Host "Successfully completed! Updated cars.json and saved images."
