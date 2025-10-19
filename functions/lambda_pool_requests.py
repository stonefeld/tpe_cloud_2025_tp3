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
    Handles GET and POST requests for /pools/{pool_id}/requests.
    """
    http_method = event.get('httpMethod')
    pool_id = event['pathParameters']['pool_id']
    
    conn = get_db_connection()
    if not conn:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Database connection failed'})
        }

    try:
        with conn.cursor() as cur:
            if http_method == 'GET':
                cur.execute("SELECT id, pool_id, email, quantity, created_at FROM pools_request WHERE pool_id = %s", (pool_id,))
                requests = cur.fetchall()
                request_list = [
                    {
                        'id': row[0],
                        'pool': row[1],
                        'email': row[2],
                        'quantity': row[3],
                        'created_at': row[4].isoformat()
                    }
                    for row in requests
                ]
                return {
                    'statusCode': 200,
                    'headers': {
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps(request_list)
                }
            elif http_method == 'POST':
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
