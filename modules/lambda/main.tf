resource "aws_lambda_function" "this" {
  filename = var.filename

  function_name    = var.function_name
  role             = var.role
  handler          = "lambda_${var.function_name}.handler"
  runtime          = var.runtime
  source_code_hash = filebase64sha512(var.filename)

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = var.security_groups
  }

  environment {
    variables = var.environment_variables
  }

  tags = var.tags
}

resource "aws_lambda_permission" "allow_api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.this.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}

resource "aws_api_gateway_resource" "this" {
  path_part   = var.path_part
  parent_id   = var.api_gateway_resource_id
  rest_api_id = var.api_gateway_id
}

resource "aws_api_gateway_method" "this" {
  rest_api_id   = var.api_gateway_id
  resource_id   = aws_api_gateway_resource.this.id
  http_method   = var.http_method
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "this" {
  rest_api_id             = var.api_gateway_id
  resource_id             = aws_api_gateway_resource.this.id
  http_method             = aws_api_gateway_method.this.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.this.invoke_arn
}

resource "aws_api_gateway_method_response" "this" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.this.id
  http_method = aws_api_gateway_method.this.http_method
  status_code = var.status_code
}

resource "aws_api_gateway_integration_response" "this" {
  rest_api_id = var.api_gateway_id
  resource_id = aws_api_gateway_resource.this.id
  http_method = aws_api_gateway_method.this.http_method
  status_code = aws_api_gateway_method_response.this.status_code

  depends_on = [aws_api_gateway_integration.this]
}
