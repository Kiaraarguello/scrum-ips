from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from configuracion import JWT_SECRET, JWT_EXPIRA_MINUTOS

ALGORITMO = "HS256"
contexto_cripto = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hashear_password(password: str) -> str:
    return contexto_cripto.hash(password)


def verificar_password(password: str, hash_guardado: str) -> bool:
    return contexto_cripto.verify(password, hash_guardado)


def crear_token(datos: dict) -> str:
    payload = datos.copy()
    expira = datetime.utcnow() + timedelta(minutes=JWT_EXPIRA_MINUTOS)
    payload.update({"exp": expira})
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITMO)


def decodificar_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGORITMO])
    except JWTError:
        return {}
