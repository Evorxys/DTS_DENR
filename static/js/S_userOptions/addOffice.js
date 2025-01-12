let selectedRow = null;
let currentPage = 1;
const rowsPerPage = 5;

function selectRow(row) {
    if (selectedRow) {
        selectedRow.classList.remove('selected');
    }
    selectedRow = row;
    selectedRow.classList.add('selected');
}

function editSelectedOffice() {
    if (!selectedRow) {
        alert('Please select an office to edit.');
        return;
    }

    const sectionDesignation = selectedRow.querySelector('td:nth-child(1)').textContent;
    const officeCategory = selectedRow.querySelector('td:nth-child(2)').textContent;

    document.getElementById('sectionDesignation').value = sectionDesignation;
    document.getElementById('officeCategory').value = officeCategory;

    const officeId = selectedRow.getAttribute('data-id');
    document.getElementById('addOfficeForm').action = `/edit_office/${officeId}`;
}

function deleteSelectedOffice() {
    if (!selectedRow) {
        alert('Please select an office to delete.');
        return;
    }

    const officeId = selectedRow.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this office?')) {
        fetch(`/delete_office/${officeId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to delete office');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function editOffice(id) {
    const row = document.querySelector(`#officeTable tr[data-id='${id}']`);
    const sectionDesignation = row.querySelector('td:nth-child(1)').textContent;
    const officeCategory = row.querySelector('td:nth-child(2)').textContent;

    document.getElementById('sectionDesignation').value = sectionDesignation;
    document.getElementById('officeCategory').value = officeCategory;

    document.getElementById('addOfficeForm').action = `/edit_office/${id}`;
}

function deleteOffice(id) {
    if (confirm('Are you sure you want to delete this office?')) {
        fetch(`/delete_office/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to delete office');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function updatePagination() {
    const rows = document.querySelectorAll('#officeTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const pageNumbers = document.getElementById('pageNumbers');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    pageNumbers.innerHTML = '';
    const pageNumber = document.createElement('button');
    pageNumber.textContent = currentPage;
    pageNumber.classList.add('page-number');
    pageNumber.classList.add('active');
    pageNumbers.appendChild(pageNumber);

    rows.forEach((row, index) => {
        row.style.display = (index >= (currentPage - 1) * rowsPerPage && index < currentPage * rowsPerPage) ? '' : 'none';
    });
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
}

function nextPage() {
    const rows = document.querySelectorAll('#officeTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
}

function goToPage(page) {
    currentPage = page;
    updatePagination();
}

document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
});
