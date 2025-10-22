resource "aws_apigatewayv2_api" "this" {
  name          = var.api_name
  protocol_type = "HTTP"
  description   = var.description

  cors_configuration {
    allow_origins = var.cors_origins
    allow_methods = var.cors_methods
    allow_headers = var.cors_headers
  }
}

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.this.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "cognito-authorizer"

  jwt_configuration {
    audience = [var.cognito_user_pool_client_id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${var.cognito_user_pool_id}"
  }
}

module "endpoints" {
  source = "../lambda"

  for_each = var.routes

  filename      = each.value.filename
  function_name = each.value.function_name
  handler       = each.value.handler
  role          = var.role
  runtime       = var.runtime
  layers        = var.layers

  subnet_ids      = var.subnet_ids
  security_groups = var.security_groups

  environment_variables = var.environment_variables

  tags = var.tags
}

resource "aws_lambda_permission" "this" {
  for_each = var.routes

  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = module.endpoints[each.key].function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

resource "aws_apigatewayv2_route" "this" {
  for_each = var.routes

  api_id             = aws_apigatewayv2_api.this.id
  route_key          = each.value.route_key
  target             = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
}

resource "aws_apigatewayv2_integration" "this" {
  for_each = var.routes

  api_id           = aws_apigatewayv2_api.this.id
  integration_type = "AWS_PROXY"
  integration_uri  = module.endpoints[each.key].invoke_arn
}

resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = var.stage_name
  auto_deploy = true
}
