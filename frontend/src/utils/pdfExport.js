import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportTransactionsPDF = (transactions, user, wallet) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const currency = localStorage.getItem('currency') || 'NPR';

    // ===== HEADER WITH GRADIENT EFFECT =====
    doc.setFillColor(14, 165, 165);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Logo Box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, 10, 20, 20, 3, 3, 'F');
    doc.setTextColor(14, 165, 165);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('S', 20, 24);

    // App Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('SajiloSplit', 40, 20);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Transaction Statement', 40, 27);

    // Date
    doc.setFontSize(9);
    doc.text(
      `Generated: ${new Date().toLocaleString('en-US')}`,
      pageWidth - 14,
      20,
      { align: 'right' }
    );

    // ===== ACCOUNT INFO SECTION =====
    doc.setTextColor(26, 46, 74);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Information', 14, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);

    const infoStartY = 63;
    doc.text(`Account Holder: ${user?.name || 'N/A'}`, 14, infoStartY);
    doc.text(`Email: ${user?.email || 'N/A'}`, 14, infoStartY + 6);
    doc.text(`Phone: ${user?.phone || 'N/A'}`, 14, infoStartY + 12);

    // Balance Box
    doc.setFillColor(248, 246, 240);
    doc.roundedRect(pageWidth - 90, 50, 76, 32, 3, 3, 'F');
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('TOTAL BALANCE', pageWidth - 82, 58);
    
    doc.setTextColor(14, 165, 165);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `${currency} ${Number(wallet?.balance || 0).toLocaleString('en-IN')}`,
      pageWidth - 82,
      70
    );

    // ===== TRANSACTIONS TABLE =====
    doc.setTextColor(26, 46, 74);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', 14, 95);

    if (transactions && transactions.length > 0) {
      const tableData = transactions.map((t) => {
        const isSender = t.sender?._id === user?.id || t.sender === user?.id;
        const isReceiver = t.receiver?._id === user?.id || t.receiver === user?.id;
        
        let counterpart = 'N/A';
        if (isSender && t.receiver) {
          counterpart = `To: ${t.receiver.name || t.receiver.email || 'Unknown'}`;
        } else if (isReceiver && t.sender) {
          counterpart = `From: ${t.sender.name || t.sender.email || 'Unknown'}`;
        }

        const amountDisplay = isSender
          ? `- ${currency} ${Number(t.amount).toLocaleString('en-IN')}`
          : `+ ${currency} ${Number(t.amount).toLocaleString('en-IN')}`;

        return [
          new Date(t.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          t.transactionId?.slice(-10) || 'N/A',
          t.purpose || t.type || 'Transaction',
          counterpart,
          amountDisplay,
          t.status || 'completed',
        ];
      });

      autoTable(doc, {
        startY: 100,
        head: [['Date', 'TXN ID', 'Description', 'Counterparty', 'Amount', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [14, 165, 165],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: {
          fillColor: [248, 246, 240],
        },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 25, font: 'courier' },
          2: { cellWidth: 45 },
          3: { cellWidth: 40 },
          4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
          5: { cellWidth: 20, halign: 'center' },
        },
        styles: {
          cellPadding: 3,
          overflow: 'linebreak',
        },
        didDrawPage: (data) => {
          // Footer on every page
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
          doc.text(
            'SajiloSplit - Smart Money Management | sajilosplit.com',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 5,
            { align: 'center' }
          );
        },
      });
    } else {
      // No transactions
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'italic');
      doc.text('No transactions found', 14, 105);
    }

    // ===== SAVE FILE =====
    const fileName = `SajiloSplit_Statement_${user?.name?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    doc.save(fileName);
    
    return true;
  } catch (error) {
    console.error('PDF Export Error:', error);
    throw error;
  }
};

// Export CSV (bonus)
export const exportTransactionsCSV = (transactions, user) => {
  try {
    const currency = localStorage.getItem('currency') || 'NPR';
    const headers = ['Date', 'Transaction ID', 'Type', 'Purpose', 'Amount', 'Status'];
    
    const rows = transactions.map((t) => {
      const isSender = t.sender?._id === user?.id;
      return [
        new Date(t.createdAt).toLocaleDateString(),
        t.transactionId,
        t.type,
        t.purpose || '-',
        `${isSender ? '-' : '+'}${currency} ${t.amount}`,
        t.status,
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SajiloSplit_Statement_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw error;
  }
};