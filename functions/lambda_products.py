import json
import os
import psycopg2
from botocore.exceptions import ClientError

# Database connection details
db_host = os.environ.get('DB_HOST')
db_port = os.environ.get('DB_PORT')
db_name = os.environ.get('DB_NAME')
db_user = os.environ.get('DB_USER')
db_password = os.environ.get('DB_PASSWORD')

def get_db_connection():
    """Establishes a connection to the PostgreSQL database."""
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
    """
    Handles GET and POST requests for /products.
    """
    http_method = event.get('httpMethod')
    conn = get_db_connection()
    if not conn:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection failed'})
        }

    try:
        with conn.cursor() as cur:
            if http_method == 'GET':
                cur.execute("SELECT id, name, description, unit_price, created_at, updated_at FROM products_product")
                products = cur.fetchall()
                product_list = [
                    {
                        'id': row[0],
                        'name': row[1],
                        'description': row[2],
                        'unit_price': str(row[3]),
                        'created_at': row[4].isoformat(),
                        'updated_at': row[5].isoformat()
                    }
                    for row in products
                ]
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(product_list)
                }
            elif http_method == 'POST':
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
            else:
                return {
                    'statusCode': 405,
                    'body': json.dumps({'error': 'Method Not Allowed'})
                }
    except (Exception, psycopg2.Error) as e:
        print(f"Error executing query: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'An error occurred'})
        }
    finally:
        if conn:
            conn.close()
