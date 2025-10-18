locals {
  # VPC configuration
  vpc_cidr = "10.0.0.0/16"
  az_count = 2

  # Lambda configuration
  lambda_runtime = "python3.11"

  common_tags = {
    Project = var.project_name
  }
}
