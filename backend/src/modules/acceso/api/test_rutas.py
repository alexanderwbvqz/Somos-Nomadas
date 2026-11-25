from fastapi.testclient import TestClient

from modules.acceso.api.conftest import CLAVE, Entorno, Fabrica
from modules.acceso.application.registrar_cuenta import RegistrarCuenta
from modules.acceso.domain.cuenta import DatosRegistro
from modules.acceso.domain.intentos import REGISTRO_POR_ORIGEN, SESION_POR_CORREO
from modules.acceso.domain.sesion import TOLERANCIA_REUSO_SEGUNDOS


def registro(**cambios: object) -> dict[str, object]:
    base = {"correo": "ana@correo.com", "clave": CLAVE, "acepta_politica": True, "sitio_secundario": ""}
    return {**base, **cambios}


def entrar(cliente: TestClient, correo: str = "ana@correo.com", clave: str = CLAVE) -> dict[str, object]:
    respuesta = cliente.post("/acceso/sesion", json={"correo": correo, "clave": clave})
    assert respuesta.status_code == 200, respuesta.text
    return respuesta.json()  # type: ignore[no-any-return]


def con_token(token: object) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


# --- POST /acceso/registro ---


def test_registro_correcto_responde_202_sin_cuerpo_y_crea_la_cuenta(cliente: TestClient, entorno: Entorno) -> None:
    r = cliente.post("/acceso/registro", json=registro())

    assert r.status_code == 202
    assert r.content == b""
    assert entorno.cuentas.obtener_por_correo("ana@correo.com") is not None


def test_registro_con_un_correo_ya_registrado_responde_igual(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta("ana@correo.com")

    r = cliente.post("/acceso/registro", json=registro())

    assert r.status_code == 202
    assert r.content == b""
    assert entorno.cuentas.cantidad() == 1


def test_registro_con_el_campo_trampa_relleno_responde_202_sin_crear_nada(
    cliente: TestClient, entorno: Entorno
) -> None:
    r = cliente.post("/acceso/registro", json=registro(sitio_secundario="http://spam.com"))

    assert r.status_code == 202
    assert entorno.cuentas.cantidad() == 0


def test_el_campo_trampa_con_valores_raros_tambien_responde_202_sin_crear_nada(
    cliente: TestClient, entorno: Entorno
) -> None:
    # Un robot que manda un número, una lista o un texto enorme no debe recibir un 422 que le señale el campo
    for valor in (12345, ["spam"], {"a": 1}, True, "x" * 5000):
        r = cliente.post(
            "/acceso/registro", json=registro(correo=f"{type(valor).__name__}@correo.com", sitio_secundario=valor)
        )
        assert r.status_code == 202, valor
        assert r.content == b""

    assert entorno.cuentas.cantidad() == 0


def test_el_campo_trampa_nulo_o_vacio_no_es_un_robot(cliente: TestClient, entorno: Entorno) -> None:
    assert cliente.post("/acceso/registro", json=registro(sitio_secundario=None)).status_code == 202

    assert entorno.cuentas.cantidad() == 1


def test_registro_sin_el_campo_trampa_tambien_vale(cliente: TestClient) -> None:
    cuerpo = registro()
    del cuerpo["sitio_secundario"]

    assert cliente.post("/acceso/registro", json=cuerpo).status_code == 202


def test_registro_con_datos_invalidos_responde_422_con_los_campos(cliente: TestClient, entorno: Entorno) -> None:
    r = cliente.post("/acceso/registro", json=registro(correo="nada", clave="corta", acepta_politica=False))

    assert r.status_code == 422
    assert r.json() == {
        "codigo": "datos_invalidos",
        "campos": {"correo": "correo_invalido", "clave": "clave_corta", "acepta_politica": "politica_requerida"},
    }
    assert entorno.cuentas.cantidad() == 0


def test_registro_con_la_composicion_de_la_clave_incumplida(cliente: TestClient) -> None:
    r = cliente.post("/acceso/registro", json=registro(clave="todo-en-minusculas-1"))

    assert r.json()["campos"] == {"clave": "clave_sin_mayuscula"}


def test_registro_sin_un_campo_obligatorio_responde_422(cliente: TestClient) -> None:
    cuerpo = registro()
    del cuerpo["correo"]

    r = cliente.post("/acceso/registro", json=cuerpo)

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {"correo": "obligatorio"}}


def test_registro_con_tipos_equivocados_responde_422_y_no_repite_la_clave(cliente: TestClient) -> None:
    r = cliente.post("/acceso/registro", json=registro(acepta_politica="true", clave=12345678))

    assert r.status_code == 422
    assert r.json()["campos"] == {"acepta_politica": "invalido", "clave": "invalido"}
    assert "12345678" not in r.text


def test_registro_con_campos_enormes_se_rechaza_antes_de_llegar_al_dominio(cliente: TestClient) -> None:
    r = cliente.post("/acceso/registro", json=registro(clave="Aa1!" * 1000))

    assert r.status_code == 422
    assert r.json()["campos"] == {"clave": "invalido"}


def test_registro_ignora_campos_que_no_conoce(cliente: TestClient, entorno: Entorno) -> None:
    r = cliente.post("/acceso/registro", json=registro(correo_confirmado=True, id="1"))

    assert r.status_code == 202
    cuenta = entorno.cuentas.obtener_por_correo("ana@correo.com")
    assert cuenta is not None and not cuenta.correo_confirmado  # no se puede crear una cuenta ya confirmada


def test_registro_supera_los_intentos_y_responde_429_con_retry_after(cliente: TestClient) -> None:
    for i in range(REGISTRO_POR_ORIGEN.maximo):
        assert cliente.post("/acceso/registro", json=registro(correo=f"p{i}@correo.com")).status_code == 202

    r = cliente.post("/acceso/registro", json=registro(correo="otra@correo.com"))

    assert r.status_code == 429
    assert r.json() == {"codigo": "limite_excedido"}
    assert r.headers["retry-after"] == str(REGISTRO_POR_ORIGEN.ventana_segundos)


def test_el_limite_de_registro_es_por_origen_y_no_global(fabrica: Fabrica) -> None:
    uno, otro = fabrica(origen="203.0.113.7"), fabrica(origen="198.51.100.9")
    for i in range(REGISTRO_POR_ORIGEN.maximo):
        uno.post("/acceso/registro", json=registro(correo=f"p{i}@correo.com"))
    assert uno.post("/acceso/registro", json=registro(correo="x@correo.com")).status_code == 429

    assert otro.post("/acceso/registro", json=registro(correo="y@correo.com")).status_code == 202


# --- POST /acceso/sesion ---


def test_sesion_correcta_devuelve_los_tokens_y_el_correo(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()

    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert r.status_code == 200
    cuerpo = r.json()
    assert set(cuerpo) == {"token_acceso", "expira_en", "token_renovacion", "correo"}
    assert cuerpo["expira_en"] == 900
    assert cuerpo["correo"] == "ana@correo.com"


def test_clave_incorrecta_y_correo_inexistente_responden_exactamente_lo_mismo(
    cliente: TestClient, entorno: Entorno
) -> None:
    entorno.crear_cuenta()

    mala = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": "Otra-clave9"})
    sin_cuenta = cliente.post("/acceso/sesion", json={"correo": "nadie@correo.com", "clave": CLAVE})

    assert mala.status_code == sin_cuenta.status_code == 401
    assert mala.json() == sin_cuenta.json() == {"codigo": "credenciales_invalidas"}


def test_sesion_con_el_correo_sin_confirmar_responde_403(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta(confirmada=False)

    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert r.status_code == 403
    assert r.json() == {"codigo": "correo_sin_confirmar"}


def test_sesion_con_datos_invalidos_responde_422(cliente: TestClient) -> None:
    r = cliente.post("/acceso/sesion", json={"correo": "", "clave": ""})

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {"correo": "obligatorio", "clave": "obligatorio"}}


def test_sesion_supera_los_intentos_por_correo_y_responde_429(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()
    for _ in range(SESION_POR_CORREO.maximo):
        cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": "Mala-clave9"})

    r = cliente.post("/acceso/sesion", json={"correo": "ana@correo.com", "clave": CLAVE})

    assert r.status_code == 429
    assert r.headers["retry-after"] == str(SESION_POR_CORREO.ventana_segundos)


# --- GET /acceso/yo ---


def test_yo_devuelve_la_cuenta_del_token_y_nada_mas(cliente: TestClient, entorno: Entorno) -> None:
    cuenta = entorno.crear_cuenta()
    sesion = entrar(cliente)

    r = cliente.get("/acceso/yo", headers=con_token(sesion["token_acceso"]))

    assert r.status_code == 200
    # Nunca la clave ni su hash, ni la prueba del consentimiento
    assert r.json() == {"id": str(cuenta.id), "correo": "ana@correo.com", "correo_confirmado": True}


def test_yo_refleja_si_el_correo_esta_sin_confirmar(fabrica: Fabrica, entorno: Entorno) -> None:
    cliente = fabrica(iniciar_sesion=entorno.iniciar_sesion(exigir_correo_confirmado=False))
    entorno.crear_cuenta(confirmada=False)
    token = entrar(cliente)["token_acceso"]

    r = cliente.get("/acceso/yo", headers=con_token(token))

    assert r.json()["correo_confirmado"] is False


def test_yo_sin_token_responde_401_con_www_authenticate(cliente: TestClient) -> None:
    r = cliente.get("/acceso/yo")

    assert r.status_code == 401
    assert r.json() == {"codigo": "no_autenticado"}
    assert r.headers["www-authenticate"] == "Bearer"


def test_yo_con_una_cabecera_mal_formada_o_un_token_invalido_responde_401(cliente: TestClient) -> None:
    for cabecera in ["", "Bearer", "Bearer ", "Basic YW5hOmNsYXZl", "Token abc", "abc", "Bearer basura"]:
        r = cliente.get("/acceso/yo", headers={"Authorization": cabecera})
        assert r.status_code == 401, cabecera
        assert r.json() == {"codigo": "no_autenticado"}


def test_yo_acepta_bearer_en_cualquier_capitalizacion(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()
    token = entrar(cliente)["token_acceso"]

    assert cliente.get("/acceso/yo", headers={"Authorization": f"bearer {token}"}).status_code == 200


def test_yo_con_el_token_caducado_responde_401(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()
    token = entrar(cliente)["token_acceso"]

    entorno.reloj.avanzar(minutes=15)

    assert cliente.get("/acceso/yo", headers=con_token(token)).status_code == 401


# --- POST /acceso/renovar ---


def test_renovar_devuelve_tokens_nuevos_sin_el_correo(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()
    sesion = entrar(cliente)

    r = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})

    assert r.status_code == 200
    assert set(r.json()) == {"token_acceso", "expira_en", "token_renovacion"}
    assert r.json()["token_renovacion"] != sesion["token_renovacion"]
    assert cliente.get("/acceso/yo", headers=con_token(r.json()["token_acceso"])).status_code == 200


def test_renovar_dos_veces_el_mismo_token_responde_401_y_cierra_las_sesiones(
    cliente: TestClient, entorno: Entorno
) -> None:
    entorno.crear_cuenta()
    sesion = entrar(cliente)
    primera = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})
    entorno.reloj.avanzar(seconds=TOLERANCIA_REUSO_SEGUNDOS + 1)  # pasada la tolerancia, ya no es una carrera

    segunda = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})

    assert segunda.status_code == 401
    assert segunda.json() == {"codigo": "no_autenticado"}
    tercera = cliente.post("/acceso/renovar", json={"token_renovacion": primera.json()["token_renovacion"]})
    assert tercera.status_code == 401


def test_reusar_un_token_justo_despues_de_rotarlo_responde_401_pero_no_cierra_la_sesion(
    cliente: TestClient, entorno: Entorno
) -> None:
    # Dos peticiones casi a la vez con el mismo token: la perdedora recibe 401 y la ganadora conserva su sesión
    entorno.crear_cuenta()
    sesion = entrar(cliente)
    ganadora = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})

    perdedora = cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]})

    assert perdedora.status_code == 401
    seguimiento = cliente.post("/acceso/renovar", json={"token_renovacion": ganadora.json()["token_renovacion"]})
    assert seguimiento.status_code == 200


def test_renovar_con_un_token_desconocido_responde_401(cliente: TestClient) -> None:
    r = cliente.post("/acceso/renovar", json={"token_renovacion": "inventado"})

    assert r.status_code == 401
    assert r.json() == {"codigo": "no_autenticado"}


def test_renovar_sin_el_token_responde_422(cliente: TestClient) -> None:
    r = cliente.post("/acceso/renovar", json={})

    assert r.status_code == 422
    assert r.json() == {"codigo": "datos_invalidos", "campos": {"token_renovacion": "obligatorio"}}


# --- POST /acceso/cierre ---


def test_cierre_responde_204_y_el_token_ya_no_renueva(cliente: TestClient, entorno: Entorno) -> None:
    entorno.crear_cuenta()
    sesion = entrar(cliente)

    r = cliente.post("/acceso/cierre", json={"token_renovacion": sesion["token_renovacion"]})

    assert r.status_code == 204
    assert r.content == b""
    assert cliente.post("/acceso/renovar", json={"token_renovacion": sesion["token_renovacion"]}).status_code == 401


def test_cierre_con_un_token_desconocido_tambien_responde_204(cliente: TestClient) -> None:
    assert cliente.post("/acceso/cierre", json={"token_renovacion": "inventado"}).status_code == 204


# --- Errores inesperados ---


def test_un_fallo_inesperado_responde_500_sin_detalles(fabrica: Fabrica, entorno: Entorno) -> None:
    class Roto(RegistrarCuenta):
        def ejecutar(self, datos: DatosRegistro, origen: str) -> None:
            raise RuntimeError("la base dijo: ana@correo.com ya existe, clave-9")

    cliente = fabrica(
        registrar_cuenta=Roto(
            cuentas=entorno.cuentas,
            hasheador=entorno.hasheador,
            limitador=entorno.limitador,
            ahora=entorno.reloj,
            politica_version="x",
        )
    )

    r = cliente.post("/acceso/registro", json=registro())

    assert r.status_code == 500
    assert r.json() == {"codigo": "fallo"}
    assert "ana@correo.com" not in r.text


# --- OpenAPI ---


def test_las_rutas_estan_documentadas_en_openapi(cliente: TestClient) -> None:
    rutas = cliente.get("/openapi.json").json()["paths"]

    assert set(rutas) == {
        "/acceso/registro",
        "/acceso/sesion",
        "/acceso/renovar",
        "/acceso/cierre",
        "/acceso/yo",
    }
    # El código de éxito documentado es el real, no el 200 por defecto
    assert "202" in rutas["/acceso/registro"]["post"]["responses"]
    assert "200" not in rutas["/acceso/registro"]["post"]["responses"]
    assert "204" in rutas["/acceso/cierre"]["post"]["responses"]
    assert "200" not in rutas["/acceso/cierre"]["post"]["responses"]
