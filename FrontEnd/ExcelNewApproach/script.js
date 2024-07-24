import Grid from "./grid.js";

const canvas = document.getElementById("excelCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let numberOfColumns = 100;
let numberofRows = 100;
let widthOfColumn = 130;
let heightOfRow = 30;
let headerHeight = 30;
let indexWidth = 40;

// Arrays for column widths and row heights
var columnWidths = new Array(numberOfColumns).fill(widthOfColumn);
var rowHeights = new Array(numberofRows).fill(heightOfRow);

let arrayOfObjectValues = [];

const girdObj = new Grid(
    numberOfColumns,
    numberofRows,
    indexWidth,
    headerHeight,
    canvas.width,
    canvas.height,
    ctx,
    columnWidths,
    rowHeights
);
girdObj.drawGrid();

//SQL DATA Fetching
const apiUrl = `http://localhost:5166/api/GetEmployees?${new URLSearchParams({
    x: 100,
}).toString()}`;

fetch(apiUrl)
    .then((response) => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then((data) => {
        if (data.msg === false) {
            alert("please submit the form first");
        } else {
            console.log(data);
            arrayOfObjectValues = data.map((obj) => Object.values(obj));
            console.log(arrayOfObjectValues);
            // Call the function to draw the grid
            // drawGrid();
        }
    })
    .catch((error) => {
        console.error("Fetch Error:", error);
    });

//Mouse Events
canvas.addEventListener("mousedown", (event) => {
    girdObj.checkReizeOrSelect(event);
});
canvas.addEventListener("mousemove", (event) => {
    girdObj.resizeColumnWidth(event);
});
canvas.addEventListener("mouseup", (event) => {
    girdObj.reDraw(event);
});

// // Function to draw the grid
// function drawGrid() {
//     // Clear the canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     ctx.lineWidth = 1;
//     ctx.font = "12px Arial";
//     ctx.textAlign = "center";
//     ctx.textBaseline = "middle";
//     ctx.strokeStyle = "#BBB5B5";

//     // Set initial positions
//     let x = indexWidth;
//     let y = headerHeight;

//     for (let i = 0; i < numberOfColumns; i++) {
//         for (let j = 0; j < numberofRows; j++) {
//             let text = "";
//             if (arrayOfObjectValues[i][j] != undefined) {
//                 text = arrayOfObjectValues[i][j];
//             }
//             // Calculate the maximum width that the text can occupy in the cell
//             let maxWidth = columnWidths[j] - 10; // 10px padding on each side

//             // Measure the text width so that I can Avoid the Overlapping problem
//             let textWidth = ctx.measureText(text).width;
//             if (textWidth > maxWidth) {
//                 // Adjust text to fit within maxWidth
//                 while (textWidth > maxWidth && text.length > 0) {
//                     text = text.slice(0, -1); // Remove one character from the end
//                     textWidth = ctx.measureText(text + "...").width;
//                 }
//                 text += "...";
//             }
//             ctx.fillText(text, x + columnWidths[j] / 2, y + rowHeights[i] / 2);
//             x += columnWidths[j];
//         }
//         y += rowHeights[i];
//         x = indexWidth;
//     }

//     //Index Starting Border
//     ctx.moveTo(0, 0);
//     ctx.lineTo(0, canvas.height);
//     // Reset x to 40 for drawing text/horizontal lines (rows)
//     x = indexWidth;
//     y = headerHeight;
//     // Draw vertical lines (columns)
//     columnWidths.forEach((width, index) => {
//         ctx.moveTo(x + 0.5, 0);
//         ctx.lineTo(x + 0.5, canvas.height);
//         x += width;
//     });

//     // Draw the rightmost vertical line
//     ctx.moveTo(x + 0.5, 0);
//     ctx.lineTo(x + 0.5, canvas.height);

//     //Index Starting Border
//     ctx.moveTo(0, 0);
//     ctx.lineTo(canvas.width, 0);
//     // Draw horizontal lines (rows)
//     rowHeights.forEach((height, index) => {
//         ctx.moveTo(0, y + 0.5);
//         ctx.lineTo(canvas.width, y + 0.5);
//         y += height;
//     });

//     // Draw the bottommost horizontal line
//     ctx.moveTo(0, y + 0.5);
//     ctx.lineTo(canvas.width, y + 0.5);

//     // Stroke all lines
//     ctx.stroke();
// }