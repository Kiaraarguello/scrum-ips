from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configuracion import CORS_ORIGENES
from modelos import sector, sede, usuario, tarea, historial, pc, alerta, proyecto
from rutas import autenticacion, usuarios, sectores, sedes, tareas, historial as ruta_historial, pcs, alertas, estadisticas, proyectos, publico
from basedatos import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Scrum IPS Misiones", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGENES,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(autenticacion.router, prefix="/api")
app.include_router(usuarios.router, prefix="/api")
app.include_router(sectores.router, prefix="/api")
app.include_router(sedes.router, prefix="/api")
app.include_router(tareas.router, prefix="/api")
app.include_router(ruta_historial.router, prefix="/api")
app.include_router(pcs.router, prefix="/api")
app.include_router(alertas.router, prefix="/api")
app.include_router(estadisticas.router, prefix="/api")
app.include_router(proyectos.router, prefix="/api")
app.include_router(publico.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
