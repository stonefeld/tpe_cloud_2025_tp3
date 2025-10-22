resource "aws_security_group" "lambda" {
  name        = format("%s-lambda-sg", var.project_name)
  description = "Security group para las funciones Lambda"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = format("%s-lambda-sg", var.project_name)
  }
}

resource "aws_security_group" "rds_proxy" {
  name        = format("%s-rds-proxy-sg", var.project_name)
  description = "Security group para RDS Proxy"
  vpc_id      = module.vpc.vpc_id

  # Permitir conexiones entrantes desde Lambda
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
    description     = "Permitir conexiones desde Lambda"
  }

  # Permitir todo el tráfico saliente (necesario para conectarse a RDS)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = format("%s-rds-proxy-sg", var.project_name)
  }
}

resource "aws_security_group" "rds" {
  name        = format("%s-rds-sg", var.project_name)
  description = "Security group para la base de datos RDS"
  vpc_id      = module.vpc.vpc_id

  # Permitir conexiones desde RDS Proxy
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.rds_proxy.id]
    description     = "Permitir conexiones desde RDS Proxy"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = format("%s-rds-sg", var.project_name)
  }
}
