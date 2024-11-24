from flask import Flask, request, jsonify
import mysql.connector

app = Flask(__name__)

def get_db_connection():
    return mysql.connector.connect(
        host="mysql-db",
        user="user",
        password="password",
        database="app_db"
    )

@app.route('/data', methods=['POST'])
def insert_data():
    data = request.json.get('data')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO records (data) VALUES (%s)", (data,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"status": "data inserted"}), 201

@app.route('/data', methods=['GET'])
def read_data():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM records")
    records = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(records), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)