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

document.addEventListener('DOMContentLoaded', function() {
    // Add any JavaScript functionality if needed
});
