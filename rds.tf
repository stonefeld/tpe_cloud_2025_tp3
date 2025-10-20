resource "aws_db_subnet_group" "this" {
  name       = format("%s-subnet-group", var.project_name)
  subnet_ids = module.vpc.private_rds_subnet_ids

  tags = {
    Name = format("%s-subnet-group", var.project_name)
  }
}

resource "aws_db_instance" "this" {
  identifier                          = format("%s-rds", var.project_name)
  engine                              = "postgres"
  instance_class                      = "db.t3.micro"
  storage_type                        = "gp2"
  allocated_storage                   = 20
  username                            = var.db_username
  password                            = var.db_password
  db_name                             = var.db_name
  db_subnet_group_name                = aws_db_subnet_group.this.name
  vpc_security_group_ids              = [aws_security_group.rds.id]
  depends_on                          = [module.vpc]
  skip_final_snapshot                 = true
  publicly_accessible                 = false
  multi_az                            = true
  iam_database_authentication_enabled = true
  deletion_protection                 = false

  # Monitoreo standard
  performance_insights_enabled          = true
  performance_insights_retention_period = 7

  # Nada de enhanced monitoring
  monitoring_interval = 0
  monitoring_role_arn = null

  # Nada de backups
  backup_retention_period = 0
  backup_window           = null
  maintenance_window      = null

  tags = {
    Name = format("%s-rds", var.project_name)
  }
}
