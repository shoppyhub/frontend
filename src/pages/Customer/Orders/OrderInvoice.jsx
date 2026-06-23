import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoice = (order, settings) => {
    const doc = new jsPDF();
    const siteName = settings.siteName || "RKD MART";
    const themeColor = settings.themeColor || "#0f172a";

    // RGB for Header
    const r = parseInt(themeColor.slice(1, 3), 16);
    const g = parseInt(themeColor.slice(3, 5), 16);
    const b = parseInt(themeColor.slice(5, 7), 16);
    
    // --- Header & Global Branding ---
    doc.setFillColor(r, g, b); 
    doc.rect(0, 0, 210, 50, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(siteName.toUpperCase(), 105, 25, { align: "center" });
    doc.setFontSize(10);
    doc.text("Hyperlocal Digital Infrastructure - Transaction Receipt", 105, 35, { align: "center" });
    
    // --- Billing Infrastructure ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text(`DELIVERY ADDRESS:`, 20, 65);
    doc.setFont(undefined, 'normal');
    doc.text(`${order.customerDetails?.name}`, 20, 72);
    doc.text(`${order.customerDetails?.address}`, 20, 78);
    doc.text(`PIN: ${order.customerDetails?.pincode} | Mobile: +91 ${order.customerDetails?.mobile}`, 20, 84);

    doc.setFont(undefined, 'bold');
    doc.text(`ORDER ARCHIVE:`, 140, 65);
    doc.setFont(undefined, 'normal');
    doc.text(`ID: ORD-${order._id.toUpperCase().slice(-8)}`, 140, 72);
    doc.text(`TS: ${new Date(order.createdAt).toLocaleString()}`, 140, 78);
    doc.text(`Hub: ${order.shopId?.shopDetails?.shopName}`, 140, 84);

    // --- Dynamic Items Registry ---
    const tableRows = order.items.map(item => [
        item.name, 
        `Rs. ${item.price.toLocaleString()}`, 
        item.quantity, 
        `Rs. ${(item.price * item.quantity).toLocaleString()}`
    ]);

    doc.autoTable({
        startY: 95,
        head: [["Asset Description", "Unit Cost", "Qty", "Subtotal"]],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [r, g, b], fontSize: 10 },
        styles: { fontSize: 9 }
    });

    // --- Final Settlement Summary ---
    const finalY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`Grand Total: Rs. ${order.totalAmount.toLocaleString('en-IN')}`, 130, finalY + 20);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`System Verified by ${siteName} Infrastructure. Computer generated document.`, 105, 285, { align: "center" });

    doc.save(`${siteName}_Invoice_${order._id.slice(-6)}.pdf`);
};