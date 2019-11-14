# Practica D3 BootCamp Big Data & Machine Learning KeepCoding
Este repositorio contiene la practica del modulo Visualizacion D3 de Daniel Alvaro 


## Contexto 🌐

Para la realizacion de la practica se ha usado un json a medida (maquetado por el profesor del modulo) basado en los datos de pisos de Airbnb en Madrid
[JSON](https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/d9f3a11cfa08154c36623c1bf01537bb7b022491/practica.json)

## Objetivo de nuestra practica 🎯
Los objetivos de la practica vienen recogidos en el pdf entregado por el profesor:

1. Crear un mapa con los barrios de la ciudad de Madrid y pintarlos por colores según el precio medio del alquiler en el barrio.
2. Crear una gráfica que en el eje Y tenga el número de propiedades y en el eje X el número de habitaciones de un barrio.
3. Crear una gráfica que dibuje una regresión lineal de alguna de las características con respecto al precio en un barrio.
4. Hacer que el valor de las gráficas cambien con los datos del barrio al que hago click en el mapa.

Respecto al punto 3 de la regresion lineal, para que esta tenga sentido, se han relacionado el numero de propiedades de cada barrio con sus respectivos precios medios.
Esto lleva a que en el punto 4 la grafica de la regresion lineal sea unica (se construye con medidas de todos los barrios), por lo que solo la grafica del punto 2 variará al hacer click sobre los barrios del mapa.


## Otros datos de Interes 📑
La interactividad de nuestra practica se consigue de dos maneras:
- Al pasar el raton sobre el mapa aparece el texto del barrio al que pertenece
- Al clickar sobre un barrio en el mapa, la gráfica del punto 2 cambia automaticamente. Esta grafica a veces se queda en blanco ya que hay barrios en el json que venian sin la informacion pertinente.

El proyecto consta de tres ficheros:
- main.css
- index.html
- practica.js

El codigo de practica.js esta profusamente comentado para poder hacer un seguimiento del mismo.

Para poder llevar a cabo la regresion lineal se ha hecho uso de la libreria de JavaScript: "Simple Statistics"
