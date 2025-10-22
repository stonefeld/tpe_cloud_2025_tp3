resource "aws_lambda_layer_version" "psycopg2" {
  filename            = "${path.module}/layers/layer_psycopg2.zip"
  layer_name          = "psycopg2"
  compatible_runtimes = ["python3.9", "python3.10", "python3.11", "python3.12"]
  description         = "Lambda layer que contiene la librería psycopg2 para conectarse a PostgreSQL"
}

# Lambda para inicializar la base de datos usando el módulo lambda
module "rds_init" {
  source = "./modules/lambda"

  filename      = "${path.module}/functions/lambda_rds_init.zip"
  function_name = "rds_init"
  handler       = "lambda_rds_init.handler"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  runtime       = local.lambda_runtime
  layers        = [aws_lambda_layer_version.psycopg2.arn]

  subnet_ids      = module.vpc.private_lambda_subnet_ids
  security_groups = [aws_security_group.lambda.id]

  environment_variables = {
    DB_HOST     = aws_db_proxy.this.endpoint
    DB_PORT     = "5432"
    DB_NAME     = aws_db_instance.this.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
  }

  depends_on = [
      aws_db_proxy_target.this,
      aws_lambda_layer_version.psycopg2,
      aws_db_proxy.this
    ]

  tags = {
    Name = format("%s-rds-init", var.project_name)
  }
}

resource "null_resource" "init_database" {
  depends_on = [
    module.rds_init,
    aws_db_proxy_target.this
  ]

  provisioner "local-exec" {
    command = "aws lambda invoke --function-name ${module.rds_init.function_name} --region ${var.aws_region} lambda_init_response.json"
  }
}

# Lambda para post-confirmation de Cognito
module "cognito_post_confirmation" {
  source = "./modules/lambda"

  filename      = "${path.module}/functions/lambda_cognito_post_confirmation.zip"
  function_name = "cognito_post_confirmation"
  handler       = "lambda_cognito_post_confirmation.handler"
  role          = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  runtime       = local.lambda_runtime
  layers        = [aws_lambda_layer_version.psycopg2.arn]

  subnet_ids      = module.vpc.private_lambda_subnet_ids
  security_groups = [aws_security_group.lambda.id]

  environment_variables = {
    DB_HOST     = aws_db_instance.this.address
    DB_NAME     = aws_db_instance.this.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
  }

  depends_on = [aws_db_instance.this, aws_lambda_layer_version.psycopg2]

  tags = {
    Name = format("%s-cognito-post-confirmation", var.project_name)
  }
}

resource "aws_lambda_permission" "allow_cognito_to_invoke_post_confirmation" {
  statement_id  = "AllowCognitoInvokePostConfirmationTrigger"
  action        = "lambda:InvokeFunction"
  function_name = module.cognito_post_confirmation.function_name
  principal     = "cognito-idp.amazonaws.com"
  source_arn    = aws_cognito_user_pool.this.arn
}

# Lambda proxy eliminado - usamos páginas propias
