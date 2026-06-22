const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

async function generateInvoice(order, packageDetails) {
  return new Promise((resolve, reject) => {
    try {
      // 0 margin allows us to draw edge-to-edge elements (like the header/footer)
      const doc = new PDFDocument({ margin: 0, size: 'A4' });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const colors = {
        primary: '#7C3AED',
        secondary: '#A855F7',
        success: '#22C55E',
        dark: '#111827',
        lightBg: '#F8FAFC',
        text: '#1F2937',
        muted: '#6B7280',
        white: '#FFFFFF',
        border: '#E2E8F0'
      };

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      let currentY = 0;

      // Helper to prevent content overlap and handle pagination
      function checkPageBreak(heightNeeded) {
        if (currentY + heightNeeded > pageHeight - 60) {
          doc.addPage();
          currentY = 40; // Top margin for new pages
        }
      }

      // --- 1. Header Section ---
      doc.rect(0, 0, pageWidth, 120).fill(colors.primary);
      
      const logoPath = path.join(__dirname, '../../frontend/src/assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 60 });
      }

      doc.font('Helvetica-Bold').fontSize(24).fillColor(colors.white)
         .text('VEXNETWORK STORE', 120, 40);
      doc.font('Helvetica').fontSize(12).fillColor('rgba(255,255,255,0.8)')
         .text('PREMIUM PURCHASE RECEIPT', 120, 70);

      // Top-right success badge
      doc.roundedRect(pageWidth - 200, 45, 160, 30, 15).fill(colors.success);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.white)
         .text('✓ PAYMENT SUCCESSFUL', pageWidth - 190, 56, { width: 140, align: 'center' });

      currentY = 150;

      // --- 2. Invoice Meta Details ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(`Invoice Number:`, 40, currentY)
         .font('Helvetica').fillColor(colors.muted)
         .text(` INV-${order.orderId.substring(0,8).toUpperCase()}`, 145, currentY);
      
      currentY += 25;
      doc.font('Helvetica-Bold').fillColor(colors.dark)
         .text(`Order ID:`, 40, currentY)
         .font('Helvetica').fillColor(colors.muted)
         .text(` ${order.orderId}`, 100, currentY);
         
      currentY += 25;
      doc.font('Helvetica-Bold').fillColor(colors.dark)
         .text(`Date:`, 40, currentY)
         .font('Helvetica').fillColor(colors.muted)
         .text(` ${new Date(order.createdAt).toLocaleDateString()}`, 80, currentY);

      currentY += 40;

      // --- 3. Customer Section ---
      checkPageBreak(120);
      doc.roundedRect(40, currentY, pageWidth - 80, 100, 10).fill(colors.lightBg);
      doc.roundedRect(40, currentY, pageWidth - 80, 100, 10).lineWidth(1).stroke(colors.border);
      
      doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary)
         .text('Customer Details', 60, currentY + 20);
         
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('NAME', 60, currentY + 50);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(order.realName || order.username, 60, currentY + 65);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('MINECRAFT IGN', 240, currentY + 50);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(order.username, 240, currentY + 65);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('EMAIL ADDRESS', 400, currentY + 50);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(order.email || 'N/A', 400, currentY + 65, { width: 140, ellipsis: true });

      currentY += 140;

      // --- 4. Order Items ---
      checkPageBreak(60);
      doc.font('Helvetica-Bold').fontSize(16).fillColor(colors.dark)
         .text('Purchased Items', 40, currentY);
      currentY += 30;

      const items = (order.isCartCheckout && packageDetails.length > 0) 
        ? packageDetails 
        : (packageDetails.length > 0 ? [packageDetails[0]] : [{ name: 'Store Credit / Free Package', price: 0 }]);

      items.forEach((item, index) => {
        checkPageBreak(80);
        const cardBg = index % 2 === 0 ? colors.white : colors.lightBg;
        
        doc.roundedRect(40, currentY, pageWidth - 80, 60, 8).fill(cardBg);
        doc.roundedRect(40, currentY, pageWidth - 80, 60, 8).lineWidth(1).stroke(colors.border);

        doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.dark)
           .text(item.name, 60, currentY + 22);

        doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary)
           .text(`INR ${item.price || 0}`, pageWidth - 160, currentY + 22, { width: 100, align: 'right' });

        currentY += 75;
      });

      currentY += 20;

      // --- 5. Summary Section & Payment Section ---
      checkPageBreak(180);
      const summaryY = currentY;

      // Payment Section (Left side)
      doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.dark)
         .text('Payment Information', 40, summaryY);
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('METHOD', 40, summaryY + 30);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(order.amount === 0 ? 'Store Credit / Free' : 'Razorpay Gateway', 40, summaryY + 45);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('TRANSACTION ID', 40, summaryY + 70);
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text(order.paymentId || 'N/A', 40, summaryY + 85);

      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('STATUS', 40, summaryY + 110);
      doc.roundedRect(40, summaryY + 125, 80, 25, 5).fill(colors.success);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.white)
         .text('PAID', 40, summaryY + 133, { width: 80, align: 'center' });

      // Summary Card (Right side)
      doc.roundedRect(pageWidth - 300, summaryY, 260, 160, 10).fill(colors.dark);
      
      let innerSummaryY = summaryY + 20;
      const amount = order.amount || 0;

      doc.font('Helvetica').fontSize(12).fillColor(colors.muted)
         .text('Subtotal', pageWidth - 280, innerSummaryY);
      doc.font('Helvetica-Bold').fillColor(colors.white)
         .text(`INR ${amount}`, pageWidth - 160, innerSummaryY, { width: 100, align: 'right' });
         
      innerSummaryY += 25;
      doc.font('Helvetica').fontSize(12).fillColor(colors.muted)
         .text('GST (18%)', pageWidth - 280, innerSummaryY);
      doc.font('Helvetica-Bold').fillColor(colors.white)
         .text('Included', pageWidth - 160, innerSummaryY, { width: 100, align: 'right' });

      if (order.couponUsed || order.giftCardUsed) {
        innerSummaryY += 25;
        doc.font('Helvetica').fontSize(12).fillColor(colors.success)
           .text('Discount Applied', pageWidth - 280, innerSummaryY);
        doc.font('Helvetica-Bold').fillColor(colors.success)
           .text('YES', pageWidth - 160, innerSummaryY, { width: 100, align: 'right' });
      }

      innerSummaryY += 25;
      doc.moveTo(pageWidth - 280, innerSummaryY).lineTo(pageWidth - 60, innerSummaryY).lineWidth(1).stroke(colors.muted);
      
      innerSummaryY += 15;
      doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.white)
         .text('Final Total', pageWidth - 280, innerSummaryY + 5);
      doc.font('Helvetica-Bold').fontSize(20).fillColor(colors.secondary)
         .text(`INR ${amount}`, pageWidth - 180, innerSummaryY, { width: 120, align: 'right' });

      currentY = summaryY + 180;

      // --- 6. Store Branding Section ---
      checkPageBreak(60);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(colors.primary)
         .text('Thank you for supporting VexNetwork 💜', 0, currentY, { align: 'center' });
      
      doc.font('Helvetica-Bold').fontSize(12).fillColor(colors.dark)
         .text('store.vexnetwork.fun', 0, currentY + 25, { align: 'center', link: 'https://store.vexnetwork.fun' })
         .text('discord.gg/vexnetwork', 0, currentY + 45, { align: 'center', link: 'https://discord.gg/d6q9ZvC55b' });

      // --- 7. Footer ---
      // We manually place the footer at the very bottom of the page
      doc.rect(0, pageHeight - 50, pageWidth, 50).fill(colors.dark);
      doc.font('Helvetica-Bold').fontSize(10).fillColor(colors.muted)
         .text('Generated automatically by VexNetwork Store', 40, pageHeight - 30)
         .text('Instant rank delivery powered by VexNetwork', 40, pageHeight - 30, { align: 'right', width: pageWidth - 80 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generateInvoice;
