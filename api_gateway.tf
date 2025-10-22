module "http_api" {
  source = "./modules/http_api"

  api_name    = "${var.project_name}-apigw"
  description = "HTTP API Gateway para ${var.project_name}"

  routes = {
    get_products = {
      route_key     = "GET /products"
      function_name = "get_products"
      filename      = "${path.module}/functions/lambda_get_products.zip"
      handler       = "lambda_get_products.handler"
    }
    post_products = {
      route_key     = "POST /products"
      function_name = "post_products"
      filename      = "${path.module}/functions/lambda_post_products.zip"
      handler       = "lambda_post_products.handler"
    }
    get_pools = {
      route_key     = "GET /pools"
      function_name = "get_pools"
      filename      = "${path.module}/functions/lambda_get_pools.zip"
      handler       = "lambda_get_pools.handler"
    }
    post_pools = {
      route_key     = "POST /pools"
      function_name = "post_pools"
      filename      = "${path.module}/functions/lambda_post_pools.zip"
      handler       = "lambda_post_pools.handler"
    }
    get_product_details = {
      route_key     = "GET /products/{id}"
      function_name = "get_product_details"
      filename      = "${path.module}/functions/lambda_get_product_details.zip"
      handler       = "lambda_get_product_details.handler"
    }
    get_pool_details = {
      route_key     = "GET /pools/{id}"
      function_name = "get_pool_details"
      filename      = "${path.module}/functions/lambda_get_pool_details.zip"
      handler       = "lambda_get_pool_details.handler"
    }
    get_pool_requests = {
      route_key     = "GET /pools/{id}/requests"
      function_name = "get_pool_requests"
      filename      = "${path.module}/functions/lambda_get_pool_requests.zip"
      handler       = "lambda_get_pool_requests.handler"
    }
    post_pool_requests = {
      route_key     = "POST /pools/{id}/requests"
      function_name = "post_pool_requests"
      filename      = "${path.module}/functions/lambda_post_pool_requests.zip"
      handler       = "lambda_post_pool_requests.handler"
    }
  }

  role            = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  runtime         = local.lambda_runtime
  subnet_ids      = module.vpc.private_lambda_subnet_ids
  security_groups = [aws_security_group.lambda.id]
  layers          = [aws_lambda_layer_version.psycopg2.arn]

  environment_variables = {
    DB_HOST     = aws_db_proxy.this.endpoint 
    DB_PORT     = "5432"
    DB_NAME     = aws_db_instance.this.db_name
    DB_USER     = var.db_username
    DB_PASSWORD = var.db_password
  }

  depends_on = [aws_db_proxy_target.this, aws_lambda_layer_version.psycopg2]

  tags = {
    Name = var.project_name
  }
}
