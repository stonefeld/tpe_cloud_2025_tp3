output "vpc_id" {
  description = "El ID de la VPC creada"
  value       = aws_vpc.this.id
}

output "private_lambda_subnet_ids" {
  description = "Lista de IDs de subredes privadas para funciones Lambda"
  value = [
    for k, v in aws_subnet.lambda : v.id
  ]
}

output "private_rds_subnet_ids" {
  description = "Lista de IDs de subredes privadas para RDS"
  value = [
    for k, v in aws_subnet.rds : v.id
  ]
}
