import json
import os
import psycopg2
from botocore.exceptions import ClientError
from datetime import date

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
    Handles GET and POST requests for /pools.
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
                cur.execute("SELECT id, product_id, start_at, end_at, min_quantity, created_at, updated_at FROM pools_pool")
                pools = cur.fetchall()
                pool_list = [
                    {
                        'id': row[0],
                        'product': row[1],
                        'start_at': row[2].isoformat(),
                        'end_at': row[3].isoformat(),
                        'min_quantity': row[4],
                        'created_at': row[5].isoformat(),
                        'updated_at': row[6].isoformat()
                    }
                    for row in pools
                ]
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(pool_list)
                }
            elif http_method == 'POST':
                body = json.loads(event.get('body', '{}'))
                product_id = body.get('product')
                start_at = body.get('start_at')
                end_at = body.get('end_at')
                min_quantity = body.get('min_quantity')

                if not all([product_id, start_at, end_at, min_quantity]):
                    return {
                        'statusCode': 400,
                        'body': json.dumps({'error': 'Missing required fields'})
                    }
                
                cur.execute(
                    "INSERT INTO pools_pool (product_id, start_at, end_at, min_quantity, created_at, updated_at) VALUES (%s, %s, %s, %s, NOW(), NOW()) RETURNING id",
                    (product_id, start_at, end_at, min_quantity)
                )
                pool_id = cur.fetchone()[0]
                conn.commit()

                return {
                    'statusCode': 201,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': pool_id})
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
