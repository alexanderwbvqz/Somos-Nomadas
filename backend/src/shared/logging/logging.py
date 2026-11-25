import logging

FORMATO = "%(asctime)s %(levelname)s %(name)s %(message)s"


def configurar_logging(nivel: str = "INFO") -> None:
    """Un único manejador con un formato fijo. Es idempotente: llamarlo dos veces no duplica los mensajes.

    Qué se escribe es cosa de quien llama: nunca datos personales (correo, clave, tokens) ni cuerpos de peticiones.
    Por eso `httpx` y `httpcore` quedan en WARNING, sea cual sea el nivel de la raíz.
    Los errores inesperados ya se registran sin mensaje ni traceback (shared/http/manejadores.py).
    """
    numero = logging.getLevelName(nivel.upper())
    if not isinstance(numero, int):
        raise ValueError(f"Nivel de logging desconocido: {nivel}")

    raiz = logging.getLogger()
    raiz.setLevel(numero)
    # httpx escribe en INFO la URL completa de cada petición: con Supabase llevaría ids y hashes en la ruta
    for ruidosa in ("httpx", "httpcore"):
        logging.getLogger(ruidosa).setLevel(logging.WARNING)
    for manejador in raiz.handlers:
        if getattr(manejador, "_nomadas", False):
            return
    propio = logging.StreamHandler()
    propio.setFormatter(logging.Formatter(FORMATO))
    propio._nomadas = True  # type: ignore[attr-defined]
    raiz.addHandler(propio)
