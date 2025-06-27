# Test improved AI responses
Write-Host "Testing Improved SmolLM2 AI Responses" -ForegroundColor Green

# Test data for various scenarios
$testCases = @(
    @{
        message = "Hello, can you tell me about this product?"
        product = @{
            name = "NVIDIA RTX 4090"
            price = 1599.99
            category = "Graphics Cards"
            description = "High-performance gaming graphics card with 24GB GDDR6X memory"
            stock = 5
        }
        expected = "greeting with product context"
    },
    @{
        message = "What's the price of this?"
        product = @{
            name = "AMD Ryzen 7 5800X"
            price = 299.99
            category = "Processors"
            stock = 12
        }
        expected = "price information"
    },
    @{
        message = "Is this in stock?"
        product = @{
            name = "Corsair RAM"
            price = 89.99
            stock = 0
        }
        expected = "stock status"
    },
    @{
        message = "Tell me about shipping"
        product = @{}
        expected = "shipping information"
    },
    @{
        message = "Random off-topic question about weather"
        product = @{}
        expected = "professional redirect"
    }
)

Write-Host "Starting AI service container..." -ForegroundColor Yellow
Set-Location "docker"
docker-compose up -d smollm-ai

# Wait for service to start
Write-Host "Waiting for AI service to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

Write-Host "`nTesting AI responses..." -ForegroundColor Cyan

foreach ($test in $testCases) {
    Write-Host "`n--- Test Case ---" -ForegroundColor Magenta
    Write-Host "Message: $($test.message)" -ForegroundColor White
    Write-Host "Expected: $($test.expected)" -ForegroundColor Gray
    
    $requestBody = @{
        message = $test.message
        product_info = $test.product
        seller_name = "TechSeller"
    }
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8000/chat" -Method POST -Body ($requestBody | ConvertTo-Json -Depth 5) -ContentType "application/json" -TimeoutSec 30
        Write-Host "AI Response: $($response.response)" -ForegroundColor Green
        Write-Host "Confidence: $($response.confidence)" -ForegroundColor Yellow
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 2
}

Write-Host "`nTesting health endpoint..." -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/health" -Method GET
    Write-Host "Health Status: $($health.status)" -ForegroundColor Green
    Write-Host "Model Loaded: $($health.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Set-Location ".."
