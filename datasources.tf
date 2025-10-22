data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_cognito_user_pool_client" "this" {
  client_id    = aws_cognito_user_pool_client.this.id
  user_pool_id = aws_cognito_user_pool.this.id
}
