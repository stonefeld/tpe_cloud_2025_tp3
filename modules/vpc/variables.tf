variable "vpc_cidr" {
  description = "Bloque CIDR para la VPC"
  type        = string
}

variable "project_name" {
  description = "Nombre del proyecto usado como prefijo para los recursos"
  type        = string
}

variable "az_count" {
  description = "Número de zonas de disponibilidad a utilizar"
  type        = number
}
