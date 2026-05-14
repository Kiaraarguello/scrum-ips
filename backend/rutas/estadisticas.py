from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from dependencias import obtener_db, obtener_usuario_actual, requerir_admin
from modelos.tarea import Tarea
from modelos.usuario import Usuario
from esquemas.estadistica import RankingUsuariosSalida, ItemRankingUsuario, ResumenPropio, KpisUsuario, KpisUsuariosSalida

router = APIRouter(prefix="/estadisticas", tags=["estadisticas"])

PESO = {"alta": 3, "media": 2, "baja": 1}


@router.get("/ranking-usuarios", response_model=RankingUsuariosSalida)
def ranking_usuarios(db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    tareas = (
        db.query(Tarea)
        .filter(Tarea.estado == "finalizada", Tarea.asignado_a.isnot(None))
        .all()
    )
    acumulado: dict[int, dict] = {}
    for t in tareas:
        uid = t.asignado_a
        if uid not in acumulado:
            u = db.query(Usuario).filter(Usuario.id == uid).first()
            acumulado[uid] = {"nombre": u.nombre if u else "", "apellido": u.apellido if u else "", "puntos": 0, "tareas_finalizadas": 0}
        acumulado[uid]["puntos"] += PESO.get(t.criticidad, 1)
        acumulado[uid]["tareas_finalizadas"] += 1

    ranking = [
        ItemRankingUsuario(usuario_id=uid, **datos)
        for uid, datos in sorted(acumulado.items(), key=lambda x: x[1]["puntos"], reverse=True)
    ]
    return RankingUsuariosSalida(ranking=ranking)


@router.get("/mi-resumen", response_model=ResumenPropio)
def mi_resumen(db: Session = Depends(obtener_db), usuario: Usuario = Depends(obtener_usuario_actual)):
    corte_7 = datetime.utcnow() - timedelta(days=7)

    en_proceso = db.query(func.count(Tarea.id)).filter(
        Tarea.estado == "en_proceso", Tarea.asignado_a == usuario.id
    ).scalar() or 0

    finalizadas_7 = db.query(func.count(Tarea.id)).filter(
        Tarea.estado == "finalizada",
        Tarea.asignado_a == usuario.id,
        Tarea.fecha_finalizacion >= corte_7,
    ).scalar() or 0

    finalizadas_total = db.query(func.count(Tarea.id)).filter(
        Tarea.estado == "finalizada", Tarea.asignado_a == usuario.id
    ).scalar() or 0

    ultimas = (
        db.query(Tarea)
        .filter(Tarea.estado == "finalizada", Tarea.asignado_a == usuario.id)
        .order_by(Tarea.fecha_finalizacion.desc())
        .limit(5)
        .all()
    )

    return ResumenPropio(
        en_proceso=en_proceso,
        finalizadas_7_dias=finalizadas_7,
        finalizadas_total=finalizadas_total,
        ultimas_finalizadas=[{"id": t.id, "titulo": t.titulo, "fecha": str(t.fecha_finalizacion)} for t in ultimas],
    )


@router.get("/kpis-usuarios", response_model=KpisUsuariosSalida)
def kpis_usuarios(db: Session = Depends(obtener_db), _: Usuario = Depends(requerir_admin)):
    usuarios = db.query(Usuario).filter(Usuario.activo == True).all()
    resultado: list[KpisUsuario] = []

    for u in usuarios:
        tareas = db.query(Tarea).filter(Tarea.asignado_a == u.id).all()
        if not tareas:
            continue

        finalizadas = [t for t in tareas if t.estado == "finalizada"]
        en_proceso = [t for t in tareas if t.estado == "en_proceso"]
        por_hacer = [t for t in tareas if t.estado == "por_hacer"]

        # Puntos
        puntos = sum(PESO.get(t.criticidad, 1) for t in finalizadas)

        # Distribución criticidad (todas las tareas asignadas)
        alta = sum(1 for t in tareas if t.criticidad == "alta")
        media = sum(1 for t in tareas if t.criticidad == "media")
        baja = sum(1 for t in tareas if t.criticidad == "baja")
        total = len(tareas)
        pct_alta = round((alta / total) * 100, 1) if total else 0.0

        # Promedio respuesta: creacion → inicio (tareas que tienen fecha_inicio)
        tiempos_respuesta = [
            (t.fecha_inicio - t.fecha_creacion).total_seconds() / 3600
            for t in tareas
            if t.fecha_inicio and t.fecha_creacion and t.fecha_inicio >= t.fecha_creacion
        ]
        prom_respuesta = round(sum(tiempos_respuesta) / len(tiempos_respuesta), 1) if tiempos_respuesta else None

        # Promedio resolución: inicio → finalización (tareas finalizadas con ambas fechas)
        tiempos_resolucion = [
            (t.fecha_finalizacion - t.fecha_inicio).total_seconds() / 3600
            for t in finalizadas
            if t.fecha_inicio and t.fecha_finalizacion and t.fecha_finalizacion >= t.fecha_inicio
        ]
        prom_resolucion = round(sum(tiempos_resolucion) / len(tiempos_resolucion), 1) if tiempos_resolucion else None

        resultado.append(KpisUsuario(
            usuario_id=u.id,
            nombre=u.nombre,
            apellido=u.apellido,
            puntos=puntos,
            tareas_finalizadas=len(finalizadas),
            tareas_en_proceso=len(en_proceso),
            tareas_por_hacer=len(por_hacer),
            promedio_respuesta_horas=prom_respuesta,
            promedio_resolucion_horas=prom_resolucion,
            tareas_alta=alta,
            tareas_media=media,
            tareas_baja=baja,
            pct_alta=pct_alta,
        ))

    resultado.sort(key=lambda x: x.puntos, reverse=True)
    return KpisUsuariosSalida(usuarios=resultado)
