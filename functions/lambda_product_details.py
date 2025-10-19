import json
import os
import psycopg2

# Database connection details from environment variables
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
    Handles GET requests for /products/{id}.
    """
    product_id = event['pathParameters']['id']
    conn = get_db_connection()
    if not conn:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection failed'})
        }

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, name, description, unit_price, created_at, updated_at FROM products_product WHERE id = %s", (product_id,))
            product = cur.fetchone()

            if product:
                product_details = {
                    'id': product[0],
                    'name': product[1],
                    'description': product[2],
                    'unit_price': str(product[3]),
                    'created_at': product[4].isoformat(),
                    'updated_at': product[5].isoformat()
                }
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(product_details)
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'Product not found'})
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
