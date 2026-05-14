from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from dependencias import obtener_db, obtener_usuario_actual
from modelos.usuario import Usuario
from esquemas.autenticacion import LoginEntrada, TokenSalida, UsuarioTokenSalida
from esquemas.usuario import UsuarioSalida
from seguridad import verificar_password, crear_token

router = APIRouter(prefix="/auth", tags=["autenticacion"])


@router.post("/login", response_model=TokenSalida)
def login(datos: LoginEntrada, db: Session = Depends(obtener_db)):
    usuario = db.query(Usuario).filter(Usuario.email == datos.email, Usuario.activo == True).first()
    if not usuario or not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
    token = crear_token({"sub": str(usuario.id), "rol": usuario.rol})
    return TokenSalida(token=token, usuario=UsuarioTokenSalida.model_validate(usuario))


@router.get("/yo", response_model=UsuarioSalida)
def obtener_yo(usuario: Usuario = Depends(obtener_usuario_actual)):
    return usuario
