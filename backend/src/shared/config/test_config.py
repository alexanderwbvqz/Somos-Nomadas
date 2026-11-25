from typing import Any

import pytest

from shared.config.config import Configuracion

JWT = "jwt-secreto-" + "j" * 30
HUELLAS = "huellas-secreto-" + "h" * 30
INTERNO = "interno-secreto-" + "n" * 30
LLAVE = "llave-de-servidor-" + "k" * 30
RESEND = "re_clave_de_resend_0123456789"
REMITENTE = "Somos Nómadas <hola@somosnomadas.app>"
VARIABLES = [
    "ENTORNO",
    "ALMACEN_DE_DATOS",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "JWT_SECRETO",
    "HUELLAS_SECRETO",
    "SECRETO_INTERNO",
    "ORIGENES_PERMITIDOS",
    "EXIGIR_CORREO_CONFIRMADO",
    "POLITICA_VERSION",
    "ENVIADOR_DE_CORREOS",
    "RESEND_CLAVE",
    "CORREO_REMITENTE",
    "URL_WEB",
    "CARPETA_DE_CORREOS",
]


@pytest.fixture(autouse=True)
def entorno_limpio(monkeypatch: pytest.MonkeyPatch) -> None:
    """Que las variables de entorno del equipo no cambien el resultado de las pruebas."""
    for nombre in VARIABLES:
        monkeypatch.delenv(nombre, raising=False)


def configurar(**cambios: Any) -> Configuracion:
    # _env_file=None: las pruebas nunca leen un .env real
    base: dict[str, Any] = {"entorno": "desarrollo", "almacen_de_datos": "memoria", "jwt_secreto": JWT}
    return Configuracion(_env_file=None, **{**base, **cambios})  # type: ignore[call-arg]


def produccion(**cambios: Any) -> Configuracion:
    base: dict[str, Any] = {
        "entorno": "produccion",
        "almacen_de_datos": "supabase",
        "supabase_url": "https://abcdefgh.supabase.co",
        "supabase_service_role_key": LLAVE,
        "huellas_secreto": HUELLAS,
        "secreto_interno": INTERNO,
        "origenes_permitidos": "https://nomadas.example",
        "resend_clave": RESEND,
        "correo_remitente": REMITENTE,
        "url_web": "https://somosnomadas.app",
    }
    return configurar(**{**base, **cambios})


# --- Valores por defecto: los seguros ---


def test_los_valores_por_defecto_son_los_seguros() -> None:
    c = configurar()

    assert c.exigir_correo_confirmado is True
    assert c.origenes_permitidos == "http://localhost:3000"


def test_sin_indicar_nada_el_almacen_es_supabase_y_exige_sus_credenciales() -> None:
    with pytest.raises(ValueError):
        Configuracion(_env_file=None, jwt_secreto=JWT)  # type: ignore[call-arg, arg-type]


def test_si_se_olvida_el_entorno_se_aplican_las_reglas_de_produccion() -> None:
    # Fallar cerrado: un despliegue sin la variable ENTORNO no puede quedar con la documentación pública ni con http
    sin_entorno: dict[str, Any] = {
        "jwt_secreto": JWT,
        "almacen_de_datos": "supabase",
        "supabase_url": "https://a.supabase.co",
        "supabase_service_role_key": LLAVE,
        "huellas_secreto": HUELLAS,
        "secreto_interno": INTERNO,
        "resend_clave": RESEND,
        "correo_remitente": REMITENTE,
        "url_web": "https://somosnomadas.app",
    }

    c = Configuracion(_env_file=None, origenes_permitidos="https://nomadas.example", **sin_entorno)  # type: ignore[call-arg]
    assert c.entorno == "produccion"
    with pytest.raises(ValueError, match="ORIGENES_PERMITIDOS"):
        Configuracion(_env_file=None, **sin_entorno)  # type: ignore[call-arg]
    with pytest.raises(ValueError, match="memoria"):
        Configuracion(_env_file=None, jwt_secreto=JWT, almacen_de_datos="memoria")  # type: ignore[call-arg, arg-type]


# --- Lectura de variables de entorno ---


def test_lee_las_variables_de_entorno_con_los_nombres_del_env_example(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ENTORNO", "produccion")
    monkeypatch.setenv("ALMACEN_DE_DATOS", "supabase")
    monkeypatch.setenv("SUPABASE_URL", "https://abcdefgh.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", LLAVE)
    monkeypatch.setenv("JWT_SECRETO", JWT)
    monkeypatch.setenv("HUELLAS_SECRETO", HUELLAS)
    monkeypatch.setenv("SECRETO_INTERNO", INTERNO)
    monkeypatch.setenv("ORIGENES_PERMITIDOS", "https://nomadas.example, https://www.nomadas.example")
    monkeypatch.setenv("EXIGIR_CORREO_CONFIRMADO", "true")
    monkeypatch.setenv("POLITICA_VERSION", "2027-01")
    monkeypatch.setenv("ENVIADOR_DE_CORREOS", "resend")
    monkeypatch.setenv("RESEND_CLAVE", RESEND)
    monkeypatch.setenv("CORREO_REMITENTE", REMITENTE)
    monkeypatch.setenv("URL_WEB", "https://somosnomadas.app")
    monkeypatch.setenv("CARPETA_DE_CORREOS", "otra-carpeta")

    c = Configuracion(_env_file=None)  # type: ignore[call-arg]

    assert c.entorno == "produccion"
    assert c.supabase_url == "https://abcdefgh.supabase.co"
    assert c.supabase_service_role_key.get_secret_value() == LLAVE
    assert c.jwt_secreto.get_secret_value() == JWT
    assert c.huellas_secreto.get_secret_value() == HUELLAS
    assert c.secreto_interno.get_secret_value() == INTERNO
    assert c.lista_de_origenes == ["https://nomadas.example", "https://www.nomadas.example"]
    assert c.politica_version == "2027-01"
    assert c.enviador == "resend"
    assert c.resend_clave.get_secret_value() == RESEND
    assert c.correo_remitente == REMITENTE
    assert c.url_web == "https://somosnomadas.app"
    assert c.carpeta_de_correos == "otra-carpeta"


def test_las_variables_de_entorno_pueden_ir_en_minusculas_o_mayusculas(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("EXIGIR_CORREO_CONFIRMADO", "false")

    assert configurar(exigir_correo_confirmado=False).exigir_correo_confirmado is False


# --- Orígenes ---


def test_la_lista_de_origenes_recorta_y_descarta_los_vacios() -> None:
    c = configurar(origenes_permitidos=" http://localhost:3000 ,, http://127.0.0.1:3000 ,")

    assert c.lista_de_origenes == ["http://localhost:3000", "http://127.0.0.1:3000"]


@pytest.mark.parametrize("origenes", ["*", "http://localhost:3000,*", " * "])
def test_nunca_se_acepta_el_comodin_de_origenes(origenes: str) -> None:
    with pytest.raises(ValueError, match="comodín"):
        configurar(origenes_permitidos=origenes)


# --- Secretos ---


@pytest.mark.parametrize("secreto", ["", "corto", "x" * 31])
def test_el_secreto_del_jwt_exige_32_caracteres_o_mas(secreto: str) -> None:
    with pytest.raises(ValueError, match="JWT_SECRETO"):
        configurar(jwt_secreto=secreto)


def test_con_supabase_se_exigen_la_url_la_llave_y_el_secreto_de_huellas() -> None:
    base: dict[str, Any] = {
        "almacen_de_datos": "supabase",
        "supabase_url": "https://abcdefgh.supabase.co",
        "supabase_service_role_key": LLAVE,
        "huellas_secreto": HUELLAS,
    }
    assert configurar(**base).almacen_de_datos == "supabase"

    for faltante, mensaje in [
        ("supabase_url", "SUPABASE_URL"),
        ("supabase_service_role_key", "SUPABASE_SERVICE_ROLE_KEY"),
        ("huellas_secreto", "HUELLAS_SECRETO"),
    ]:
        with pytest.raises(ValueError, match=mensaje):
            configurar(**{**base, faltante: ""})


def test_el_secreto_de_huellas_y_el_del_jwt_no_pueden_ser_el_mismo() -> None:
    with pytest.raises(ValueError, match="distintos"):
        configurar(
            almacen_de_datos="supabase",
            supabase_url="https://abcdefgh.supabase.co",
            supabase_service_role_key=LLAVE,
            huellas_secreto=JWT,
        )


def test_el_secreto_de_huellas_exige_32_caracteres_o_mas() -> None:
    with pytest.raises(ValueError, match="HUELLAS_SECRETO"):
        configurar(
            almacen_de_datos="supabase",
            supabase_url="https://abcdefgh.supabase.co",
            supabase_service_role_key=LLAVE,
            huellas_secreto="corto",
        )


def test_con_almacen_en_memoria_no_hacen_falta_las_credenciales_de_supabase() -> None:
    assert configurar().supabase_url == ""


def test_los_secretos_no_aparecen_en_el_repr_ni_en_el_texto_de_la_configuracion() -> None:
    c = produccion()

    for texto in (repr(c), str(c), c.model_dump_json()):
        assert JWT not in texto and HUELLAS not in texto and LLAVE not in texto


def test_un_error_de_configuracion_no_repite_los_secretos() -> None:
    with pytest.raises(ValueError) as error:
        produccion(almacen_de_datos="memoria")

    texto = str(error.value) + repr(error.value)
    assert JWT not in texto and HUELLAS not in texto and LLAVE not in texto


def test_un_valor_invalido_que_lleva_un_secreto_dentro_no_se_repite_en_el_error() -> None:
    # Sin hide_input_in_errors, pydantic copiaría el valor recibido en el mensaje: un secreto acabaría en los logs
    with pytest.raises(ValueError) as error:
        configurar(entorno="otro-" + JWT)

    assert JWT not in str(error.value) + repr(error.value)


# --- Secreto interno (Next ↔ API) ---


def test_el_secreto_interno_es_opcional_en_desarrollo() -> None:
    assert configurar().secreto_interno.get_secret_value() == ""


def test_el_secreto_interno_se_lee_de_su_variable_de_entorno(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("SECRETO_INTERNO", INTERNO)

    assert configurar().secreto_interno.get_secret_value() == INTERNO


@pytest.mark.parametrize("secreto", ["corto", "x" * 31])
def test_si_hay_secreto_interno_exige_32_caracteres_o_mas_aunque_sea_desarrollo(secreto: str) -> None:
    with pytest.raises(ValueError, match="SECRETO_INTERNO"):
        configurar(secreto_interno=secreto)


def test_produccion_exige_el_secreto_interno() -> None:
    with pytest.raises(ValueError, match="SECRETO_INTERNO"):
        produccion(secreto_interno="")


@pytest.mark.parametrize("repetido", [JWT, HUELLAS])
def test_el_secreto_interno_debe_ser_distinto_de_los_otros_secretos(repetido: str) -> None:
    with pytest.raises(ValueError, match="distintos"):
        produccion(secreto_interno=repetido)


def test_el_secreto_interno_no_aparece_en_el_texto_de_la_configuracion() -> None:
    c = produccion()

    for texto in (repr(c), str(c), c.model_dump_json()):
        assert INTERNO not in texto


# --- Producción ---


def test_una_configuracion_de_produccion_correcta_arranca() -> None:
    c = produccion()

    assert c.entorno == "produccion"
    assert c.lista_de_origenes == ["https://nomadas.example"]


def test_produccion_no_acepta_el_almacen_en_memoria() -> None:
    with pytest.raises(ValueError, match="memoria"):
        produccion(almacen_de_datos="memoria")


def test_produccion_no_acepta_desactivar_la_confirmacion_del_correo() -> None:
    with pytest.raises(ValueError, match="EXIGIR_CORREO_CONFIRMADO"):
        produccion(exigir_correo_confirmado=False)


@pytest.mark.parametrize("origenes", ["http://nomadas.example", "https://a.example,http://b.example", ""])
def test_produccion_exige_origenes_https(origenes: str) -> None:
    with pytest.raises(ValueError, match="ORIGENES_PERMITIDOS"):
        produccion(origenes_permitidos=origenes)


def test_en_desarrollo_si_se_puede_desactivar_la_confirmacion_y_usar_http() -> None:
    c = configurar(exigir_correo_confirmado=False, origenes_permitidos="http://localhost:3000")

    assert c.exigir_correo_confirmado is False


# --- Envío de correos ---


def test_en_desarrollo_los_correos_van_a_la_carpeta_si_no_se_dice_otra_cosa() -> None:
    c = configurar()

    assert c.enviador == "carpeta"
    assert c.carpeta_de_correos == "correos-de-prueba"
    assert c.url_web == "http://localhost:3000"


def test_en_produccion_los_correos_van_por_resend_si_no_se_dice_otra_cosa() -> None:
    assert produccion().enviador == "resend"


def test_en_produccion_no_se_acepta_la_carpeta() -> None:
    with pytest.raises(ValueError, match="ENVIADOR_DE_CORREOS"):
        produccion(enviador_de_correos="carpeta")


@pytest.mark.parametrize("falta", ["resend_clave", "correo_remitente"])
def test_con_resend_hacen_falta_la_clave_y_el_remitente(falta: str) -> None:
    with pytest.raises(ValueError, match=falta.upper()):
        produccion(**{falta: ""})
    con_resend: dict[str, Any] = {
        "enviador_de_correos": "resend",
        "resend_clave": RESEND,
        "correo_remitente": REMITENTE,
    }
    with pytest.raises(ValueError, match=falta.upper()):
        configurar(**{**con_resend, falta: ""})


def test_el_remitente_tiene_que_ser_un_correo() -> None:
    with pytest.raises(ValueError, match="CORREO_REMITENTE"):
        produccion(correo_remitente="Somos Nómadas")


def test_en_desarrollo_se_puede_probar_resend_de_verdad() -> None:
    c = configurar(enviador_de_correos="resend", resend_clave=RESEND, correo_remitente=REMITENTE)

    assert c.enviador == "resend"


def test_en_produccion_la_web_tiene_que_ser_https() -> None:
    with pytest.raises(ValueError, match="URL_WEB"):
        produccion(url_web="http://somosnomadas.app")


@pytest.mark.parametrize(
    "url", ["", "somosnomadas.app", "ftp://somosnomadas.app", "https://somosnomadas.app/#x", "https://a.app/?b=1", " "]
)
def test_url_web_tiene_que_ser_una_direccion_http_sin_fragmento_ni_consulta(url: str) -> None:
    with pytest.raises(ValueError, match="URL_WEB"):
        configurar(url_web=url)


def test_la_clave_de_resend_no_sale_al_imprimir_la_configuracion() -> None:
    c = produccion()

    assert RESEND not in repr(c) + str(c)
    assert c.resend_clave.get_secret_value() == RESEND
