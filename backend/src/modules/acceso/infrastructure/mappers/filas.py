from shared.supabase.errores import ErrorDeBaseDeDatos


def lista_de_filas(datos: object) -> list[object]:
    """Las filas de la respuesta de una consulta. Si no es una lista, es un error."""
    if not isinstance(datos, list):
        raise ErrorDeBaseDeDatos("respuesta_inesperada")
    return datos
