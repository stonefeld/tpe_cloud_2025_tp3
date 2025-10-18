variable "aws_region" {
  description = "Región de AWS donde se desplegarán los recursos"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre del proyecto usado como prefijo para los recursos"
  type        = string
  default     = "tpe-cloud-grupi"
}

variable "db_username" {
  description = "Nombre de usuario para la base de datos RDS"
  type        = string
  default     = "dbadmin"
}

variable "db_password" {
  description = "Contraseña para la base de datos RDS"
  type        = string
  sensitive   = true
}
