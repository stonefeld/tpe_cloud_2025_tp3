locals {
  # VPC configuration
  vpc_cidr = "10.0.0.0/16"
  az_count = 2

  # Lambda configuration
  lambda_runtime = "python3.11"

  # Tipos MIME para archivos estáticos
  mime_types = {
    ".html" = "text/html"
    ".css"  = "text/css"
    ".js"   = "application/javascript"
    ".json" = "application/json"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".txt"  = "text/plain"
  }

  common_tags = {
    Project = var.project_name
  }
}
