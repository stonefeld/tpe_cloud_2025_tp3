import json
import os
import psycopg2

db_host = os.environ.get('DB_HOST')
db_port = os.environ.get('DB_PORT')
db_name = os.environ.get('DB_NAME')
db_user = os.environ.get('DB_USER')
db_password = os.environ.get('DB_PASSWORD')

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None

def lambda_handler(event, context):
    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            body = json.loads(event.get('body', '{}'))
            name = body.get('name')
            description = body.get('description')
            unit_price = body.get('unit_price')
            if not all([name, unit_price]):
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Missing required fields: name, unit_price'})
                }
            cur.execute(
                "INSERT INTO products_product (name, description, unit_price, created_at, updated_at) VALUES (%s, %s, %s, NOW(), NOW()) RETURNING id",
                (name, description, unit_price)
            )
            product_id = cur.fetchone()[0]
            conn.commit()
            return {
                'statusCode': 201,
                'headers': {
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'id': product_id})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An error occurred', 'details': str(e)})
        }
    finally:
        if conn:
            conn.close()
