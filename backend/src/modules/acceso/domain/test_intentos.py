from modules.acceso.domain.intentos import (
    REGISTRO_POR_ORIGEN,
    SESION_POR_CORREO_TOTAL,
    SESION_POR_CORREO_Y_ORIGEN,
    SESION_POR_ORIGEN,
)


def test_el_bloqueo_rapido_es_por_pareja_de_correo_y_origen_y_el_techo_por_correo_es_mucho_mas_holgado() -> None:
    # Lo que bloquea rápido no puede depender solo del correo: otra persona podría usarlo contra la titular
    assert SESION_POR_CORREO_Y_ORIGEN.maximo == 5 and SESION_POR_CORREO_Y_ORIGEN.ventana_segundos == 15 * 60
    assert SESION_POR_CORREO_TOTAL.maximo == 100 and SESION_POR_CORREO_TOTAL.ventana_segundos == 60 * 60
    assert SESION_POR_CORREO_TOTAL.maximo >= 10 * SESION_POR_CORREO_Y_ORIGEN.maximo


def test_los_demas_limites_no_cambian() -> None:
    assert SESION_POR_ORIGEN.maximo == 20 and SESION_POR_ORIGEN.ventana_segundos == 15 * 60
    assert REGISTRO_POR_ORIGEN.maximo == 5 and REGISTRO_POR_ORIGEN.ventana_segundos == 60 * 60
