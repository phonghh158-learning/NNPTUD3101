const API_URL = 'https://api.escuelajs.co/api/v1/products';
const dashboardContainer = document.getElementById('dashboard-container');
const searchInput = document.getElementById('search-input');
const rowsPerPageSelect = document.getElementById('rows-per-page');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const pageInfo = document.getElementById('page-info');
const iconTitle = document.getElementById('icon-title');
const iconPrice = document.getElementById('icon-price');

let currentSortColumn = '';
let isAscending = true;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let rowsPerPage = 5;

async function getAllProducts() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(response.status);
        }
        const data = await response.json();
        return data.slice(0, 20);
    } catch (error) {
        return [];
    }
}

function renderTable() {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedItems = filteredProducts.slice(startIndex, endIndex);

    if (paginatedItems.length === 0) {
        dashboardContainer.innerHTML =
            '<tr><td colspan="6" style="text-align:center;">Không tìm thấy dữ liệu</td></tr>';
        pageInfo.innerText = `Trang 0 / 0`;
        btnPrev.disabled = true;
        btnNext.disabled = true;
        return;
    }

    const htmlContent = paginatedItems
        .map((product) => {
            let imageSrc = product.images.length > 0 ? product.images[0] : '';
            if (imageSrc.startsWith('["')) {
                imageSrc = imageSrc.replace(/["[\]]/g, '');
            }

            return `
            <tr>
                <td>${product.id}</td>
                <td style="text-align: center;">
                    <img src="${imageSrc}" class="table-img" alt="Img" onerror="this.src='https://via.placeholder.com/100'">
                </td>
                <td><strong>${product.title}</strong></td>
                <td class="desc-col">${product.description}</td>
                <td>${product.category.name}</td>
                <td>$${product.price}</td>
            </tr>
        `;
        })
        .join('');

    dashboardContainer.innerHTML = htmlContent;

    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;

    btnPrev.disabled = currentPage === 1;
    btnNext.disabled = currentPage === totalPages;
}

function handleSort(column) {
    if (currentSortColumn === column) {
        isAscending = !isAscending;
    } else {
        currentSortColumn = column;
        isAscending = true;
    }

    iconTitle.innerText = '↕';
    iconPrice.innerText = '↕';

    const arrow = isAscending ? '↑' : '↓';
    if (column === 'title') iconTitle.innerText = arrow;
    if (column === 'price') iconPrice.innerText = arrow;

    filteredProducts.sort((a, b) => {
        let valA = a[column];
        let valB = b[column];

        if (column === 'title') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
            if (valA < valB) return isAscending ? -1 : 1;
            if (valA > valB) return isAscending ? 1 : -1;
            return 0;
        } else {
            return isAscending ? valA - valB : valB - valA;
        }
    });

    renderTable();
}

function handleSearch() {
    const keyword = searchInput.value.toLowerCase();
    filteredProducts = allProducts.filter((product) =>
        product.title.toLowerCase().includes(keyword)
    );
    currentPage = 1;

    if (currentSortColumn) {
        const savedSortCol = currentSortColumn;
        const savedAsc = isAscending;
        currentSortColumn = '';
        handleSort(savedSortCol);
        isAscending = savedAsc;
    }

    renderTable();
}

function handleRowsChange() {
    rowsPerPage = parseInt(rowsPerPageSelect.value);
    currentPage = 1;
    renderTable();
}

function handlePrev() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function handleNext() {
    const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

searchInput.addEventListener('input', handleSearch);
rowsPerPageSelect.addEventListener('change', handleRowsChange);
btnPrev.addEventListener('click', handlePrev);
btnNext.addEventListener('click', handleNext);

async function initApp() {
    allProducts = await getAllProducts();
    filteredProducts = [...allProducts];
    renderTable();
}

initApp();
