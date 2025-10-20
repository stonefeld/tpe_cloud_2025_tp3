variable "tags" {
  description = "Etiquetas para los recursos de Lambda"
  type        = map(string)
}

variable "filename" {
  description = "Ruta al archivo ZIP que contiene el código de la función Lambda"
  type        = string
}

variable "function_name" {
  description = "Nombre de la función Lambda"
  type        = string
}

variable "role" {
  description = "ARN del rol de IAM que la función Lambda asume al ejecutarse"
  type        = string
}

variable "runtime" {
  description = "El runtime de la función Lambda"
  type        = string
}

variable "subnet_ids" {
  description = "Lista de IDs de subredes donde se desplegará la función Lambda"
  type        = list(string)
}

variable "security_groups" {
  description = "Lista de IDs de security groups asociados a la función Lambda"
  type        = list(string)
}

variable "api_gateway_id" {
  description = "ID del API Gateway asociado a la función Lambda"
  type        = string
}

variable "api_gateway_resource_id" {
  description = "ID del recurso padre en el API Gateway"
  type        = string
}

variable "api_gateway_execution_arn" {
  description = "ARN de ejecución del API Gateway para permisos de Lambda"
  type        = string
}

variable "path_part" {
  description = "Parte del path para el recurso del API Gateway"
  type        = string
}

variable "http_method" {
  description = "Método HTTP para el recurso del API Gateway (GET, POST, etc.)"
  type        = string
}

variable "status_code" {
  description = "Código de estado HTTP para la respuesta del método del API Gateway"
  type        = string
  default     = "200"
}

variable "environment_variables" {
  description = "Variables de entorno para la función Lambda"
  type        = map(string)
  default     = {}
}

variable "layers" {
  description = "Lista de ARNs de layers para la función Lambda"
  type        = list(string)
  default     = []
}
