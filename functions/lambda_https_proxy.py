import json
import boto3
import urllib3
from urllib.parse import urlparse, parse_qs
import base64

def lambda_handler(event, context):
    """
    Lambda function que actúa como proxy HTTPS para el sitio web S3
    """
    
    # Obtener el bucket S3 desde las variables de entorno
    s3_bucket_endpoint = "tpe-cloud-grupi-website-557991544640.s3-website-us-east-1.amazonaws.com"
    
    # Parsear la request
    http_method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    query_params = event.get('queryStringParameters') or {}
    headers = event.get('headers', {})
    
    # Construir la URL del S3
    if path == '/':
        s3_path = '/index.html'
    else:
        s3_path = path
    
    s3_url = f"http://{s3_bucket_endpoint}{s3_path}"
    
    # Si hay query parameters, agregarlos
    if query_params:
        query_string = '&'.join([f"{k}={v}" for k, v in query_params.items()])
        s3_url += f"?{query_string}"
    
    try:
        # Hacer la request al S3
        http = urllib3.PoolManager()
        response = http.request('GET', s3_url)
        
        # Determinar el content type
        content_type = 'text/html'
        if s3_path.endswith('.js'):
            content_type = 'application/javascript'
        elif s3_path.endswith('.css'):
            content_type = 'text/css'
        elif s3_path.endswith('.png'):
            content_type = 'image/png'
        elif s3_path.endswith('.ico'):
            content_type = 'image/x-icon'
        elif s3_path.endswith('.json'):
            content_type = 'application/json'
        
        # Headers de respuesta
        response_headers = {
            'Content-Type': content_type,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Cache-Control': 'no-cache'
        }
        
        # Si es un archivo binario (imagen), devolver en base64
        if content_type.startswith('image/'):
            body = base64.b64encode(response.data).decode('utf-8')
            is_base64_encoded = True
        else:
            body = response.data.decode('utf-8')
            is_base64_encoded = False
        
        return {
            'statusCode': response.status,
            'headers': response_headers,
            'body': body,
            'isBase64Encoded': is_base64_encoded
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*'
            },
            'body': f'<html><body><h1>Error</h1><p>{str(e)}</p></body></html>'
        }
