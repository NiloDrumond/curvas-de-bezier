/* Setup */

const curvaModel = {
  points: [],
  pointsUp: [],
  pointsDown: [],
  vetores: [],
  espessuraDefault: 50,
  numeroPontos: 0,
  numeroTestes: 100,
  pontoAtual: -1,
};

var curvas = [{ ...curvaModel }];
var index = 0;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var move = false;

var showPoints = true;
var showPoligons = true;
var showCurve = true;

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

function calcularCurva(curva) {
  var pointsCurve = [];
  //para cada avaliacao:
  //var t = 1/2;
  var t = 0;
  for (
    var cont = 0;
    cont < curva.numeroTestes;
    t += 1 / curva.numeroTestes, cont++
  ) {
    var pointsDeCasteljau = curva.points.slice(0, curva.numeroPontos + 1);
    //para cada nivel:
    for (n = 1; n < curva.numeroPontos; n++) {
      //para cada ponto:
      for (p = 0; p < curva.numeroPontos - n; p++) {
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

function AddCurva() {
  curvas.push({
    ...curvaModel,
    points: [],
    pointsUp: [],
    pointsDown: [],
    vetores: [],
  });
  index = curvas.length - 1;
}

function RemoveCurva() {
  curvas.splice(index, 1);
  index = 0;
}

function ChangeCurva() {
  if (curvas.length > index + 1) {
    index++;
  } else {
    index = 0;
  }
}

function togglePoints() {
  showPoints = !showPoints;
}

function togglePoligons() {
  showPoligons = !showPoligons;
}

function toggleCurve() {
  showCurve = !showCurve;
}

function getIndex(click) {
  for (var i in curvas[index].points) {
    if (dist(curvas[index].points[i], click) <= 10) {
      return i;
    }
  }
  return -1;
}

/* Render */

function drawPoints(curva) {
  //desenha os pontos
  for (var i in curva.points) {
    if (showPoints) {
      ctx.beginPath();
      ctx.arc(curva.points[i].x, curva.points[i].y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = "purple";
    }
    ctx.fill();

    // desenha os poligonos
    if (showPoligons) {
      if (i > 0) {
        ctx.beginPath();
        var xAtual = curva.points[i - 1].x;
        var yAtual = curva.points[i - 1].y;
        ctx.moveTo(xAtual, yAtual);
        ctx.lineTo(curva.points[i].x, curva.points[i].y);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  if (curva.numeroPontos > 2) {
    if (showCurve) {
      calcularCurva(curva);
    }
  }
}

setInterval(() => {
  ctx.clearRect(0, 0, canvas.width, canvas.height); //redesenha o canvas
  for (let j = 0; j < curvas.length; j++) {
    drawPoints(curvas[j]);
  }
}, 100);

function drawCurve(pointsCurve, curva) {
  if (curva.numeroPontos > 2) {
    for (var i in pointsCurve) {
      ctx.beginPath();

      if (i > 0) {
        var xAtual = pointsCurve[i - 1].x;
        var yAtual = pointsCurve[i - 1].y;
        ctx.moveTo(xAtual, yAtual);
        ctx.lineTo(pointsCurve[i].x, pointsCurve[i].y);
        ctx.strokeStyle = curva === curvas[index] ? "green" : "red";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }
  }
}

/* Listeners */

canvas.addEventListener("mousemove", (e) => {
  if (move) {
    var antigo = curvas[index].points[i];
    curvas[index].points[i] = { x: e.offsetX, y: e.offsetY, e: antigo.e };
    drawPoints(curvas[index]);
  }
});

canvas.addEventListener("mouseup", (e) => {
  move = false;
});

canvas.addEventListener("dblclick", (e) => {
  if (i !== -1) {
    curvas[index].points.splice(i, 1);
    curvas[index].numeroPontos--;
  }
});

canvas.addEventListener("mousedown", (e) => {
  var click = { x: e.offsetX, y: e.offsetY, e: curvas[index].espessuraDefault };
  i = getIndex(click);
  console.log(curvas);
  if (i === -1) {
    curvas[index].numeroPontos = curvas[index].numeroPontos + 1;
    curvas[index].points.push(click);
    curvas[index].pontoAtual = curvas[index].numeroPontos - 2;
    drawPoints(curvas[index]);
  } else {
    move = true;
    curvas[index].pontoAtual = i;
  }
});

$("#num_avaliacoes").on("change", function (event) {
  //Funcao para editar o numero de avaliações
  curvas[index].numeroTestes = event.target.value;
  drawPoints(curvas[index]);
});
