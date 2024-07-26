import { canvas, ctx as context } from "./GetCanvasContent.js";
import Cell from "./cell.js";
import Table from "./table.js";
import Headers from "./header.js";
import Indexing from "./index.js";

canvas.width = 5000;
canvas.height = 3000;

context.fillStyle = "black";
context.strokeStyle = "#E1E1E1";

let columns = 27;
let rows = 100;
const apiUrl = `http://localhost:5166/api/GetEmployees?${new URLSearchParams({
    x: 100,
}).toString()}`;
let arrayOfObjectValues = [];
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
            console.log("called pagination");
            console.log(data);
            arrayOfObjectValues = data.map((obj) => Object.values(obj));
            console.log(arrayOfObjectValues);
            let table = new Table(
                context,
                columns,
                rows,
                canvas,
                arrayOfObjectValues
            );
            table.draw();
            
            let columns_width = table.getColumnsWidth();
            let headers = new Headers(
                context,
                columns,
                rows,
                columns_width,
                canvas
            );
            let indexing = new Indexing(context, rows);
            headers.draw(0, columns_width);
            indexing.draw();
            // document.getElementById('cont').addEventListener("wheel",(event) => {
            //     console.log("scolled")
            //     headers.headerHandler(event)
            // });

            // document.addEventListener("wheel",(event) =>{ console.log("scroll:-"+window.scrollY); headers.headerHandler(event)});
            canvas.addEventListener("mousedown", (event) => {
                var colNum = headers.handleMouseDown(event);
                // console.log(colNum);
                if (colNum != null) {
                    table.selectColumn(colNum);
                }
            });
            window.addEventListener("keydown", (event) =>
                table.keyDownHandler(event)
            );
            canvas.addEventListener("mousedown", (event) =>
                table.handleMouseDown(event)
            );
            canvas.addEventListener("mousemove", (event) =>
                table.handleMouseMove(event)
            );
            canvas.addEventListener("mouseup", (event) =>
                table.handleMouseUp(event)
            );
            canvas.addEventListener("dblclick", (event) =>
                table.doubleClickHandler(event)
            );
        }
    })
    .catch((error) => {
        console.error("Fetch Error:", error);
    });
