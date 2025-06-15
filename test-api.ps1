# Test script for Componentary API endpoints
$baseUrl = "http://localhost:3001"

Write-Host "=== Componentary API Test Script ===" -ForegroundColor Green
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest "$baseUrl/health" -UseBasicParsing
    Write-Host "✅ Health Check: $($healthResponse.StatusCode)" -ForegroundColor Green
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "   MongoDB: $($healthData.services.mongodb)" -ForegroundColor Cyan
    Write-Host "   Neo4j: $($healthData.services.neo4j)" -ForegroundColor Cyan
    Write-Host "   Redis: $($healthData.services.redis)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Products Endpoint
Write-Host "2. Testing Products Endpoint..." -ForegroundColor Yellow
try {
    $productsResponse = Invoke-WebRequest "$baseUrl/api/products" -UseBasicParsing
    Write-Host "✅ Products: $($productsResponse.StatusCode)" -ForegroundColor Green
    $products = $productsResponse.Content | ConvertFrom-Json
    Write-Host "   Found $($products.Count) products" -ForegroundColor Cyan
    if ($products.Count -gt 0) {
        Write-Host "   First product: $($products[0].name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Products Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Recommendations Endpoint
Write-Host "3. Testing Recommendations Endpoint..." -ForegroundColor Yellow
try {
    $recResponse = Invoke-WebRequest "$baseUrl/api/recommendations/trending" -UseBasicParsing
    Write-Host "✅ Recommendations: $($recResponse.StatusCode)" -ForegroundColor Green
    $recommendations = $recResponse.Content | ConvertFrom-Json
    Write-Host "   Found $($recommendations.Count) trending items" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Recommendations Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Test Frontend
Write-Host "4. Testing Frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest "http://localhost:5000" -UseBasicParsing
    Write-Host "✅ Frontend: $($frontendResponse.StatusCode)" -ForegroundColor Green
    if ($frontendResponse.Content -like "*Componentary*") {
        Write-Host "   Frontend loaded correctly" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Frontend Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=== Test Complete ===" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host "MongoDB Admin: http://localhost:8081" -ForegroundColor Cyan
Write-Host "Neo4j Browser: http://localhost:7474" -ForegroundColor Cyan
Write-Host "Redis Commander: http://localhost:8082" -ForegroundColor Cyan
