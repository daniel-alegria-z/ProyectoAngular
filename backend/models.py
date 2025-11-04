from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

# Inicializa la extensión SQLAlchemy para manejar la base de datos
db = SQLAlchemy()

# Define el modelo de usuario para la base de datos
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    # Método para establecer la contraseña (la guarda como hash)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    # Método para verificar la contraseña (compara el hash)
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)