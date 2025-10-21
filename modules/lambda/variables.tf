variable "filename" {
  description = "Ruta al archivo ZIP que contiene el código de la función Lambda"
  type        = string
}

variable "function_name" {
  description = "Nombre de la función Lambda"
  type        = string
}

variable "handler" {
  description = "Handler de la función Lambda (ej: lambda_function.handler)"
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

variable "tags" {
  description = "Etiquetas para los recursos de Lambda"
  type        = map(string)
  default     = {}
}
