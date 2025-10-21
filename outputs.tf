output "api_gateway_url" {
  description = "URL de la API Gateway HTTP"
  value       = module.http_api.api_endpoint
}
