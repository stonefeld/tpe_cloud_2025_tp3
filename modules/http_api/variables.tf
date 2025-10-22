variable "api_name" {
  description = "Name of the HTTP API Gateway"
  type        = string
}

variable "description" {
  description = "Description of the HTTP API Gateway"
  type        = string
  default     = ""
}

variable "cors_origins" {
  description = "CORS allowed origins"
  type        = list(string)
  default     = ["*"]
}

variable "cors_methods" {
  description = "CORS allowed methods"
  type        = list(string)
  default     = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}

variable "cors_headers" {
  description = "CORS allowed headers"
  type        = list(string)
  default     = ["Content-Type", "Authorization"]
}

variable "routes" {
  description = "Map of routes for the HTTP API"
  type = map(object({
    route_key    = string
    function_name = string
    filename     = string
    handler      = string
  }))
}

variable "role" {
  description = "ARN of the IAM role for Lambda functions"
  type        = string
}

variable "runtime" {
  description = "Lambda runtime"
  type        = string
}

variable "subnet_ids" {
  description = "List of subnet IDs for Lambda functions"
  type        = list(string)
}

variable "security_groups" {
  description = "List of security group IDs for Lambda functions"
  type        = list(string)
}

variable "environment_variables" {
  description = "Environment variables for Lambda functions"
  type        = map(string)
  default     = {}
}

variable "layers" {
  description = "List of Lambda layer ARNs"
  type        = list(string)
  default     = []
}

variable "stage_name" {
  description = "Name of the API Gateway stage"
  type        = string
  default     = "prod"
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID for JWT authorization"
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID for JWT authorization"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}
