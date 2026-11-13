Add-Type -AssemblyName System.Drawing
$filePath = Resolve-Path "src\assets\figma\img3DMedicalBodyIllustrative.png"
$img = [System.Drawing.Image]::FromFile($filePath)
Write-Output "Dimensions: $($img.Width) x $($img.Height)"
$img.Dispose()

