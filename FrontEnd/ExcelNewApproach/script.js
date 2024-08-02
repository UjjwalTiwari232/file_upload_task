import Grid from "./grid.js";

const canvas = document.getElementById("excelCanvas");
const searchButton = document.getElementById("searchButton");
const inputBar = document.getElementById("inputBar");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth - 6;
canvas.height = window.innerHeight - 6;
let numberOfColumns = 27;
let numberofRows = 100;
let widthOfColumn = 130;
let heightOfRow = 30;
let headerHeight = 30;
let indexWidth = 60;

// Arrays for column widths and row heights
var columnWidths = new Array(numberOfColumns).fill(widthOfColumn);
var rowHeights = new Array(numberofRows).fill(heightOfRow);

let arrayOfObjectValues = [];

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
            // start(arrayOfObjectValues);
            const girdObj = new Grid(
                numberOfColumns,
                numberofRows,
                indexWidth,
                headerHeight,
                canvas.width,
                canvas.height,
                ctx,
                columnWidths,
                rowHeights,
                canvas,
                arrayOfObjectValues
            );
            girdObj.drawGrid();

            // Mouse Events
            canvas.addEventListener("mousedown", (event) => {
                girdObj.checkReizeOrSelect(event);
            });
            canvas.addEventListener("mousemove", (event) => {
                girdObj.resizeColumnWidth(event);
                girdObj.resizeRowHeight(event);
                girdObj.selectingMultiple(event);
            });
            canvas.addEventListener("mouseup", (event) => {
                girdObj.reDraw(event);
            });
            canvas.addEventListener("wheel", (event) => {
                girdObj.scrollHandler(event);
            });
        }
    })
    .catch((error) => {
        console.error("Fetch Error:", error);
    });

searchButton.addEventListener("click", async () => {
    console.log(inputBar.value);
    var userData = await fetchByEmail(inputBar.value);
    console.log(userData);
    arrayOfObjectValues = [];
    arrayOfObjectValues.push(userData);
    start(arrayOfObjectValues);
    // numberofRows = arrayOfObjectValues.length;
    // numberOfColumns = arrayOfObjectValues[0].length;
    // const girdObj = new Grid(
    //     numberOfColumns,
    //     numberofRows,
    //     indexWidth,
    //     headerHeight,
    //     canvas.width,
    //     canvas.height,
    //     ctx,
    //     columnWidths,
    //     rowHeights,
    //     canvas,
    //     arrayOfObjectValues
    // );
    // girdObj.drawGrid();
    // data.push(userData);
    // gridLines.setData([userData]);
    // gridLines.drawGrid();
    // gridLines.drawCanvas();
    inputBar.value = "";
});
async function fetchByEmail(email) {
    var data = undefined;
    const apiUrl = `http://localhost:5166/api/email/${email}`;
    try {
        const response = await fetch(apiUrl);
        const apiData = await response.json();
        // let apidata = data;
        // apidata = data.map(data => Object.values(data));
        // console.log("data",Object.values(apiData[0]));

        // for(let i=0;i<apiData.length;i++){
        data = Object.values(apiData);
        // }
    } catch (error) {
        console.log(error);
    }
    return data;
}
function start(userData) {
    arrayOfObjectValues = userData;
    // arrayOfObjectValues.push(userData);
    const girdObj = new Grid(
        numberOfColumns,
        numberofRows,
        indexWidth,
        headerHeight,
        canvas.width,
        canvas.height,
        ctx,
        columnWidths,
        rowHeights,
        canvas,
        arrayOfObjectValues
    );
    girdObj.drawGrid();

    canvas.addEventListener("mousedown", (event) => {
        girdObj.checkReizeOrSelect(event);
    });
    canvas.addEventListener("mousemove", (event) => {
        girdObj.resizeColumnWidth(event);
        girdObj.resizeRowHeight(event);
        girdObj.selectingMultiple(event);
    });
    canvas.addEventListener("mouseup", (event) => {
        girdObj.reDraw(event);
    });
    canvas.addEventListener("wheel", (event) => {
        girdObj.scrollHandler(event);
    });
}
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
