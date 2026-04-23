import pymysql

try:
    print("Attempting to connect to MySQL...")
    conn = pymysql.connect(
        host='localhost',
        user='root',
        password='Namaste$QL' # The password with $ is safely inside Python string
    )
    cursor = conn.cursor()
    cursor.execute('CREATE DATABASE IF NOT EXISTS ticketbook')
    conn.commit()
    conn.close()
    print("Database 'ticketbook' created successfully or already exists.")
except Exception as e:
    print(f"Error connecting to MySQL: {e}")
