import json
import os
import psycopg2

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
    Handles GET requests for /pools/{id}.
    """
    pool_id = event['pathParameters']['id']
    conn = get_db_connection()
    if not conn:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection failed'})
        }

    try:
        with conn.cursor() as cur:
            cur.execute("SELECT id, product_id, start_at, end_at, min_quantity, created_at, updated_at FROM pools_pool WHERE id = %s", (pool_id,))
            pool = cur.fetchone()

            if pool:
                pool_details = {
                    'id': pool[0],
                    'product': pool[1],
                    'start_at': pool[2].isoformat(),
                    'end_at': pool[3].isoformat(),
                    'min_quantity': pool[4],
                    'created_at': pool[5].isoformat(),
                    'updated_at': pool[6].isoformat()
                }
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(pool_details)
                }
            else:
                return {
                    'statusCode': 404,
                    'body': json.dumps({'error': 'Pool not found'})
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
