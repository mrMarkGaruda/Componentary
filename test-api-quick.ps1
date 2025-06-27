# Quick API Test Script

Write-Host "Testing Componentary API endpoints..." -ForegroundColor Green

# Test health endpoint
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Health check: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test products endpoint
try {
    $products = Invoke-RestMethod -Uri "http://localhost:3001/api/products" -Method GET -TimeoutSec 5
    Write-Host "✅ Products API: Found $($products.totalProducts) products" -ForegroundColor Green
} catch {
    Write-Host "❌ Products API failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test product filters endpoint
try {
    $filters = Invoke-RestMethod -Uri "http://localhost:3001/api/products/filters" -Method GET -TimeoutSec 5
    Write-Host "✅ Product filters: $($filters.categories.Count) categories, $($filters.manufacturers.Count) manufacturers" -ForegroundColor Green
} catch {
    Write-Host "❌ Product filters failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI test completed. If all tests passed, the backend is working correctly!" -ForegroundColor Cyan
Write-Host "To test the frontend, visit: http://localhost:5000" -ForegroundColor Cyan
