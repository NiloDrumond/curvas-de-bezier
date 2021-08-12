/* Setup */

const espessuraDefault = 50;
var numeroTestes = 100;
var points = []
var pontoAtual = -1;

var index = 0;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var move = false;

var showPoints = true;
var showCurve = true;
var showPolygonal = true;
var showPointsBezier = true;

function resizeCanvas() {
  canvas.width = parseFloat(window.getComputedStyle(canvas).width);
  canvas.height = parseFloat(window.getComputedStyle(canvas).height);
}

resizeCanvas();

/* Utils */

function dist(p1, p2) {
  var v = { x: p1.x - p2.x, y: p1.y - p2.y };
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/* Algoritmo De Casteljau */

var vtPontos;

function calcularCurvaBezier(curva) {
  var pointsCurve = [];
  //para cada avaliacao:
  //var t = 1/2;
  var t = 0;
  for (
    var cont = 0;
    cont < numeroTestes;
    t += 1 / numeroTestes, cont++
  ) {
    var numeroPontos = curva.length;
    var pointsDeCasteljau = curva.slice(0, numeroPontos + 1);
    //para cada nivel:
    for (n = 1; n < numeroPontos; n++) {
      //para cada ponto:
      for (p = 0; p < numeroPontos - n; p++) {
        var cordX =
          (1 - t) * pointsDeCasteljau[p].x + t * pointsDeCasteljau[p + 1].x;
        var cordY =
          (1 - t) * pointsDeCasteljau[p].y + t * pointsDeCasteljau[p + 1].y;
        pointsDeCasteljau[p] = { x: cordX, y: cordY };
      }
    }
    pointsCurve.push(pointsDeCasteljau[0]);
  }
  drawCurve(pointsCurve, curva);
}

//----------------------Canvas-------------------------------------

/* Interação */

function RemoveCurva() {
  points = [];
  pontoAtual = -1;
  index = 0;
}

function togglePoints() {
  showPoints = !showPoints;
}

function togglePointsBezier(){
  showPointsBezier = !showPointsBezier;
}

function togglePolygonal(){
  showPolygonal = !showPolygonal;
}

function toggleCurve(){
  showCurve = !showCurve;
}


function getIndex(click) {
  for (var i in points) {
    if (dist(points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}

/* Render */

function drawPoints() {
  //desenha os pontos de controle da b-spline
  for (var i in points){
    if (showPoints) {
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "#F3F3F3";
    }
    ctx.fill();

    // desenha os poligonos da b-spline
    if (i > 0 && showPolygonal) {
      ctx.beginPath();
      var xAtual = points[i - 1].x;
      var yAtual = points[i - 1].y;
      ctx.moveTo(xAtual, yAtual);
      ctx.lineTo(points[i].x, points[i].y);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  var numeroPontos = points.length;

  // Se pontos <= 4, então podemos fazer apenas uma curva de bézier
  if (numeroPontos > 2 && numeroPontos <= 4) {
    calcularCurvaBezier(points);
  }

  // Para numero pontos >= 5, vamos desenhar uma curva B-Spline cúbica
  else if(numeroPontos >= 5 && showCurve){
    var pointsD = JSON.parse(JSON.stringify(points));;
    var L = numeroPontos - 3;

    // O vetor começa com o Ponto b2 = (d0 + d1)/2
    var pointsB = [{
      x: (pointsD[1].x + pointsD[2].x)/2,
      y: (pointsD[1].y + pointsD[2].y)/2,
      e: espessuraDefault
    }];

    for(let i = 1 ; i <= L-2 ; i++){
      var j = i+1;
      // Ponto B3i-1
      pointB = {
        x: (2*pointsD[j].x + pointsD[j+1].x)/3,
        y: (2*pointsD[j].y + pointsD[j+1].y)/3,
        e: espessuraDefault,
      };
      // Ponto B3i+1
      pointB2 = {
        x: (pointsD[j].x + 2*pointsD[j+1].x)/3,
        y: (pointsD[j].y + 2*pointsD[j+1].y)/3,
        e: espessuraDefault,
      }
      pointsB.push(pointB);
      pointsB.push(pointB2);
    }

    // Ponto B3L-2
    pointsB.push({
      x: (pointsD[L].x + pointsD[L+1].x)/2,
      y: (pointsD[L].y + pointsD[L+1].y)/2,
      e: espessuraDefault
    });

    pointsBezier = pointsD.slice(0,2);
    // Segunda passada para calcular os pontos médios
    // Ponto B3i = (B3i-1 + B3i+1)/2
    for(let i = 0 ; i < pointsB.length ; i += 2){
      pointsBezier.push(pointsB[i]);
      // ponto médio
      pointsBezier.push({
        x: (pointsB[i].x + pointsB[i+1].x)/2,
        y: (pointsB[i].y + pointsB[i+1].y)/2,
        e: espessuraDefault
      })
      pointsBezier.push(pointsB[i+1]);
    }

    var lastPoint = pointsD.pop();
    pointsBezier.push(pointsD.pop());
    pointsBezier.push(lastPoint);

    // Desenhando os pontos de controle da curva de bézier
    if(showPointsBezier){
      for(var pt of pointsBezier){
        console.log(pt.x, pt.y)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "#3840d6";
        ctx.fill();
      }
    }

    // Desenhar a curva b-splines a partir de varias curvas de bezier
    for(let i = 0 ; i < pointsBezier.length && showCurve; i+= 3){
      // pegar os pontos da curva de bezier atual
      var pontosCurvaBezier = [];
      pontosCurvaBezier.push(pointsBezier[i]);
      pontosCurvaBezier.push(pointsBezier[i+1]);
      pontosCurvaBezier.push(pointsBezier[i+2]);
      pontosCurvaBezier.push(pointsBezier[i+3]);

      // desenhar a curva
      calcularCurvaBezier(pontosCurvaBezier);
    }




  }

}

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //redesenha o canvas
  drawPoints();
}, 100);

function drawCurve(pointsCurve, curva) {
  numeroPontos = curva.length;
  if (numeroPontos > 2) {
    for (var i in pointsCurve) {
      ctx.beginPath();

      if (i > 0) {
        var xAtual = pointsCurve[i - 1].x;
        var yAtual = pointsCurve[i - 1].y;
        ctx.moveTo(xAtual, yAtual);
        ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
        ctx.strokeStyle = "#50a669";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }
}

/* Listeners */

canvas.addEventListener("mousemove", (e) => {
  if (move) {
    var antigo = points[i];
    points[i] = { x: e.offsetX, y: e.offsetY, e: antigo.e };
    drawPoints();
  }
});

canvas.addEventListener("mouseup", (e) => {
  move = false;
});

canvas.addEventListener("dblclick", (e) => {
  if (i !== -1) {
    points.splice(i, 1);
  }
});

canvas.addEventListener("mousedown", (e) => {
  var click = { x: e.offsetX, y: e.offsetY, e: espessuraDefault };
  i = getIndex(click);
  if (i === -1) {
    var numeroPontos = points.length;
    numeroPontos = numeroPontos + 1;
    points.push(click);
    pontoAtual = numeroPontos - 2;
    drawPoints();
  } else {
    move = true;
    pontoAtual = i;
  }
});

$("#num_avaliacoes").on("change", function (event) {
  //Funcao para editar o numero de avaliações
  numeroTestes = event.target.value;
  drawPoints();
});
