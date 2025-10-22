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
        pool_id = event["pathParameters"]["id"]
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    p.id,
                    p.product_id,
                    p.start_at,
                    p.end_at,
                    p.min_quantity,
                    p.created_at,
                    p.updated_at,
                    COALESCE(SUM(r.quantity), 0) as joined
                FROM pool p
                LEFT JOIN request r ON p.id = r.pool_id
                WHERE p.id = %s
                GROUP BY p.id, p.product_id, p.start_at, p.end_at, p.min_quantity, p.created_at, p.updated_at
            """,
                (pool_id,),
            )
            pool = cur.fetchone()

            if pool:
                pool_details = {
                    "id": pool[0],
                    "product_id": pool[1],
                    "start_at": pool[2].isoformat(),
                    "end_at": pool[3].isoformat(),
                    "min_quantity": pool[4],
                    "created_at": pool[5].isoformat(),
                    "updated_at": pool[6].isoformat(),
                    "joined": int(pool[7]),
                }

                return {
                    "statusCode": 200,
                    "headers": {"Access-Control-Allow-Origin": "*"},
                    "body": json.dumps(pool_details),
                }

            else:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"error": "Pool not found"}),
                }

    except (Exception, psycopg2.Error) as e:
        print(f"Error executing query: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": "An error occurred",
                    "details": str(e),
                }
            ),
        }

    finally:
        if conn:
            conn.close()
