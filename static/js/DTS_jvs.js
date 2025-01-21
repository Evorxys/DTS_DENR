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
        case 'receiving_office':
            return 6;  // Changed variable name
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
    fetch('https://timeapi.io/api/Time/current/zone?timeZone=Asia/Manila')
        .then(response => response.json())
        .then(data => {
            const now = new Date(data.dateTime);
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
        })
        .catch(error => console.error('Error fetching time:', error));
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
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(7)').textContent.trim();
        const category = row.querySelector('td:nth-child(8)').textContent.trim();
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Simple' && timeDiff > 1) { // 3 days
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 1) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
    }
}

function checkTechnicalDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(7)').textContent.trim();
        const category = row.querySelector('td:nth-child(8)').textContent.trim();
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Technical' && timeDiff > 4) { // 7 days
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 4) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
    }
}

function checkHighlyTechnicalDocumentTimers() {
    const rows = document.querySelectorAll('#documentTable tbody tr');
    const expiredDocuments = [];
    rows.forEach(row => {
        const status = row.querySelector('td:nth-child(7)').textContent.trim();
        const category = row.querySelector('td:nth-child(8)').textContent.trim();
        const dateReleasedText = row.querySelector('td:nth-child(5)').textContent.trim();
        const dateReleased = new Date(Date.parse(dateReleasedText));
        const now = new Date();
        const timeDiff = (now - dateReleased) / 1000 / 60 / 60 / 24; // Time difference in days

        if ((status === 'Pending' || status === 'Processing') && category === 'Highly Technical' && timeDiff > 24) { // 30 days
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            expiredDocuments.push({ trackingNo, daysOverdue: Math.floor(timeDiff - 24) });
        }
    });

    if (expiredDocuments.length > 0) {
        showExpiredAlertModal(expiredDocuments);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('fade-in');
    const notificationsModal = document.getElementById('notificationsModal');
    notificationsModal.classList.remove('open');

    const currentPage = window.location.pathname;
    if (currentPage.includes('incoming_documents')) {
        checkSimpleDocumentTimers();
        checkTechnicalDocumentTimers();
        checkHighlyTechnicalDocumentTimers();
        setInterval(() => {
            checkSimpleDocumentTimers();
            checkTechnicalDocumentTimers();
            checkHighlyTechnicalDocumentTimers();
        }, 300000); // Refresh every 300 seconds / 5 minutes
    }
});

function toggleNewDocumentModal() {
    const modal = document.getElementById('newDocumentModal');
    modal.classList.toggle('open');
    modal.classList.add('animate');
    setTimeout(() => modal.classList.remove('animate'), 500);

    if (modal.classList.contains('open')) {
        generateTrackingNo();
    }
}

function generateTrackingNo() {
    const currentYear = new Date().getFullYear();
    const lastId = Math.floor(Math.random() * 100000); // Simulate last ID for demonstration
    const trackingNo = `TN-${currentYear}-${lastId + 1}`;
    document.getElementById('generatedTrackingNo').textContent = trackingNo;
}

function toggleSuccessDialog() {
    const dialog = document.getElementById('successDialog');
    dialog.classList.toggle('open');
    dialog.classList.add('animate');
    setTimeout(() => dialog.classList.remove('animate'), 500);
}

document.getElementById('newDocumentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true; // Disable the button
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
            alert('Failed to add document. Please try again.');
            submitButton.disabled = false; // Re-enable the button if there's an error
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add document. Please try again.');
        submitButton.disabled = false; // Re-enable the button if there's an error
    });
});

function showExpiredAlertModal(expiredDocuments) {
    const overlay = document.getElementById('expiredAlertOverlay');
    const notification = document.getElementById('expiredAlertModal');
    const notificationContent = document.querySelector('.notification-content');
    overlay.classList.add('show');
    notification.classList.add('show');

    let overdueMessage = '';
    expiredDocuments.forEach(doc => {
        overdueMessage += `<p>Tracking No: <span class="overdue-message">${doc.trackingNo}</span> - Overdue by ${doc.daysOverdue} day(s)</p>`;
    });

    notificationContent.innerHTML = `
        <p>You have Documents that need your attention!</p>
        <div class="scrollable-content">
            ${overdueMessage}
        </div>
        <button id="viewExpiredDocumentsButton" onclick="viewExpiredDocuments()">View Documents</button>
    `;
}

function viewExpiredDocuments() {
    const overlay = document.getElementById('expiredAlertOverlay');
    const notification = document.getElementById('expiredAlertModal');
    overlay.classList.remove('show');
    notification.classList.remove('show');

    const expiredTrackingNos = Array.from(document.querySelectorAll('.overdue-message')).map(el => el.textContent.trim());
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
        if (expiredTrackingNos.includes(trackingNo)) {
            row.style.backgroundColor = 'red';
        }
    });
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
                <p><strong>Receiving Office:</strong> ${data.receiving_office}</p> <!-- Changed variable name -->
                <p><strong>Receiving Section:</strong> ${data.receiving_section}</p> <!-- New field -->
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Document Category:</strong> ${data.document_category}</p>
                <button onclick="viewAttachment('${data.tracking_no}')">View Attachment</button>
            `;
            toggleViewDocumentModal(true);
            const notification = document.getElementById('expiredAlertModal');
            const overlay = document.getElementById('expiredAlertOverlay');
            notification.classList.remove('show');
            overlay.classList.remove('show');

            // Show or hide the "Send To" and "Mark as Processed" buttons based on the page and user section
            const currentPage = window.location.pathname;
            const sendToButton = document.querySelector('.send-to-button');
            const markProcessedButton = document.querySelector('.mark-processed-button');
            const userSection = document.querySelector('.username').textContent.split(' ')[0];

            if (currentPage.includes('incoming_documents') || currentPage.includes('on_process_documents')) {
                sendToButton.style.display = 'inline-block';
                if (userSection === 'RECORDS') {
                    markProcessedButton.style.display = 'inline-block';
                } else {
                    markProcessedButton.style.display = 'none';
                }
            } else {
                sendToButton.style.display = 'none';
                markProcessedButton.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function toggleViewDocumentModal(open) {
    const modal = document.getElementById('viewDocumentModal');
    if (open) {
        modal.classList.add('open');
    } else {
        modal.classList.remove('open');
    }
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
    const menuIcon = document.querySelector('.menu-icon');
    if (window.innerWidth <= 768) {
        if (floatingButton) {
            floatingButton.style.display = 'block';
        }
        if (menuIcon) {
            menuIcon.style.display = 'none'; // Hide the menu icon
        }
    } else {
        if (floatingButton) {
            floatingButton.style.display = 'none';
        }
        if (menuIcon) {
            menuIcon.style.display = 'block'; // Show the menu icon
        }
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

function toggleHelp() {
    const helpModal = document.getElementById('helpModal');
    helpModal.classList.toggle('open');
}

function selectRow(row) {
    const selectedRow = document.querySelector('.selected-row');
    if (selectedRow) {
        selectedRow.classList.remove('selected-row');
    }
    row.classList.add('selected-row');
}

function printSelectedDocument() {
    const selectedRow = document.querySelector('.selected-row');
    if (!selectedRow) {
        alert('Please select a document to print.');
        return;
    }

    const trackingNo = selectedRow.querySelector('td:nth-child(1)').textContent.trim();
    const documentType = selectedRow.querySelector('td:nth-child(2)').textContent.trim();
    const documentProperties = selectedRow.querySelector('td:nth-child(3)').textContent.trim();
    const subject = selectedRow.querySelector('td:nth-child(4)').textContent.trim();
    const dateReleased = selectedRow.querySelector('td:nth-child(5)').textContent.trim();
    const receivingOffice = selectedRow.querySelector('td:nth-child(6)').textContent.trim();
    const status = selectedRow.querySelector('td:nth-child(7)').textContent.trim();
    const documentCategory = selectedRow.querySelector('td:nth-child(8)').textContent.trim();

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print Document</title><style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; margin-top: 20px; }');
    printWindow.document.write('th, td { border: 1px solid #000; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('</style></head><body>');
    printWindow.document.write('<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">');
    printWindow.document.write('<img src="/uploads/denr_logo.png" alt="DENR Logo" style="height: 100px;">');
    printWindow.document.write('<div style="text-align: center; flex-grow: 1;">');
    printWindow.document.write('<p>Republic of the Philippines</p>');
    printWindow.document.write('<p><strong>DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</strong></p>');
    printWindow.document.write('<p>' + receivingOffice + ' OFFICE</p>');
    printWindow.document.write('</div>');
    printWindow.document.write('<img src="/uploads/newph_logo.png" alt="NewPH Logo" style="height: 100px;">');
    printWindow.document.write('</div>');
    printWindow.document.write('<h2>Document Details</h2>');
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>Tracking No</th><td>' + trackingNo + '</td></tr>');
    printWindow.document.write('<tr><th>Document Type</th><td>' + documentType + '</td></tr>');
    printWindow.document.write('<tr><th>Document Properties</th><td>' + documentProperties + '</td></tr>');
    printWindow.document.write('<tr><th>Subject</th><td>' + subject + '</td></tr>');
    printWindow.document.write('<tr><th>Date Released</th><td>' + dateReleased + '</td></tr>');
    printWindow.document.write('<tr><th>Receiving Office</th><td>' + receivingOffice + '</td></tr>');
    printWindow.document.write('<tr><th>Status</th><td>' + status + '</td></tr>');
    printWindow.document.write('<tr><th>Document Category</th><td>' + documentCategory + '</td></tr>');
    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Wait for the document to load before showing the print dialog
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
        }, 500); // 500ms delay
    };
}

function toggleProfileModal() {
    const profileModal = document.getElementById('profileModal');
    profileModal.classList.toggle('open');
}

function logout() {
    window.location.href = "{{ url_for('index') }}";
}

function manageProfile() {
    alert('Manage Profile functionality is not implemented yet.');
}

function toggleDocumentsModal() {
    const modal = document.getElementById('documentsModal');
    modal.classList.toggle('open');
}

function toggleIncomingDocuments() {
    // Implement the logic to show incoming documents
}

function toggleOutgoingDocuments() {
    // Implement the logic to show outgoing documents
}

function toggleOnProcessDocuments() {
    // Implement the logic to show on process documents
}

function toggleAllDocuments() {
    // Implement the logic to show all documents
}

function updateDocumentCategory() {
    const documentType = document.getElementById('documentType').value;
    const documentCategory = document.getElementById('documentCategory');
    documentCategory.innerHTML = ''; // Clear existing options

    fetch(`/get_document_categories?document_type=${documentType}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.Level_of_Priority;
                option.textContent = category.Level_of_Priority;
                documentCategory.appendChild(option);
            });
            documentCategory.disabled = false; // Enable the select element
        })
        .catch(error => console.error('Error:', error));
}

function updateReceivingSections() {
    const receivingOffice = document.getElementById('sendToReceivingOffice').value;
    const receivingSection = document.getElementById('sendToReceivingSection');
    receivingSection.innerHTML = ''; // Clear existing options

    fetch(`/get_receiving_sections?office=${receivingOffice}`)
        .then(response => response.json())
        .then(data => {
            data.forEach(section => {
                const option = document.createElement('option');
                option.value = section.section_designation;
                option.textContent = section.section_designation;
                receivingSection.appendChild(option);
            });
            receivingSection.disabled = false; // Enable the select element
        })
        .catch(error => console.error('Error:', error));
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
                <p><strong>Receiving Office:</strong> ${data.receiving_office}</p>
                <p><strong>Receiving Section:</strong> ${data.receiving_section}</p>
                <p><strong>Status:</strong> ${data.status}</p>
                <p><strong>Document Category:</strong> ${data.document_category}</p>
                <button onclick="viewAttachment('${data.tracking_no}')">View Attachment</button>
            `;
            toggleViewDocumentModal(true);
            const notification = document.getElementById('expiredAlertModal');
            const overlay = document.getElementById('expiredAlertOverlay');
            notification.classList.remove('show');
            overlay.classList.remove('show');

            // Show or hide the "Send To" and "Mark as Processed" buttons based on the page and user section
            const currentPage = window.location.pathname;
            const sendToButton = document.querySelector('.send-to-button');
            const markProcessedButton = document.querySelector('.mark-processed-button');
            const userSection = document.querySelector('.username').textContent.split(' ')[0];

            if (currentPage.includes('incoming_documents') || currentPage.includes('on_process_documents')) {
                sendToButton.style.display = 'inline-block';
                if (userSection === 'RECORDS') {
                    markProcessedButton.style.display = 'inline-block';
                } else {
                    markProcessedButton.style.display = 'none';
                }
            } else {
                sendToButton.style.display = 'none';
                markProcessedButton.style.display = 'none';
            }
        })
        .catch(error => console.error('Error:', error));
}

function toggleViewDocumentModal(open) {
    const modal = document.getElementById('viewDocumentModal');
    if (open) {
        modal.classList.add('open');
    } else {
        modal.classList.remove('open');
    }
}

function uploadDocument() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt'; // Acceptable file types
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            fetch('/upload_document', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Document uploaded successfully');
                } else {
                    alert('Failed to upload document');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    };
    fileInput.click();
}

function handleFileUpload() {
    // Remove the file upload functionality
}

function sendTo() {
    const trackingNo = document.querySelector('#documentDetails p:nth-child(2) strong').nextSibling.textContent.trim();
    const sendToModal = document.getElementById('sendToModal');
    const trackingNoField = document.getElementById('sendToTrackingNo');
    trackingNoField.textContent = trackingNo;
    sendToModal.classList.add('open');
}

function closeSendToModal() {
    const sendToModal = document.getElementById('sendToModal');
    sendToModal.classList.remove('open');
}

function updateReceivingOfficeAndSection() {
    const trackingNo = document.getElementById('sendToTrackingNo').textContent.trim();
    const receivingOffice = document.getElementById('sendToReceivingOffice').value;
    const receivingSection = document.getElementById('sendToReceivingSection').value;

    fetch(`/update_receiving_office_and_section`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tracking_no: trackingNo, receiving_office: receivingOffice, receiving_section: receivingSection })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Document updated successfully');
            closeSendToModal();
        } else {
            alert('Failed to update document');
        }
    })
    .catch(error => console.error('Error:', error));
}

function markAsProcessed() {
    const trackingNo = document.querySelector('#documentDetails p:nth-child(2) strong').nextSibling.textContent.trim();
    updateDocumentStatus(trackingNo, 'Processed');
    alert(`Document with Tracking No: ${trackingNo} marked as processed.`);
    toggleViewDocumentModal();
}

function viewAttachment(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const documentViewer = document.getElementById('documentViewer');
            const fileExtension = '.pdf'; // Adjust the file extension as needed
            const formattedOffice = data.sender_office.replace(/\s+/g, '_');
            const formattedSection = data.sender_section.replace(/\s+/g, '_');
            const filename = `${trackingNo}_${formattedOffice}_${formattedSection}${fileExtension}`;
            documentViewer.src = `http://localhost:5000/file_server/${filename}`;
            documentViewer.style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    // Highlight the expired document if the highlight parameter is present in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const highlightTrackingNo = urlParams.get('highlight');
    if (highlightTrackingNo) {
        const rows = document.querySelectorAll('#documentTable tbody tr');
        rows.forEach(row => {
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            if (trackingNo === highlightTrackingNo) {
                row.style.backgroundColor = 'red';
            }
        });
    }

    // Add event listeners for double-click on rows
    const rows = document.querySelectorAll('#documentTable tbody tr');
    rows.forEach(row => {
        row.addEventListener('dblclick', (event) => {
            const trackingNo = row.querySelector('td:nth-child(1)').textContent.trim();
            viewDocument(trackingNo);
            event.stopPropagation(); // Prevent triggering other click events
        });
    });

    // ...existing code...
});
