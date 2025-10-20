import json
import os

import psycopg2

db_host = os.environ.get("DB_HOST")
db_port = os.environ.get("DB_PORT")
db_name = os.environ.get("DB_NAME")
db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")


def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=db_host,
            port=db_port,
            dbname=db_name,
            user=db_user,
            password=db_password,
        )
        return conn

    except psycopg2.Error as e:
        print(f"Error connecting to PostgreSQL: {e}")
        return None


def handler(event, context):
    conn = get_db_connection()
    if conn is None:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Could not connect to the database"}),
        }

    try:
        pool_id = event["pathParameters"]["pool_id"]
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, pool_id, email, quantity, created_at FROM pools_request WHERE pool_id = %s",
                (pool_id,),
            )
            requests = cur.fetchall()
            request_list = [
                {
                    "id": row[0],
                    "pool": row[1],
                    "email": row[2],
                    "quantity": row[3],
                    "created_at": row[4].isoformat(),
                }
                for row in requests
            ]

            return {
                "statusCode": 200,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps(request_list),
            }

    except (Exception, psycopg2.Error) as e:
        print(f"Error executing query: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": "An error occurred",
                    "defaills": str(e),
                }
            ),
        }

    finally:
        if conn:
            conn.close()

