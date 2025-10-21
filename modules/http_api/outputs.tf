output "api_id" {
  description = "ID of the HTTP API Gateway"
  value       = aws_apigatewayv2_api.this.id
}

output "api_endpoint" {
  description = "Endpoint URL of the HTTP API Gateway"
  value       = aws_apigatewayv2_api.this.api_endpoint
}

output "execution_arn" {
  description = "Execution ARN of the HTTP API Gateway"
  value       = aws_apigatewayv2_api.this.execution_arn
}

output "lambda_function_arns" {
  description = "ARNs of the Lambda functions"
  value       = { for k, v in module.endpoints : k => v.function_arn }
}

output "lambda_function_names" {
  description = "Names of the Lambda functions"
  value       = { for k, v in module.endpoints : k => v.function_name }
}
