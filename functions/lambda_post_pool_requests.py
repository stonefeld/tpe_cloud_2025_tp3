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
        with conn.cursor() as cur:
            conn = get_db_connection()
            pool_id = event['pathParameters']['pool_id']

            body = json.loads(event.get('body', '{}'))
            email = body.get('email')
            quantity = body.get('quantity', 1)

            if not email:
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'Missing required field: email'})
                }
            
            try:
                cur.execute(
                    "INSERT INTO pools_request (pool_id, email, quantity, created_at) VALUES (%s, %s, %s, NOW()) RETURNING id",
                    (pool_id, email, quantity)
                )
                request_id = cur.fetchone()[0]
                conn.commit()

                return {
                    'statusCode': 201,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'id': request_id})
                }
            except psycopg2.IntegrityError:
                conn.rollback()
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': 'This email has already joined this pool.'})
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