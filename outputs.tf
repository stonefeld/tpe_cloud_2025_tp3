# Outputs principales del proyecto
output "api_gateway_url" {
  description = "URL de la API Gateway HTTP"
  value       = module.http_api.api_endpoint
}

# URL del sitio web estático en S3
output "website_url" {
  description = "URL del sitio web estático hosteado en S3"
  value       = "http://${module.s3_website.s3_bucket_website_endpoint}"
}

# URL del bucket S3
output "website_bucket_name" {
  description = "Nombre del bucket S3 que aloja el sitio web"
  value       = module.s3_website.s3_bucket_id
}

# URL del API Gateway
output "api_gateway_url" {
  description = "URL base del API Gateway"
  value       = aws_api_gateway_stage.this.invoke_url
}

# ID del API Gateway
output "api_gateway_id" {
  description = "ID del API Gateway REST API"
  value       = aws_api_gateway_rest_api.this.id
}

# Endpoint de la base de datos RDS
output "rds_endpoint" {
  description = "Endpoint de conexión a la base de datos RDS"
  value       = aws_db_instance.this.endpoint
  sensitive   = true
}

# Información del VPC
output "vpc_id" {
  description = "ID del VPC"
  value       = module.vpc.vpc_id
}

# Comandos útiles
output "useful_commands" {
  description = "Comandos útiles para interactuar con la infraestructura"
  value = <<-EOT
    # Sincronizar archivos actualizados al S3:
    aws s3 sync ./resources s3://${module.s3_website.s3_bucket_id}/ --delete
    
    # Ver logs de Lambda:
    aws logs tail /aws/lambda/<function-name> --follow
    
    # Probar el API Gateway:
    curl ${aws_api_gateway_stage.this.invoke_url}/products
  EOT
}
