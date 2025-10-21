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
