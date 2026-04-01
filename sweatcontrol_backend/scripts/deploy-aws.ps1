@'
# ==================== AWS Deployment Script (Windows) ====================

Write-Host "🚀 Starting AWS Deployment..." -ForegroundColor Cyan

# Check AWS CLI
$awsInstalled = Get-Command aws -ErrorAction SilentlyContinue
if (-not $awsInstalled) {
    Write-Host "❌ AWS CLI not installed" -ForegroundColor Red
    exit 1
}

# Check Terraform
$tfInstalled = Get-Command terraform -ErrorAction SilentlyContinue
if (-not $tfInstalled) {
    Write-Host "❌ Terraform not installed" -ForegroundColor Red
    exit 1
}

# Check Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerInstalled) {
    Write-Host "❌ Docker not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment checks passed" -ForegroundColor Green

# Services list
$services = @(
    "product-service",
    "cart-service", 
    "order-service",
    "inventory-service",
    "payment-service",
    "notification-service",
    "api-gateway"
)

# Build and push images
Write-Host "`n📦 Building and pushing Docker images..." -ForegroundColor Yellow

foreach ($service in $services) {
    Write-Host "Building $service..." -ForegroundColor Cyan
    docker build -t "sweatcontrol/$service`:`latest" "./$service"
    
    # Tag and push to ECR (add your ECR login here)
    # docker tag "sweatcontrol/$service`:`latest" "$ECR_URI/$service`:`latest"
    # docker push "$ECR_URI/$service`:`latest"
    
    Write-Host "✅ $service built" -ForegroundColor Green
}

# Deploy with Terraform
Write-Host "`n🏗️ Deploying infrastructure..." -ForegroundColor Yellow
Set-Location terraform

terraform init
terraform plan -out=tfplan
terraform apply tfplan

$albDNS = terraform output -raw alb_dns_name

Set-Location ..

Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 API Gateway: http://$albDNS"
'@ | Out-File -FilePath ..\scripts\deploy-aws.ps1 -Encoding utf8