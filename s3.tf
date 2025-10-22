# S3 bucket para alojar el SPA usando módulo externo
module "s3_website" {
  source  = "terraform-aws-modules/s3-bucket/aws"
  version = "5.8.1"

  bucket = "${var.project_name}-website-${data.aws_caller_identity.current.account_id}"

  # Configuración para sitio web estático
  website = {
    index_document = "index.html"
    error_document = "index.html"
  }

  # Desactivar bloqueo de acceso público para permitir acceso al sitio web
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false

  # Habilitar versionado para mantener historial de archivos
  versioning = {
    enabled = false
  }

  # CORS para permitir llamadas al API Gateway desde el SPA
  cors_rule = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
      allowed_origins = ["*"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]

  tags = merge(
    local.common_tags,
    {
      Name = "${var.project_name}-website"
    }
  )
}

# Política de bucket para permitir acceso público de lectura
resource "aws_s3_bucket_policy" "website_policy" {
  bucket = module.s3_website.s3_bucket_id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${module.s3_website.s3_bucket_arn}/*"
      }
    ]
  })

  depends_on = [module.s3_website]
}

# Subir archivos del SPA al bucket
resource "aws_s3_object" "website_files" {
  # Excluir node_modules del despliegue del sitio
  for_each = setsubtract(
    fileset("${path.module}/resources", "**/*"),
    fileset("${path.module}/resources", "node_modules/**")
  )

  bucket       = module.s3_website.s3_bucket_id
  key          = each.value
  source       = "${path.module}/resources/${each.value}"
  etag         = filemd5("${path.module}/resources/${each.value}")
  # Detectar content-type de forma segura (archivos sin extensión vuelven al default)
  content_type = lookup(
    local.mime_types,
    try(regex("\\.[^.]+$", each.value), ""),
    "application/octet-stream"
  )

  depends_on = [aws_s3_bucket_policy.website_policy]
}

# Archivo especial para configuración del API Gateway (se genera dinámicamente)
resource "aws_s3_object" "api_config" {
  bucket       = module.s3_website.s3_bucket_id
  key          = "config.js"
  content_type = "application/javascript"

  content = <<-EOF
    // Configuración generada automáticamente por Terraform
    window.API_CONFIG = {
      apiUrl: '${module.http_api.api_endpoint}',
      region: '${var.aws_region}'
    };
  EOF

  depends_on = [aws_s3_bucket_policy.website_policy]
}
