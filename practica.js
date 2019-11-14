const api = 'https://gist.githubusercontent.com/miguepiscy/2d431ec3bc101ef62ff8ddd0e476177f/raw/d9f3a11cfa08154c36623c1bf01537bb7b022491/practica.json'

// Array con los barrios
let array_barrios = []

function parserData(data) {
    // En lugar de tener un parser para cada elemento (mapa, grafica y regresion)
    // crearemos una object (arr_total) que contendra los datos para pintar cada elemento,
    // es decir: {mapa:datos_mapa , grafica:datos_grafica, regresion: datos_regresion }.
    // Para el caso de la grafica los datos seran un object con los barrios como key y el avgbedrooms
    // como value. Esto facilitar la busqueda a la hora de pasar de uno a otro para pintar
    // Para el caso de la regresion los datos deberian ser un object con los barrios como key
    // y el properties como value. Sin embargo la grafica que obtenemos si pintamos camas frente a precios
    // no tiene sentido desde el punto de vista de la regresion.
    // Por ello añadiremos una key mas llamada regresion2 donde se comparara el numero de propiedades de
    // un barrio con el precio medio del barrio y sera lo que utilicemos para pintar la nube de puntos y 
    // la regresion
    // Desgraciadamente asi solo podemos tener una unica regresion para todos los barrios y no pondra
    // cambiar al pulsar sobre los barrios del mapa
    const arr_total = {};
    const arr_grafica = [];
    const arr_regresion = [];
    const arr_regresion2 = [];

    // Este es el array con los datos usado en el mapa
    arr_total.mapa = data.features

    // Para los arrays de datos de la grafica y la regresion debemos recorrer el JSON
    for(let i in data.features){
        // Reiniciamos los array en cada bucle
        
        // Array que contendra la feature avgbedrooms (Array) para cada barrio 
        array_avgbedrooms = []
        
        //Array que contendra la feature properties (Array) para cada barrio 
        array_properties = []
        
        // Para la regresion2
        let array_tmp = {}

        // Para la grafica
        for(let j in data.features[i].properties.avgbedrooms){
            array_avgbedrooms[j]={bedrooms:data.features[i].properties.avgbedrooms[j].bedrooms, total:data.features[i].properties.avgbedrooms[j].total}
        }       
        arr_grafica[data.features[i].properties.name] = array_avgbedrooms

        // Para la regresion
        for(let j in data.features[i].properties.properties){
          array_properties[j]={bedrooms:data.features[i].properties.properties[j].bedrooms, price:data.features[i].properties.properties[j].price}
        }       
        arr_regresion[data.features[i].properties.name] = array_properties

        // Para la regresion2 (lo que realmente pintaremos)
        // Chequeamos que no este vacio para que no de problemas el reduce
        if(array_avgbedrooms.length == 0)
          continue
        let num_propiedades = array_avgbedrooms.reduce((a,b)=>{
          return{bedrooms:0,total:a.total+b.total}
        }).total

        // Para que la gráfica de la regresion no se vaya de madre filtramos los barrios 
        // que tengan en total un numero de pisos inferior a 150
        if (num_propiedades>150)
          continue
        let precio_medio = data.features[i].properties.avgprice
        array_tmp = {num_propiedades:num_propiedades,avgprice:precio_medio}
        arr_regresion2.push(array_tmp)
    }
    //Incluimos los distintos array de datos al array total 
    arr_total.grafica = arr_grafica
    arr_total.regresion = arr_regresion
    arr_total.regresion2 =  arr_regresion2
    return arr_total;
}

function drawMap(parser){
  const width = 800;
  const height = 850;
  const zoom =100000
  const titulo = d3.select('#mapa')
        .append('p')
        .text("MAPA BARRIOS DE MADIRD")
        .attr('class','titulo-mapa')

  const svg = d3.select('#mapa')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class','svg-mapa')
  
  const projection = d3.geoMercator()
  .scale(zoom)
  .center([-3.703521, 40.417007])
  .translate([width/2, height/1.6]);
  
  const path = d3.geoPath().projection(projection);

  const data_features = parser.mapa
  
  const barrios = svg.selectAll('.barrios')
    .data(data_features)
    .enter()
    .append('path')
    .attr('class', 'barrios');
  
  barrios
    .attr('d', path)
    .on('click', (d) => {
      document.getElementById('grafica').innerHTML='';
      drawChart(parser,d.properties.name);
    })
    .on("mouseover", d =>{
      svg.append("text")
        .text(d.properties.name)
        .attr('id','text-barrio')
        .attr('x', d3.event.pageX)
        .attr('y', d3.event.pageY);
      }    
    )
    .on("mouseout", d=>{
      d3.select("#text-barrio").remove()
    });

  const color = d3.scaleOrdinal(d3.schemeBlues[5]);
  barrios
      .attr('fill', (d) => color(d.properties.avgprice))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
    
}

function drawChart(parser,barrio) {
    const height_svg = 380;
    const width_svg = 700;
    // Para evitar problemas con los margenes y que las graficas se puedan salir del SVG
    // Dejaremos el tamaño mayor para el svg pero realmente pintaremos en una rectangulo menor
    // que vendra dado por una reduccion del % definido en la variable reduction.
    // Esto ya soluciona el problema del eje x (que no se vean los numeros) y ademas nos permitira
    // incluir nuevos elementos por si hace falta dentro del SVG (superfice de pintado)
    // El problema del eje y lo solucionaremos aplicando un margen por la izda y por arriba.

    const reduction = 10
    const height = height_svg *(1-reduction/100);
    const width = width_svg *(1-reduction/100);;
    const marginLeft = 40;
    const marginTop = 10;
    
    const titulo = d3.select('#grafica')
        .append('p')
        .text(`Barrio de ${barrio}`)
        .attr('class','titulo-grafica')
    
    const svg = d3.select('#grafica')
      .append('svg')
      .attr('width', width_svg)
      .attr('height', height_svg);
    
    data = parser.grafica[barrio]
  

    //En estas graficas tanto el eje x como el y siguen una escala lineal
    
    const y = d3.scaleLinear()
        //La funcion extends sirve para obtener de manera rapida el maximo y minimo
        .domain(d3.extent(data, d => d.total))
        .range([height, marginTop]);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.bedrooms))
        .range([marginLeft, width]);
    
    const line = d3.line()
        .x(d => x(d.bedrooms))
        .y(d => y(d.total));
  
    const group = svg.append('g');
    group.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 2)
      .attr('d', line(data));
  
    const axisX = d3.axisBottom(x).ticks(5);
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(axisX);
    
    const axisY = d3.axisLeft(y);
    svg.append('g')
      .call(axisY)
      .attr('transform', `translate(${marginLeft}, 0)`);
  
}

function drawRegresion(parser) {

  // Hacemos lo mismo que para la grafica
  const height_svg = 390;
  const width_svg = 800;
  const reduction = 10
  const height = height_svg *(1-reduction/100);
  const width = width_svg *(1-reduction/100);;
  const marginLeft = 40;
  const marginTop = 10;
  const ratio = 5;
  
  const titulo = d3.select('#regresion')
      .append('p')
      .text(`Precio Medio vs Numero Viviendas (con regresion de regalo)`)
      .attr('class','titulo-grafica')
  
  const svg = d3.select('#regresion')
    .append('svg')
    .attr('width', width_svg)
    .attr('height', height_svg);
  
    
  // Obtenemos los datos utiles para pintar la nube de puntos
  data = parser.regresion2

  //En estas graficas tanto el eje x como el y siguen una escala lineal  
  const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.num_propiedades))
      .range([marginLeft, width]);
  
  const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.avgprice))
      .range([height, marginTop]);

  const group = svg.selectAll('g')
      .data(data)
      .enter()
      .append('g')
  
  group.attr('transform', (d) => {
    const coordx = x(d.num_propiedades);
    const coordy = y(d.avgprice);
    return `translate(${coordx}, ${coordy})`;
  })
      
  const circle = group
    .append('circle');
  
  circle
    .attr('cx', d => 0)
    .attr('cy', d => 0)
    .attr('r', ratio)  
  
  const color = d3.scaleOrdinal(d3.schemeBlues[5]);
  circle
      .attr('fill', (d) => color(d.num_propiedades))

  const axisX = d3.axisBottom(x);
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(axisX);
  
  const axisY = d3.axisLeft(y);
  svg.append('g')
    .call(axisY)
    .attr('transform', `translate(${marginLeft}, 0)`);

  // Vamos a intentar pintar la regresion
  // Para usar la funcion de regresion de la libreria "Simple Statistics" los datos
  // con los que alimentamos las funcion linearRegression tienen que ser un array de array [x,y]
  
  let array_valores_regresion = []
  for(let i in data){
      arr_tmp2 =[]
      arr_tmp2 = [data[i].num_propiedades, data[i].avgprice]
      array_valores_regresion.push(arr_tmp2)
  }

  const l = ss.linearRegression(array_valores_regresion)
  const lr = ss.linearRegressionLine(l);
 
  // Para pintar una recta basta con tener dos puntos, cogeremos los extremos de nuestra grafica de puntos,
  // por ejemplo 0 y 135
  const punto1 = [0, lr(0)]
  const punto2 = [135, lr(135)]
  const data_regresion = []
  data_regresion.push(punto1)
  data_regresion.push(punto2)

  // Por ultimo incluiremos en nuestra grafica una linea que incluya esos dos puntos
  // Usaremos las escalas ya creadas

  const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));
  
    group.append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 3)
      .attr('d', line(data_regresion));

}

d3.json(api)
  .then((data) => {
    const parser = parserData(data);
    let barrio = "Embajadores"
  
    //Para pintar el mapa
    drawMap(parser)

    //Para pintar la grafica
    drawChart(parser,barrio);

    //Para pintar la grafica
    drawRegresion(parser);
});      