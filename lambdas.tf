locals {
  endpoints = {
    products_get = {
      function_name = "get_products"
      path_part     = "products"
      http_method   = "GET"
    }
    products_post = {
      function_name = "post_products"
      path_part     = "products"
      http_method   = "POST"
    }
    pools_get = {
      function_name = "get_pools"
      path_part     = "pools"
      http_method   = "GET"
    }
    pools_post = {
      function_name = "post_pools"
      path_part     = "pools"
      http_method   = "POST"
    }
    # TODO: Handle nested resources properly
    pool_details_get = {
      function_name = "get_pool_details"
      path_part     = "pools/{id}"
      http_method   = "GET"
    }
    pool_requests_get = {
      function_name = "get_pool_requests"
      path_part     = "pools/{id}/requests"
      http_method   = "GET"
    }
    pool_requests_post = {
      function_name = "post_pool_requests"
      path_part     = "pools/{id}/requests"
      http_method   = "POST"
    }
  }
}

data "aws_caller_identity" "current" {}

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

  environment_variables = {
    # DB_HOST = module.rds.address
    DB_NAME     = var.project_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
  }

  tags = {
    Name = format("lambda-%s", each.value.function_name)
  }
}
