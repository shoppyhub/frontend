// वेबसाइट का नाम और लोगो (इसे अपनी ज़रूरत अनुसार बदलें)
const SITE_NAME = "RKD_MART";
const LOGO_URL = "https://via.placeholder.com/100?text=RKD_MART"; // अपना असली लोगो लिंक डालें

export const printDocument = (type, data, adminAssets = {}) => {
    const win = window.open("", "_blank");
    
    // सिग्नेचर और मुहर (System Admin द्वारा अपलोडेड)
    const signature = adminAssets.signature || "";
    const stamp = adminAssets.stamp || "";

    let content = "";

    // --- 1. शॉप ओनर सर्टिफिकेट (A4 Landscape) ---
    if (type === 'shop-certificate') {
        content = `
            <div style="width:1000px; height:700px; padding:50px; border:20px double #1a1a2e; text-align:center; position:relative; background:#fff; color:#1a1a2e; font-family:serif;">
                <img src="${LOGO_URL}" width="80" />
                <h1 style="font-size:55px; margin:10px 0;">${SITE_NAME}</h1>
                <p style="letter-spacing:10px; font-weight:bold;">MERCHANT NETWORK</p>
                <hr style="width:60%; border:1px solid #1a1a2e;"/>
                <h2 style="text-decoration:underline; margin-top:30px;">BUSINESS REGISTRATION CERTIFICATE</h2>
                <p style="font-size:20px; margin:30px 0;">This is to certify that the business establishment</p>
                <h1 style="color:#c0392b; font-size:45px; margin:0;">${data.shopDetails.shopName}</h1>
                <p style="font-size:20px;">Owned by: <b>${data.fullName}</b></p>
                <p style="font-size:18px;">Address: ${data.shopDetails.fullAddress}, ${data.shopDetails.district}, ${data.shopDetails.state}</p>
                
                <div style="margin-top:60px; display:flex; justify-content:space-around; align-items:flex-end;">
                    <div style="text-align:center;">
                        <p>ID: <b>${data.generatedId || data.shopDetails.shopId}</b></p>
                        <p>Date: ${new Date(data.shopDetails.approvedAt).toLocaleDateString()}</p>
                    </div>
                    <div style="text-align:center; position:relative;">
                        ${stamp ? `<img src="${stamp}" style="position:absolute; width:100px; left:50%; transform:translateX(-50%); bottom:30px; opacity:0.8;"/>` : ""}
                        ${signature ? `<img src="${signature}" style="width:120px; border-bottom:1px solid #000;"/><br/>` : "____________________"}
                        <p>Authorized Signatory</p>
                    </div>
                </div>
                <p style="position:absolute; bottom:20px; width:100%; font-size:12px; color:gray;">This is an electronically generated certificate by ${SITE_NAME}.</p>
            </div>`;
    }

    // --- 2. स्टाफ / शॉप ओनर आईडी कार्ड (CR80 Standard Size) ---
    if (type === 'id-card') {
        const role = data.role === 'ShopOwner' ? 'Owner' : 'Staff';
        content = `
            <div style="width:350px; height:500px; border:2px solid #1a1a2e; border-radius:15px; overflow:hidden; font-family:sans-serif; background:#f4f7f6; position:relative;">
                <div style="background:#1a1a2e; color:#fff; padding:15px; text-align:center;">
                    <h3 style="margin:0;">${SITE_NAME}</h3>
                    <small>${role} Identity Card</small>
                </div>
                <div style="text-align:center; padding:20px;">
                    <img src="${data.photo || 'https://via.placeholder.com/120'}" style="width:120px; height:120px; border-radius:10px; border:3px solid #3498db; object-fit:cover;"/>
                    <h2 style="margin:10px 0 5px 0; color:#1a1a2e;">${data.fullName}</h2>
                    <p style="margin:0; color:#3498db; font-weight:bold; font-size:14px;">${data.staffDetails?.roleInShop || 'Merchant Owner'}</p>
                </div>
                <div style="padding:0 20px; font-size:12px; line-height:1.6;">
                    <p><b>User ID:</b> ${data.generatedId || "PENDING"}</p>
                    <p><b>Mobile:</b> ${data.mobile}</p>
                    <p><b>Shop:</b> ${data.shopDetails?.shopName || 'N/A'}</p>
                    <p><b>Location:</b> ${data.shopDetails?.district || data.pDistrict}, ${data.shopDetails?.state || data.pState}</p>
                </div>
                <div style="position:absolute; bottom:0; width:100%; background:#3498db; color:#fff; text-align:center; padding:5px 0; font-size:11px;">
                    Valid Official Document of ${SITE_NAME}
                </div>
            </div>`;
    }

    // --- 3. जिला एडमिन सर्टिफिकेट ---
    if (type === 'dist-admin-cert') {
        content = `
            <div style="width:1000px; height:700px; padding:50px; border:20px double #2c3e50; text-align:center; position:relative; background:#fff; color:#2c3e50; font-family:serif;">
                <h1 style="font-size:55px; margin:0;">${SITE_NAME}</h1>
                <h3>District Administration Appointment</h3>
                <hr style="width:50%;"/>
                <p style="font-size:22px; margin:40px 0;">This is to certify that <b>${data.fullName}</b>, S/O <b>${data.fatherName}</b><br/>is appointed as the District Administrator for</p>
                <h1 style="color:#2980b9; font-size:50px;">${data.officeAddress.district} District</h1>
                <p>Authorized to manage and verify merchants under the ${SITE_NAME} Network.</p>
                <div style="margin-top:100px; display:flex; justify-content:space-around; align-items:center;">
                    <p>ID: <b>${data.generatedId}</b></p>
                    <div style="text-align:center;">
                        ${signature ? `<img src="${signature}" width="150" />` : "____________________"}
                        <p>Authorized Seal & Sign</p>
                    </div>
                </div>
            </div>`;
    }

    win.document.write(`
        <html>
            <head><title>Print ${type}</title></head>
            <body style="display:flex; justify-content:center; align-items:center; height:100vh; margin:0;">
                ${content}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
};