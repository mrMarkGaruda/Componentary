# Test script for AI integration
Write-Host "Testing SmolLM2 AI Integration" -ForegroundColor Green

# Build and start the AI service
Write-Host "Building AI service..." -ForegroundColor Yellow
Set-Location "docker"
docker-compose build smollm-ai

if ($LASTEXITCODE -eq 0) {
    Write-Host "AI service built successfully!" -ForegroundColor Green
    
    # Start the AI service
    Write-Host "Starting AI service..." -ForegroundColor Yellow
    docker-compose up -d smollm-ai
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "AI service started successfully!" -ForegroundColor Green
        
        # Wait for service to be ready
        Write-Host "Waiting for AI service to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Test AI service health
        Write-Host "Testing AI service health..." -ForegroundColor Yellow
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
            Write-Host "AI service health check: $($response | ConvertTo-Json)" -ForegroundColor Green
            
            # Test AI chat endpoint
            Write-Host "Testing AI chat endpoint..." -ForegroundColor Yellow
            $chatRequest = @{
                message = "Hello, can you help me with product information?"
                product_info = @{
                    name = "Test Product"
                    price = 99.99
                    category = "Electronics"
                }
                seller_name = "TestSeller"
            }
            
            $chatResponse = Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method POST -Body ($chatRequest | ConvertTo-Json) -ContentType "application/json"
            Write-Host "AI chat response: $($chatResponse.response)" -ForegroundColor Green
            
        } catch {
            Write-Host "Error testing AI service: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Failed to start AI service" -ForegroundColor Red
    }
} else {
    Write-Host "Failed to build AI service" -ForegroundColor Red
}

Set-Location ".."
