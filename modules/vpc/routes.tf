resource "aws_route_table" "lambda" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = format("%s-private-lambda-rt", var.project_name)
  }
}

resource "aws_route_table" "rds" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = format("%s-private-rds-rt", var.project_name)
  }
}

resource "aws_route_table_association" "lambda" {
  count          = length(aws_subnet.lambda)
  subnet_id      = aws_subnet.lambda[count.index].id
  route_table_id = aws_route_table.lambda.id
}

resource "aws_route_table_association" "rds" {
  count          = length(aws_subnet.rds)
  subnet_id      = aws_subnet.rds[count.index].id
  route_table_id = aws_route_table.rds.id
}
