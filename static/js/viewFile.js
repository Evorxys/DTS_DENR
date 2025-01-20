document.addEventListener('DOMContentLoaded', function() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'block';

    const url = window.location.href;
    new QRCode(document.getElementById("qrcode"), {
        text: url,
        width: 128,
        height: 128
    });

    documentViewer.onerror = function() {
        handleIframeError();
    };
});

function copyLink() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard');
    }).catch(err => {
        console.error('Error copying link: ', err);
    });
}

function shareQRCode() {
    const qrCodeElement = document.getElementById('qrcode').querySelector('img');
    if (qrCodeElement) {
        const qrCodeUrl = qrCodeElement.src;
        const shareData = {
            title: 'QR Code',
            text: 'Scan this QR code to view the document.',
            files: [new File([qrCodeUrl], 'qrcode.png', { type: 'image/png' })]
        };

        if (navigator.canShare && navigator.canShare(shareData)) {
            navigator.share(shareData).then(() => {
                console.log('QR Code shared successfully');
            }).catch(err => {
                console.error('Error sharing QR Code: ', err);
            });
        } else {
            alert('Sharing not supported in this browser.');
        }
    } else {
        alert('QR Code not found');
    }
}

function reloadDocument() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.src = documentViewer.src;
    documentViewer.style.display = 'block';
    document.getElementById('reloadButton').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';
}

function handleIframeError() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'none';
    document.getElementById('reloadButton').style.display = 'block';
    document.getElementById('errorMessage').style.display = 'block';
}

function viewAttachment(trackingNo) {
    fetch(`/document_details?tracking_no=${trackingNo}`)
        .then(response => response.json())
        .then(data => {
            const fileExtension = '.pdf'; // Adjust the file extension as needed
            const formattedOffice = data.sender_office.replace(/\s+/g, '_');
            const formattedSection = data.sender_section.replace(/\s+/g, '_');
            const filename = `${trackingNo}_${formattedOffice}_${formattedSection}${fileExtension}`;
            const fileUrl = `http://localhost:5000/file_server/${filename}`;
            window.open(fileUrl, '_blank');
        })
        .catch(error => console.error('Error:', error));
}

function closeDocumentViewer() {
    const documentViewer = document.getElementById('documentViewer');
    documentViewer.style.display = 'none';
    documentViewer.style.position = 'static';
    documentViewer.style.width = '100%';
    documentViewer.style.height = '600px';
    documentViewer.style.zIndex = 'auto';
    document.getElementById('closeViewerButton').style.display = 'none';
}
