import Grid from "./Table.js";

const canvas = document.getElementById("tableCanvas");
const ctx = canvas.getContext("2d");

// Get the dimensions of the navbar to adjust the canvas size
const navbarRect = document.getElementById("navbar").getBoundingClientRect();

// Set the canvas dimensions based on the window size and navbar height
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - navbarRect.height - 20;

// Set default drawing styles for the canvas context
ctx.fillStyle = "black";
ctx.strokeStyle = "#E1E1E1";

let numColumns = 30;
let numRows = 100;
let tableInstance = new Grid(ctx, numColumns, numRows, canvas);

// Draw the initial table structure on the canvas
tableInstance.drawGrid();

// Add event listeners to handle user interactions with the table
canvas.addEventListener("mousedown", (event) =>
    tableInstance.handleMouseDown(event)
);
canvas.addEventListener("mousemove", (event) =>
    tableInstance.handleMouseMove(event)
);
canvas.addEventListener("mouseup", (event) =>
    tableInstance.handleMouseUp(event)
);
canvas.addEventListener("dblclick", (event) =>
    tableInstance.handleDoubleClick(event)
);
window.addEventListener("keydown", (event) =>
    tableInstance.handleKeyPress(event)
);
window.addEventListener("keyup", (event) => tableInstance.handleKeyUp(event));
canvas.addEventListener("wheel", (event) => tableInstance.handleScroll(event));
window.addEventListener("resize", (event) => tableInstance.handleResize(event));

document
    .getElementById("csvUploadFormBtn")
    .addEventListener("click", (event) => handleCsvUpload(event));

// Fetch data from the API and update the table with the received data
async function fetchTableData() {
    const apiUrl = `http://localhost:5166/api/GetEmployees?${new URLSearchParams(
        {
            x: 100,
        }
    ).toString()}`;
    try {
        const response = await fetch(apiUrl, { method: "GET" });
        const data = await response.json();
        console.log(data);
        tableInstance.drawCsvData(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
    // addFormElements();
}

// Add interactive elements (delete, search, sort) to the form
function addFormElements() {
    const uploadForm = document.getElementById("uploadForm");

    // Add a delete button to the form
    function addDeleteButton() {
        const deleteDiv = document.createElement("div");
        deleteDiv.classList.add("delete");

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash");

        const deleteText = document.createElement("p");
        deleteText.innerHTML = "Delete";

        deleteDiv.appendChild(deleteIcon);
        deleteDiv.appendChild(deleteText);
        uploadForm.appendChild(deleteDiv);

        deleteDiv.addEventListener("click", () => tableInstance.handleDelete());
    }

    // Add a search bar to the form
    function addSearchBar() {
        const searchDiv = document.createElement("div");
        searchDiv.classList.add("search-bar");

        const searchInput = document.createElement("input");
        searchInput.classList.add("input-email");
        searchInput.type = "text";
        searchInput.placeholder = "Search by email";

        const searchButton = document.createElement("button");
        searchButton.classList.add("btn-search");
        searchButton.type = "button";
        searchButton.innerHTML = "Search";

        searchDiv.appendChild(searchInput);
        searchDiv.appendChild(searchButton);
        uploadForm.appendChild(searchDiv);

        searchButton.addEventListener("click", () =>
            tableInstance.handleSearch()
        );
    }

    // Add a sort button to the form
    function addSortButton() {
        const sortDiv = document.createElement("div");
        sortDiv.classList.add("sort");

        const sortIcon = document.createElement("i");
        sortIcon.classList.add("fa-solid", "fa-arrow-down-1-9");

        const sortText = document.createElement("p");
        sortText.innerHTML = "Sort";

        sortDiv.appendChild(sortIcon);
        sortDiv.appendChild(sortText);
        uploadForm.appendChild(sortDiv);

        sortDiv.addEventListener("click", () => tableInstance.handleSort());
    }

    // addSearchBar();
    // addDeleteButton();
    // addSortButton();
}

// Handle the CSV file upload process
async function handleCsvUpload(event) {
    event.preventDefault();
    console.log("HELLOW");

    const fileInput = document.getElementById("csvFileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file");
        console.error("No file selected");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    // const apiUrl = `http://localhost:5166/api/GetEmployees?${new URLSearchParams({
    //     //     x: 100,
    //     // }).toString()}`
    try {
        const response = await fetch(
            "http://localhost:5166/api/fasterUpload_Rabbit",
            {
                method: "POST",
                body: formData,
            }
        );
        const data = await response.json();
        console.log(data);

        await trackUploadProgress(data.fid);
    } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload the file.");
    }
}

// Monitor the progress of the CSV file upload
async function trackUploadProgress(fileId) {
    let totalBatches = null;
    let uploadedBatches = null;
    const progressBar = document.getElementById("uploadProgressBar");
    progressBar.style.display = "block";
    console.log("File Id", fileId);

    const progressInterval = setInterval(async () => {
        const url = `http://localhost:5166/api/GetStatusData?Fid=${fileId}`;
        console.log(url);
        try {
            const response = await fetch(url, { method: "GET" });
            const data = await response.json();
            console.log(data[0]);

            totalBatches = data[0].totalBatches;
            uploadedBatches = data[0].batches.length;
            const uploadPercentage = (uploadedBatches / totalBatches) * 100;
            progressBar.style.width = `${uploadPercentage}%`;

            if (totalBatches && uploadedBatches) {
                if (totalBatches === uploadedBatches) {
                    clearInterval(progressInterval);
                    progressBar.style.display = "none";
                    progressBar.style.width = "0%";
                    fetchTableData();
                }
            }
        } catch (error) {
            console.error("Error fetching upload progress:", error, fileId);
        }
    }, 2000);
}
