import os
from dotenv import load_dotenv
import psycopg2
from psycopg2 import OperationalError

def test_connection():
    load_dotenv('.env.local')
    
    try:
        # Get the connection string from environment variable
        database_url = os.getenv('DATABASE_URL')
        
        # Connect to the database
        conn = psycopg2.connect(database_url)
        
        # Create a cursor
        cur = conn.cursor()
        
        # Execute a simple query
        cur.execute('SELECT version();')
        
        # Fetch the result
        version = cur.fetchone()
        print("Successfully connected to the database!")
        print(f"PostgreSQL version: {version[0]}")
        
        # Close cursor and connection
        cur.close()
        conn.close()
        
    except OperationalError as e:
        print(f"Error connecting to the database: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    test_connection()
