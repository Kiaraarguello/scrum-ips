from pydantic import BaseModel, EmailStr


class LoginEntrada(BaseModel):
    email: EmailStr
    password: str


class TokenSalida(BaseModel):
    token: str
    usuario: "UsuarioTokenSalida"


class UsuarioTokenSalida(BaseModel):
    id: int
    nombre: str
    apellido: str
    email: str
    rol: str
    sector_id: int | None
    ver_todos: bool = False
    seleccion_completada: bool = False
    sectores: list[dict] = []

    class Config:
        from_attributes = True


TokenSalida.model_rebuild()
