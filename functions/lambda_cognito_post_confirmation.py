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
    user_attributes = event["request"]["userAttributes"]
    cognito_sub = event["userName"]

    email = user_attributes.get("email")
    nombre = user_attributes.get("given_name")
    apellido = user_attributes.get("family_name")
    telefono = user_attributes.get("phone_number")
    direccion = user_attributes.get("address", "")

    if not all([email, nombre, apellido, telefono]):
        print(
            """Error: Missing one or more attributes.
            Required: email, given_name, family_name, phone_number."""
        )
        return event

    conn = None
    cur = None
    try:
        conn = get_db_connection()
        if conn is None:
            print("Failed to connect to the database.")
            return event

        cur = conn.cursor()
        cur.execute(
            "SELECT id FROM persona WHERE mail = %s OR cognito_sub = %s",
            (email, cognito_sub),
        )
        if cur.fetchone():
            print(f"User with email {email} or cognito_sub {cognito_sub} already exists in persona table.")
            return event

        sql = """
        INSERT INTO persona (nombre, apellido, telefono, direccion, mail, cognito_sub)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id;
        """

        cur.execute(sql, (nombre, apellido, telefono, direccion, email, cognito_sub))
        persona_id = cur.fetchone()[0]
        conn.commit()
        print(f"Successfully inserted user {email} with cognito_sub {cognito_sub} into persona table with ID {persona_id}.")

    except psycopg2.Error as db_error:
        print(f"Database error for email {email}: {str(db_error)}")
        if conn:
            conn.rollback()

    except Exception as e:
        print(f"An unexpected error occurred for email {email}: {str(e)}")
        if conn:
            conn.rollback()

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

    return event
