let lastMessageTime = 0;

function toggleMenu() {
    const menu = document.getElementById('slidingMenu');
    const content = document.getElementById('content');
    menu.classList.toggle('open');
    content.classList.toggle('shift-right');
}

function toggleNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);
}

function closeModal(event) {
    if (event.target === document.getElementById('notificationsModal')) {
        toggleNotificationsModal();
    }
}

function displayNotification(details) {
    const detailsDiv = document.getElementById('notificationDetails');
    detailsDiv.textContent = details;
}

function toggleNotifications() {
    toggleNotificationsModal();
}

function toggleSearch() {
    const searchBar = document.getElementById('searchBar');
    searchBar.classList.toggle('open');
    searchBar.classList.add('animate');
    setTimeout(() => searchBar.classList.remove('animate'), 500);
}

function performSearch() {
    const query = document.querySelector('#searchBar input').value.toLowerCase();
    const category = document.querySelector('#searchCategory').value;
    const rows = document.querySelectorAll('#documentTable tbody tr');

    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${getCategoryIndex(category)})`).textContent.toLowerCase();
        if (cell.includes(query)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

function getCategoryIndex(category) {
    switch (category) {
        case 'tracking_no':
            return 1;
        case 'document_type':
            return 2;
        case 'subject':
            return 4;
        case 'receiving_office_section':
            return 6;
        default:
            return 1;
    }
}

function printPage() {
    window.print();
}

function toggleChat() {
    const chatbox = document.getElementById('chatbox');
    chatbox.classList.toggle('open');
    chatbox.classList.add('animate');
    setTimeout(() => chatbox.classList.remove('animate'), 500);
}

function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value;
    if (message.trim() !== "") {
        const messagesContainer = document.getElementById('chatboxMessages');
        const messageElement = document.createElement('div');
        const currentTime = new Date().getTime();
        const timestamp = formatTimestamp(new Date());
        messageElement.classList.add('chatbox-message', 'sent');
        messageElement.innerHTML = `<span>${message}</span>`;
        if (currentTime - lastMessageTime > 300000) { // 5 minutes
            const timestampElement = document.createElement('small');
            timestampElement.classList.add('timestamp');
            timestampElement.textContent = timestamp;
            messagesContainer.appendChild(timestampElement);
        }
        messagesContainer.appendChild(messageElement);
        input.value = "";
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        lastMessageTime = currentTime;
    }
}

function toggleFloatingMenu() {
    const floatingMenu = document.getElementById('floatingMenu');
    const floatingButton = document.querySelector('.floating-button');
    floatingMenu.classList.toggle('open');
    floatingButton.classList.toggle('open');
    floatingMenu.classList.add('animate');
    setTimeout(() => floatingMenu.classList.remove('animate'), 500);
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
    };
    const formattedDateTime = now.toLocaleDateString('en-US', options);
    document.getElementById('datetime').textContent = formattedDateTime;
}

setInterval(updateDateTime, 1000);
document.addEventListener('DOMContentLoaded', updateDateTime);

// Simulate receiving a message
setTimeout(() => {
    const messagesContainer = document.getElementById('chatboxMessages');
    const messageElement = document.createElement('div');
    const timestamp = formatTimestamp(new Date());
    messageElement.classList.add('chatbox-message', 'received');
    messageElement.innerHTML = `<span>Hello! How can I help you?</span>`;
    const timestampElement = document.createElement('small');
    timestampElement.classList.add('timestamp');
    timestampElement.textContent = timestamp;
    messagesContainer.appendChild(timestampElement);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}, 2000);

function checkSimpleDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(7)').textContent.trim();
        const category = row.querySelector('td:nth-child(8)').textContent.trim();
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60; // Time difference in minutes

        if (status === 'Pending' && category === 'Simple Document' && timeDiff > 1) {
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            showExpiredAlertModal(trackingNo);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');
    const notificationsModal = document.getElementById('notificationsModal');
    notificationsModal.classList.remove('open');

    checkSimpleDocumentTimers();
    setInterval(checkSimpleDocumentTimers, 60000); // Refresh every 1 minute
});

function toggleNewDocumentModal() {
    const modal = document.getElementById('newDocumentModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);
}

function toggleSuccessDialog() {
    const dialog = document.getElementById('successDialog');
    dialog.classList.toggle('open');
    dialog.classList.add('animate');
    setTimeout(() => dialog.classList.remove('animate'), 500);
}

document.getElementById('newDocumentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch('/add_document', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            toggleNewDocumentModal();
            toggleSuccessDialog();
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            alert('Failed to add document');
        }
    })
    .catch(error => console.error('Error:', error));
});

function showExpiredAlertModal(trackingNo) {
    const notification = document.getElementById('expiredAlertModal');
    const viewButton = document.getElementById('viewExpiredDocumentButton');
    viewButton.setAttribute('onclick', `viewDocument('${trackingNo}')`);
    notification.classList.add('show');
    notification.classList.add('animate');
    setTimeout(() => notification.classList.remove('animate'), 500);
}

function viewExpiredDocument() {
    // Redirect to the document with expired timer
    window.location.href = '/DTS.html'; // Adjust the URL as needed
}

function toggleViewDocumentModal() {
    const modal = document.getElementById('viewDocumentModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);
}

function viewDocument(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const documentDetails = document.getElementById('documentDetails');
            documentDetails.innerHTML = `
                <h2>Document Details</h2>
                <p><strong>Tracking No:</strong> ${data.tracking_no}</p>
                <p><strong>Document Type:</strong> ${data.document_type}</p>
                <p><strong>Document Properties:</strong> ${data.document_properties}</p>
                <p><strong>Subject:</strong> ${data.subject}</p>
                <p><strong>Date Released:</strong> ${new Date(data.date_released).toLocaleString()}</p>
                <p><strong>Receiving Office/Section:</strong> ${data.receiving_office_section}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Document Category:</strong> ${data.document_category}</p>
            `;
            toggleViewDocumentModal();
            updateDocumentStatus(trackingNo, 'Processed');
            const notification = document.getElementById('expiredAlertModal');
            notification.classList.remove('show');
        })
        .catch(error => console.error('Error:', error));
}

function updateDocumentStatus(trackingNo, status) {
    fetch(`/update_document_status`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_no: trackingNo, status: status })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Document status updated successfully');
        } else {
            console.error('Failed to update document status');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Ensure the plus icon shows when the screen is small
function checkScreenSize() {
    const floatingButton = document.querySelector('.floating-button');
    if (window.innerWidth <= 768) {
        floatingButton.style.display = 'block';
        document.querySelector('.menu-icon').style.display = 'none'; // Hide the menu icon
    } else {
        floatingButton.style.display = 'none';
        document.querySelector('.menu-icon').style.display = 'block'; // Show the menu icon
    }
}

window.addEventListener('resize', checkScreenSize);
document.addEventListener('DOMContentLoaded', checkScreenSize);

function toggleDocumentsModal() {
    const modal = document.getElementById('documentsModal');
    modal.classList.toggle('open');
}

function toggleIncomingDocuments() {
    // Implement the logic to show incoming documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleOutgoingDocuments() {
    // Implement the logic to show outgoing documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleOnProcessDocuments() {
    // Implement the logic to show on process documents
    toggleDocumentsModal(); // Close the document modal
}

function toggleAllDocuments() {
    // Implement the logic to show all documents
    toggleDocumentsModal(); // Close the document modal
}

document.querySelectorAll('#documentsModal button').forEach(button => {
    button.addEventListener('click', toggleDocumentsModal);
});

let currentPage = 1;
const rowsPerPage = 10;

function updatePagination() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const firstButton = document.getElementById('firstButton');
    const lastButton = document.getElementById('lastButton');
    const pageNumbers = document.getElementById('pageNumbers');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    firstButton.disabled = currentPage === 1;
    lastButton.disabled = currentPage === totalPages;

    pageNumbers.innerHTML = '';
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, endPage - 4);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageNumber = document.createElement('button');
        pageNumber.textContent = i;
        pageNumber.classList.add('page-number');
        if (i === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageNumber);
    }

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
    const rows = document.querySelectorAll('#documentTable tbody tr');
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

function firstPage() {
    currentPage = 1;
    updatePagination();
}

function lastPage() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    currentPage = totalPages;
    updatePagination();
}

document.addEventListener('DOMContentLoaded', () => {
    updatePagination();
});
