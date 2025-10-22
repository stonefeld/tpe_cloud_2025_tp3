output "api_gateway_url" {
  description = "URL de la API Gateway HTTP"
  value       = module.http_api.api_endpoint
}

output "website_url" {
  description = "URL del sitio web estático hosteado en S3"
  value       = "http://${module.s3_website.s3_bucket_website_endpoint}"
}

output "website_bucket_name" {
  description = "Nombre del bucket S3 que aloja el sitio web"
  value       = module.s3_website.s3_bucket_id
}

output "rds_proxy_endpoint" {
  description = "Endpoint del RDS Proxy para conexiones de Lambda"
  value       = aws_db_proxy.this.endpoint
}

output "rds_instance_endpoint" {
  description = "Endpoint directo de la instancia RDS (solo para referencia)"
  value       = aws_db_instance.this.endpoint
}
