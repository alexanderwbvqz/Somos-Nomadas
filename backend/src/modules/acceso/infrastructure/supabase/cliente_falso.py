"""Doble de prueba del cliente de Supabase: anota qué se le pide y responde lo que se le programe.

Solo imita la parte de la API que usan los adaptadores. No prueba el SQL: eso se prueba contra una base real
(ver test_contrato_repositorios.py).
"""

from dataclasses import dataclass, field
from typing import Any


@dataclass
class Respuesta:
    data: Any


@dataclass
class Llamada:
    tipo: str  # "rpc", "select" o "insert"
    nombre: str  # función o tabla
    parametros: dict[str, Any] = field(default_factory=dict)  # argumentos de rpc o fila insertada
    columnas: tuple[str, ...] = ()
    filtros: list[tuple[str, Any]] = field(default_factory=list)
    limite: int | None = None


class _Consulta:
    def __init__(self, cliente: "ClienteFalso", llamada: Llamada) -> None:
        self._cliente = cliente
        self._llamada = llamada

    def select(self, *columnas: str) -> "_Consulta":
        self._llamada.tipo = "select"
        self._llamada.columnas = columnas
        return self

    def insert(self, fila: dict[str, Any]) -> "_Consulta":
        self._llamada.tipo = "insert"
        self._llamada.parametros = fila
        return self

    def eq(self, columna: str, valor: Any) -> "_Consulta":
        self._llamada.filtros.append((columna, valor))
        return self

    def limit(self, cantidad: int) -> "_Consulta":
        self._llamada.limite = cantidad
        return self

    def execute(self) -> Respuesta:
        return self._cliente.responder(self._llamada)


class ClienteFalso:
    def __init__(self, respuestas: dict[str, Any] | None = None, error: Exception | None = None) -> None:
        self.llamadas: list[Llamada] = []
        self._respuestas = respuestas or {}
        self._error = error

    def table(self, nombre: str) -> _Consulta:
        return _Consulta(self, Llamada(tipo="select", nombre=nombre))

    def rpc(self, nombre: str, parametros: dict[str, Any]) -> _Consulta:
        return _Consulta(self, Llamada(tipo="rpc", nombre=nombre, parametros=parametros))

    def responder(self, llamada: Llamada) -> Respuesta:
        self.llamadas.append(llamada)
        if self._error is not None:
            raise self._error
        return Respuesta(self._respuestas.get(llamada.nombre))
