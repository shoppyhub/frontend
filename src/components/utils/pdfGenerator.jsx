import jsPDF from 'jspdf';

export const generateCertificate = (shop) => {
    const doc = new jsPDF('landscape');
    doc.rect(10, 10, 277, 190);
    doc.setFontSize(40);
    doc.text("RKD_MART", 110, 40);
    doc.setFontSize(20);
    doc.text("REGISTRATION CERTIFICATE", 95, 60);
    doc.setFontSize(14);
    doc.text(`Shop Name: ${shop.shopDetails.shopName}`, 40, 100);
    doc.text(`Shop ID: ${shop.shopDetails.shopId}`, 40, 115);
    doc.save(`${shop.shopDetails.shopId}_Certificate.pdf`);
};

export const generateStaffID = (staff, shopName, shopId) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [54, 86] });
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 54, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("STAFF ID", 15, 10);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Name: ${staff.fullName}`, 5, 25);
    doc.text(`Shop: ${shopName}`, 5, 32);
    doc.text(`ID: ${shopId}`, 5, 39);
    doc.save(`${staff.fullName}_ID.pdf`);
};