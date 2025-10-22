resource "aws_secretsmanager_secret" "rds_credentials" {
  name                    = format("%s-rds-credentials", var.project_name)
  description             = "Credenciales de la base de datos RDS para RDS Proxy"
  recovery_window_in_days = 0

  tags = {
    Name = format("%s-rds-credentials", var.project_name)
  }
}

resource "aws_secretsmanager_secret_version" "rds_credentials" {
  secret_id = aws_secretsmanager_secret.rds_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = "postgres"
    host     = aws_db_instance.this.address
    port     = 5432
    dbname   = var.db_name
  })

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_db_instance.this]
}

resource "aws_db_proxy" "this" {
  name          = format("%s-rds-proxy", var.project_name)
  engine_family = "POSTGRESQL"

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = aws_secretsmanager_secret.rds_credentials.arn
  }

  role_arn               = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  vpc_subnet_ids         = module.vpc.private_lambda_subnet_ids
  vpc_security_group_ids = [aws_security_group.rds_proxy.id]
  require_tls            = false
  debug_logging          = true

  tags = {
    Name = format("%s-rds-proxy", var.project_name)
  }

  depends_on = [
    aws_secretsmanager_secret_version.rds_credentials,
    aws_db_instance.this
  ]
}

resource "aws_db_proxy_default_target_group" "this" {
  db_proxy_name = aws_db_proxy.this.name

  connection_pool_config {
    connection_borrow_timeout    = 120
    max_connections_percent      = 100
    max_idle_connections_percent = 50
  }
}

resource "aws_db_proxy_target" "this" {
  db_proxy_name          = aws_db_proxy.this.name
  target_group_name      = aws_db_proxy_default_target_group.this.name
  db_instance_identifier = aws_db_instance.this.identifier

  depends_on = [
    aws_db_proxy.this,
    aws_db_instance.this
  ]
}
