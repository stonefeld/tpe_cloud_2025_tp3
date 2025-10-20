locals {
  endpoints = {
    get_products = {
      function_name = "get_products"
      path_part     = "products"
      http_method   = "GET"
    }
    post_products = {
      function_name = "post_products"
      path_part     = "products"
      http_method   = "POST"
    }
    get_pools = {
      function_name = "get_pools"
      path_part     = "pools"
      http_method   = "GET"
    }
    post_pools = {
      function_name = "post_pools"
      path_part     = "pools"
      http_method   = "POST"
    }
    # TODO: Handle nested resources properly
    # pool_details_get = {
    #   function_name = "get_pool_details"
    #   path_part     = "pools/{id}"
    #   http_method   = "GET"
    # }
    # pool_requests_get = {
    #   function_name = "get_pool_requests"
    #   path_part     = "pools/{id}/requests"
    #   http_method   = "GET"
    # }
    # pool_requests_post = {
    #   function_name = "post_pool_requests"
    #   path_part     = "pools/{id}/requests"
    #   http_method   = "POST"
    # }
  }
}

data "aws_caller_identity" "current" {}

resource "aws_lambda_layer_version" "psycopg2" {
  filename            = "${path.module}/layers/psycopg2-layer.zip"
  layer_name          = "psycopg2-layer"
  compatible_runtimes = ["python3.9", "python3.10", "python3.11", "python3.12"]
  description         = "Lambda layer que contiene la librería psycopg2 para conectarse a PostgreSQL"

  depends_on = [null_resource.build_layer]
}

# Definición de los endpoints que se conectan con API Gateway
module "endpoints" {
  source = "./modules/lambda"

  for_each = local.endpoints

  filename                  = "${path.module}/functions/lambda_${each.value.function_name}.zip"
  function_name             = each.value.function_name
  path_part                 = each.value.path_part
  http_method               = each.value.http_method
  role                      = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  runtime                   = local.lambda_runtime
  subnet_ids                = module.vpc.private_lambda_subnet_ids
  security_groups           = [aws_security_group.lambda.id]
  api_gateway_id            = aws_api_gateway_rest_api.this.id
  api_gateway_resource_id   = aws_api_gateway_rest_api.this.root_resource_id
  api_gateway_execution_arn = aws_api_gateway_rest_api.this.execution_arn
  layers                    = [aws_lambda_layer_version.psycopg2.arn]

  environment_variables = {
    DB_HOST     = aws_db_instance.this.address
    DB_NAME     = aws_db_instance.this.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
  }

  depends_on = [aws_db_instance.this, aws_lambda_layer_version.psycopg2]

  tags = {
    Name = format("%s-%s", var.project_name, each.value.function_name)
  }
}

# Lambda para inicializar la base de datos
resource "aws_lambda_function" "rds_init" {
  filename         = "${path.module}/functions/lambda_rds_init.zip"
  function_name    = "rds_init"
  role             = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  handler          = "lambda_rds_init.handler"
  runtime          = local.lambda_runtime
  source_code_hash = filebase64sha512("${path.module}/functions/lambda_rds_init.zip")
  layers           = [aws_lambda_layer_version.psycopg2.arn]

  vpc_config {
    subnet_ids         = module.vpc.private_lambda_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DB_HOST     = aws_db_instance.this.address
      DB_NAME     = aws_db_instance.this.db_name
      DB_USER     = var.db_username
      DB_PASSWORD = var.db_password
    }
  }

  depends_on = [aws_db_instance.this, aws_lambda_layer_version.psycopg2]

  tags = {
    Name = format("%s-%s", var.project_name, "rds_init")
  }
}

resource "null_resource" "init_database" {
  depends_on = [aws_lambda_function.rds_init]

  provisioner "local-exec" {
    command = "aws lambda invoke --function-name ${aws_lambda_function.rds_init.function_name} --region ${var.aws_region} /tmp/lambda_init_response.json"
  }
}
