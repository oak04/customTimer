import 'bootstrap';

import '../scss/index.scss';

const colors = { GREY: "grey", WHITE: 'white', BLACK: 'black' };
let started = false;
let stopped = true;
let startTime = 0;
let currentColor = colors.GREY;
let activeTimer = false;
let timeStamp = Date.now();
let seconds = 0;
let timerInterval;
const tableID = "table";
const greyRowID = 'grey';
const whiteRowID = 'white';
const blackRowID = 'black';
const timerID = 'timer';
const restartModalID = 'restartModal';
const startButton = 'startButton';
const stopButton = 'stopButton';
const greyButton = 'greyButton';
const whiteButton = 'whiteButton';
const blackButton = 'blackButton';
const restartButton = 'restartButton';
const trialID = 'trial';

$(document).ready(() => {

  document.querySelector(`#${startButton}`).addEventListener("click", onStartClick);
  document.querySelector(`#${restartButton}`).addEventListener("click", onConfirmedRestartClick);

  document.querySelector(`#${stopButton}`).addEventListener("click", onStopClick);
  document.querySelector(`#${blackButton}`).addEventListener("click", () => onColorClick(colors.BLACK));
  document.querySelector(`#${greyButton}`).addEventListener("click", () => onColorClick(colors.GREY));
  document.querySelector(`#${whiteButton}`).addEventListener("click", () => onColorClick(colors.WHITE));

  document.querySelector(`#info`).addEventListener("click", onInfoClick);

   document.querySelector("#exportAsCSV").addEventListener("click", function () {
    let html = document.querySelector("#valuesTable").outerHTML;
    exportToCSV(html, `table-${new Date(timeStamp).toUTCString()}.csv`);
    });

});


const calculateTime = () => {
  const time = Date.now() - startTime;
  return (time/1000).toString();
}

const insertToTable = (currentColor, time) => {
  let rowId;
  switch (currentColor) {
    case colors.GREY:
      rowId = greyRowID;
      break;
    case colors.WHITE:
      rowId = whiteRowID;
      break;
    case colors.BLACK:
      rowId = blackRowID;
      break;
  }
  const row = document.getElementById(rowId);
  row.innerHTML = row.innerHTML + `<td class="value">${time}</td>`;
  document.getElementById('valuesTable').scrollLeft += 200;
}
const setCurrentColor = color => {
  document.getElementById(greyButton).classList.remove("clicked");
  document.getElementById(whiteButton).classList.remove("clicked");
  document.getElementById(blackButton).classList.remove("clicked");
  currentColor = color;
  switch (currentColor) {
    case colors.GREY:
      document.getElementById(greyButton).classList.add("clicked");
      break;
    case colors.WHITE:
      document.getElementById(whiteButton).classList.add("clicked");
      break;
    case colors.BLACK:
      document.getElementById(blackButton).classList.add("clicked");
      break;
  }
 

}

const resetTimer = () => {
  activeTimer = false;
  clearInterval(timerInterval);
  seconds=0
  document.getElementById(timerID).innerHTML = seconds; 
}

const resetVars = () => {
  started = false;
  stopped = true;
  setCurrentColor(colors.GREY);
  startTime = 0;
  activeTimer = false;
  timeStamp = Date.now();
  document.getElementById(trialID).innerHTML = '';
}

const cleanTable = () => {
  document.getElementById(greyRowID).innerHTML = '<th>Gray</th>';
  document.getElementById(blackRowID).innerHTML = '<th>Black</th>';
  document.getElementById(whiteRowID).innerHTML = '<th>White</th>';
}

const startRecording = () => {
  started = true;
  stopped = false;
  document.getElementById(trialID).innerHTML = new Date(timeStamp).toUTCString().replace(',','|');
  startTime = Date.now();
  activeTimer = true;
  animateTimer();
}
const continueRecording = () => {
  startTime = Date.now();
  activeTimer = true;
  seconds=0;
  animateTimer();
}

const animateTimer = () => {
  const timer = document.getElementById(timerID);
  
  if(activeTimer)

  timerInterval = setInterval(function () {
      seconds=(seconds+0.1);
      timer.innerHTML = seconds.toFixed(1).toString();
    }, 100);

}

const stopTimer = () => {
  activeTimer = false;
  resetTimer();
}


const calculateTableSum = () => {
  let greyTotal = sumRow("grey");
  $("grey").each(() => { greyTotal += parseFloat($(this).find('.value').text()); });
  const greyRow = document.getElementById(greyRowID);
  greyRow.innerHTML = greyRow.innerHTML + `<td class="table-warning">Total: ${greyTotal} s </td>`;

  let blackTotal =  sumRow("black");
  $("black").each(() => { blackTotal += parseFloat($(this).find('.value').text()); });
  const blackRow = document.getElementById(blackRowID);
  blackRow.innerHTML = blackRow.innerHTML + `<td class="table-warning">Total: ${blackTotal} s </td>`;

  let whiteTotal = sumRow("white");
  $("white").each(() => { whiteTotal += parseFloat($(this).find('.value').text()); });
  const whiteRow = document.getElementById(whiteRowID);
  whiteRow.innerHTML =  whiteRow.innerHTML + `<td class="table-warning">Total: ${whiteTotal} s</td>`;

  document.getElementById('valuesTable').scrollLeft += 200;

}

const sumRow = rowID => {
  const cells = document.getElementById(rowID).children;
  let total=0;
  for(let i=1; i<cells.length; i++){
    total+= parseFloat(cells[i].innerHTML);
  }
  return total.toString().substr(0,5);
}


const downloadCSV = (csv, filename) => {
  let csvFile;
  let downloadLink;


  csvFile = new Blob([csv], { type: "text/csv" });

  downloadLink = document.createElement("a");
  downloadLink.download = filename;
  downloadLink.href = window.URL.createObjectURL(csvFile);
  downloadLink.style.display = "none";
  document.body.appendChild(downloadLink);
  downloadLink.click();
}

const exportToCSV = (html, filename) => {
  if (!tableIsEmpty() && stopped) {
    let csv = [];
    let rows = document.querySelectorAll("table tr");

    for (let i = 0; i < rows.length; i++) {
      let row = [], cols = rows[i].querySelectorAll("td, th");

      for (let j = 0; j < cols.length; j++)
        row.push(cols[j].innerText);

      csv.push(row.join(","));
    }

    // Download CSV
    downloadCSV(csv.join("\n"), filename);
  }
}

const tableIsEmpty = () => document.getElementById(greyRowID).children.length == 1 || document.getElementById(blackRowID).children.length == 1 || document.getElementById(whiteRowID).children.length == 1;




const onStopClick = () => {
  if (stopped) {
    return
  } else {
    stopped = true;
    started = false;
    stopTimer();
    const time = calculateTime()
    insertToTable(currentColor, time);
    calculateTableSum();
  }
}

const onConfirmedStartClick = () => {
  resetVars();
  cleanTable();
  startRecording();
}

const onConfirmedRestartClick = () => {
  $(`#${restartModalID}`).modal('hide');
  resetVars();
  cleanTable(); 
}

const onStartClick = () => {
  if (started) {
    return
  }
  if (!tableIsEmpty()) {
    $(`#${restartModalID}`).modal({
      show: true
    });
  } else {
    onConfirmedStartClick();
  }

}

const onColorClick = color => {
  if (started) {
    const time = calculateTime(currentColor);

    insertToTable(currentColor, time);
   
    setCurrentColor(color);
    resetTimer();
    continueRecording(currentColor);
  }
}

const onInfoClick = () => {
  $(`#infoModal`).modal( {show: true});

}













