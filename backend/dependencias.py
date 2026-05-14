from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from basedatos import SessionLocal
from seguridad import decodificar_token
from modelos.usuario import Usuario

esquema_bearer = HTTPBearer()


def obtener_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def obtener_usuario_actual(
    credenciales: HTTPAuthorizationCredentials = Depends(esquema_bearer),
    db: Session = Depends(obtener_db),
) -> Usuario:
    payload = decodificar_token(credenciales.credentials)
    usuario_id = payload.get("sub")
    if not usuario_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token invalido")
    usuario = db.query(Usuario).filter(Usuario.id == int(usuario_id), Usuario.activo == True).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no encontrado")
    return usuario


def requerir_admin(usuario: Usuario = Depends(obtener_usuario_actual)) -> Usuario:
    if usuario.rol != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere rol admin")
    return usuario
