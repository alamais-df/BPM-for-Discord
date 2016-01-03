$node_url = "https://nodejs.org/dist/v4.2.4/win-x86/node.exe"
$node_output = "./node.exe"

if (Get-Command node -errorAction SilentlyContinue)
{
    Write-Host "Found node on path, using it..."
    node index.js
}
else
{
    Write-Host "Cannot find node on PATH, downloading..."
    $wc = New-Object System.Net.WebClient
    $wc.DownloadFile($node_url, $node_output)
    Write-Host "Downloaded node binary, running installer..."
    & ./node.exe index.js
    Write-Host "Removing downloaded node binary..."
    Remove-Item $node_output
}
Write-Host "Press any key to continue..."
$x = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

