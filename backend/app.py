import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from models import db, User
from datetime import timedelta

# Carga variables de entorno (.env)
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permite peticiones desde otros orígenes (CORS) como desde Angular

# Configuración de claves, base de datos y expiración del token JWT
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)

db.init_app(app)
jwt = JWTManager(app)

# Registro de usuario: valida campos, verifica duplicados y guarda el usuario
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'msg': 'Todos los campos son obligatorios'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'msg': 'El nombre de usuario ya existe, por favor ingresa otro.'}), 409
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'msg': 'Este correo ya se encuentra registrado, por favor ingresa otro.'}), 409
    user = User(username=data['username'], email=data['email'])
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'Usuario creado'}), 201

# Login: verifica usuario y contraseña, retorna token JWT si es válido
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token), 200
    return jsonify({'msg': 'Credenciales inválidas, vuelve a intentarlo.'}), 401

# Ruta protegida: solo accesible con JWT válido
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200

# Ruta raíz: mensaje de estado de la API
@app.route('/')
def home():
    return jsonify({"msg": "API de Alivium funcionando"}), 200

# Inicializa la base de datos y ejecuta la app en modo debug
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)