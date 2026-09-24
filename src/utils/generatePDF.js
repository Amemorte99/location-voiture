import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// Exécution sécurisée d'autoTable compatible avec tous les formats de modules (ESM/CJS)
const runAutoTable = (docInstance, options) => {
  if (typeof autoTable === 'function') {
    return autoTable(docInstance, options);
  }
  if (autoTable && typeof autoTable.default === 'function') {
    return autoTable.default(docInstance, options);
  }
  if (autoTable && typeof autoTable.autoTable === 'function') {
    return autoTable.autoTable(docInstance, options);
  }
  if (typeof docInstance.autoTable === 'function') {
    return docInstance.autoTable(options);
  }
  throw new Error("Impossible d'initialiser le module de tableau PDF (autoTable)");
};

const formatDateSafe = (dateVal) => {
  if (!dateVal) return '-';
  try {
    if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      const [y, m, d] = dateVal.trim().split('-');
      return `${d}/${m}/${y}`;
    }
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('fr-FR');
  } catch {
    return '-';
  }
};

export const generateInvoicePDF = (booking, isUser = false) => {
  try {
    if (!booking) {
      toast.error("Données de réservation introuvables");
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Palette Prestige LocaGawa
    const slateDark = [15, 47, 117];      // #0F2F75 (bleu marine)
    const goldAccent = [227, 56, 60];     // #E3383C (rouge accent)
    const softCream = [245, 248, 253];    // #F5F8FD (fond bleu très doux)
    const lineLight = [220, 229, 243];    // #DCE5F3 (lignes séparatrices fines)
    const textMuted = [100, 116, 139];    // #64748B
    const emeraldGreen = [16, 185, 129];  // #10B981

    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');

    const clientName = booking.fullName || booking.user?.name || urlParams.get('fullName') || 'Client LocaGawa';
    const clientPhone = booking.phone || urlParams.get('phone') || 'Non renseigné';
    const clientEmail = booking.email || booking.user?.email || urlParams.get('email') || 'contact@client.ma';
    const carName = booking.car?.name || booking.carName || urlParams.get('carName') || 'Véhicule de Tourisme';
    const carBrand = booking.car?.brand || '';
    const totalPrice = Number(booking.totalPrice || urlParams.get('totalPrice') || 0);
    const formatDH = (val) => `${Math.round(Number(val || 0))} FCFA`;

    const rawStartDate = booking.startDate || urlParams.get('startDate');
    const rawEndDate = booking.endDate || urlParams.get('endDate');
    const startDate = formatDateSafe(rawStartDate);
    const endDate = formatDateSafe(rawEndDate);

    // Calcul du nombre de jours
    let diffDays = 1;
    if (rawStartDate && rawEndDate) {
      try {
        const s = new Date(rawStartDate);
        const e = new Date(rawEndDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          const diffTime = Math.abs(e - s);
          diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 0) diffDays = 1;
        }
      } catch {}
    }

    // Calcul du tarif journalier
    let calculatedCarPrice = booking.car?.price && booking.car.price > 0 ? booking.car.price : undefined;
    if (!calculatedCarPrice && totalPrice > 0 && diffDays > 0) {
      calculatedCarPrice = Math.round(totalPrice / diffDays);
    }
    const carPrice = calculatedCarPrice || (totalPrice > 0 ? Math.round(totalPrice / diffDays) : 400);

    const receiptNum = booking._id
      ? `LF-${String(booking._id).substring(0, 8).toUpperCase()}`
      : `LF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const paymentMethod = booking.paymentMethod || 'cash';
    const paymentLabel = paymentMethod === 'card' ? 'Carte Bancaire en ligne' : 'Règlement en espèces à la prise en charge';
    const pickupLocation = booking.pickupLocation || urlParams.get('pickupLocation') || 'Aéroport de N’Djamena (Terminal Arrivées)';
    const flightNumber = booking.flightNumber || urlParams.get('flightNumber') || '';
    const pickupTime = booking.pickupTime || urlParams.get('pickupTime') || '';
    const deliveryAddress = booking.deliveryAddress || urlParams.get('deliveryAddress') || '';

    let agencyPhone = '+235 22 00 00 00';
    let agencyEmail = 'contact@locafes.ma';
    let agencyAddress = 'Avenue Charles de Gaulle, Centre-Ville';
    let agencyCity = 'N’Djamena, Tchad';

    try {
      const savedAgency = typeof window !== 'undefined' ? localStorage.getItem('locafes_agency_settings') : null;
      if (savedAgency) {
        const parsed = JSON.parse(savedAgency);
        if (parsed.phone) agencyPhone = parsed.phone;
        if (parsed.email) agencyEmail = parsed.email;
        if (parsed.address) agencyAddress = parsed.address;
      }
    } catch {}

    // 1. Bande supérieure dorée raffinée (fine et discrète)
    doc.setFillColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.rect(0, 0, 210, 2.5, 'F');

    // 2. En-tête aéré
    const startY = 18;

    // Logo Marque
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('LOCA', 18, startY);
    const locaWidth = doc.getTextWidth('LOCA');

    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('GAWA', 18 + locaWidth + 1.2, startY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('LOCATION AUTOMOBILE DE PRESTIGE', 18, startY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`${agencyAddress} • ${agencyCity}`, 18, startY + 11);
    doc.text(`Tél : ${agencyPhone} • Email : ${agencyEmail}`, 18, startY + 15.5);

    // Bloc Facture à droite (aéré, sans boîte lourde)
    const rightX = 192;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text('FACTURE DE LOCATION', rightX, startY, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text(`Réf : ${receiptNum}`, rightX, startY + 6, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Date d'émission : ${new Date().toLocaleDateString('fr-FR')}`, rightX, startY + 11, { align: 'right' });

    // Ligne de séparation élégante
    doc.setDrawColor(lineLight[0], lineLight[1], lineLight[2]);
    doc.setLineWidth(0.3);
    doc.line(18, startY + 23, 192, startY + 23);

    // 3. Section Informations
    const infoY = startY + 31;

    // Colonne Gauche : Client
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('CLIENT / CONDUCTEUR PRINCIPAL', 18, infoY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(clientName, 18, infoY + 6, { maxWidth: 88 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Téléphone : ${clientPhone}`, 18, infoY + 11.5, { maxWidth: 88 });
    doc.text(`Email : ${clientEmail}`, 18, infoY + 16.5, { maxWidth: 88 });

    // Colonne Droite : Prise en charge & Dates
    const colRightX = 112;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('PRISE EN CHARGE & RESTITUTION', colRightX, infoY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    let pickupText = pickupLocation;
    if (deliveryAddress) pickupText += ` (${deliveryAddress})`;
    if (flightNumber) pickupText += ` • Vol ${flightNumber}`;
    if (pickupTime) pickupText += ` • ${pickupTime}`;

    const splitPickup = doc.splitTextToSize(pickupText, 78);
    doc.text(splitPickup, colRightX, infoY + 5.5);
    const pickupExtraY = Math.max(0, (splitPickup.length - 1) * 3.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Période : Du ${startDate} au ${endDate}`, colRightX, infoY + 11.5 + pickupExtraY);
    doc.text(`Durée totale : ${diffDays} jour${diffDays > 1 ? 's' : ''}`, colRightX, infoY + 16.5 + pickupExtraY);

    // 4. Tableau épuré et aéré (Tableau minimaliste style hôtellerie de luxe)
    const tableStartY = infoY + 26 + pickupExtraY;

    runAutoTable(doc, {
      startY: tableStartY,
      theme: 'plain',
      margin: { left: 18, right: 18 },
      headStyles: {
        fillColor: softCream,
        textColor: slateDark,
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 4.5,
        lineColor: lineLight,
        lineWidth: { bottom: 0.4 },
      },
      bodyStyles: {
        textColor: [51, 65, 85],
        fontSize: 8.5,
        cellPadding: 5,
        lineColor: [241, 245, 249],
        lineWidth: { bottom: 0.3 },
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 84, fontStyle: 'bold', textColor: slateDark },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 25, fontStyle: 'bold', textColor: slateDark },
      },
      head: [['Désignation de la prestation', 'Période & Durée', 'Tarif / Jour', 'Total TTC']],
      body: [
        [
          `Location de véhicule : ${carName} ${carBrand ? `(${carBrand})` : ''}\nCatégorie Tourisme & Confort N’Djamena`,
          `Du ${startDate} au ${endDate}\n(${diffDays} jour${diffDays > 1 ? 's' : ''})`,
          formatDH(carPrice),
          formatDH(totalPrice),
        ],
        [
          'Pack Sérénité LocaGawa\nAssurance tous risques, kilométrage illimité, assistance 24/7',
          'Toute la durée',
          'Inclus',
          'OFFERT',
        ],
      ],
    });

    const finalTableY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 12 : 160;

    // 5. Bas de page aéré : Conditions & Récapitulatif financier
    const bottomY = finalTableY;

    // Colonne Gauche : Conditions essentielles résumées & Cachet
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('CONDITIONS & REMISE DES CLÉS', 18, bottomY);

    const conditions = [
      '• Pièces : Permis original valide + Passeport ou CNI.',
      '• Carburant : Restitution au même niveau qu\'au départ.',
      '• Caution : Empreinte de garantie non débitée à la remise des clés.',
      '• Ligne directe conciergerie 24/7 : +235 66 00 00 00',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.2);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    let condY = bottomY + 5.5;
    conditions.forEach((cond) => {
      const wrapped = doc.splitTextToSize(cond, 88);
      doc.text(wrapped, 18, condY);
      condY += (wrapped.length * 3.8) + 1.2;
    });

    // Cachet Agence discret et élégant
    const stampBoxY = condY + 4;
    doc.setDrawColor(lineLight[0], lineLight[1], lineLight[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(18, stampBoxY, 88, 22, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text('LOCAGAWA SARL — DIRECTION OPÉRATIONS', 62, stampBoxY + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`N’DJAMENA • CONTRAT RÉF : ${receiptNum}`, 62, stampBoxY + 12, { align: 'center' });
    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('DOCUMENT OFFICIEL VALIDÉ', 62, stampBoxY + 17, { align: 'center' });

    // Colonne Droite : Récapitulatif Financier (Sobre et Aéré, sans boîte sombre)
    const finX = 125;
    const finRightX = 192;
    const htPrice = Math.round(totalPrice / 1.18);
    const tvaPrice = totalPrice - htPrice;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Sous-total HT :', finX, bottomY + 2);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(formatDH(htPrice), finRightX, bottomY + 2, { align: 'right' });

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('TVA (18% incluse) :', finX, bottomY + 8.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(formatDH(tvaPrice), finRightX, bottomY + 8.5, { align: 'right' });

    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Assurances & Packs :', finX, bottomY + 15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.text('INCLUS (0 FCFA)', finRightX, bottomY + 15, { align: 'right' });

    // Ligne dorée fine avant total
    doc.setDrawColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.setLineWidth(0.4);
    doc.line(finX, bottomY + 21, finRightX, bottomY + 21);

    // Total TTC (Réglé si carte, À régler si espèces à l'arrivée)
    const isCardPaid = paymentMethod === 'card';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(isCardPaid ? 'TOTAL RÉGLÉ (TTC) :' : 'TOTAL À RÉGLER (TTC) :', finX, bottomY + 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
    doc.text(formatDH(totalPrice), finRightX, bottomY + 28, { align: 'right' });

    // Mode de paiement
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('Mode de paiement :', finX, bottomY + 36);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(paymentLabel, finX, bottomY + 41, { maxWidth: 67 });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    if (isCardPaid) {
      doc.setTextColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
      doc.text('Facture acquittée en totalité (CB)', finX, bottomY + 48);
    } else {
      doc.setTextColor(goldAccent[0], goldAccent[1], goldAccent[2]);
      doc.text('Règlement en espèces à la livraison', finX, bottomY + 48);
    }

    // 6. Pied de page
    const footerY = 278;
    doc.setDrawColor(lineLight[0], lineLight[1], lineLight[2]);
    doc.setLineWidth(0.3);
    doc.line(18, footerY, 192, footerY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(
      'LocaGawa SARL • Avenue Charles de Gaulle, Centre-Ville, N’Djamena, Tchad',
      105,
      footerY + 4.5,
      { align: 'center' }
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(
      'RCCM N° TD-NDJ-XXXX • NIF N° XXXXXXXX • Tél : +235 22 00 00 00',
      105,
      footerY + 8.5,
      { align: 'center' }
    );
    doc.text(
      'Document électronique officiel faisant office de facture et de confirmation de réservation LocaGawa.',
      105,
      footerY + 12.5,
      { align: 'center' }
    );

    try {
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Ouvrir directement la facture dans un nouvel onglet du navigateur
      const newWindow = window.open(pdfUrl, '_blank');

      // Si le navigateur bloque les pop-ups ou sur mobile, déclencher le téléchargement direct
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        doc.save(`Facture_LocaGawa_${receiptNum}.pdf`);
        toast.success(`Facture téléchargée : Facture_LocaGawa_${receiptNum}.pdf`);
      } else {
        toast.success('Facture ouverte dans un nouvel onglet');
      }
    } catch (saveErr) {
      console.warn('Fallback doc.save :', saveErr);
      doc.save(`Facture_LocaGawa_${receiptNum}.pdf`);
      toast.success(`Facture téléchargée : Facture_LocaGawa_${receiptNum}.pdf`);
    }
  } catch (globalErr) {
    console.error('Erreur génération facture PDF :', globalErr);
    toast.error(`Erreur génération facture : ${globalErr.message || 'Erreur inconnue'}`);
  }
};

generateInvoicePDF.generateInvoicePDF = generateInvoicePDF;
export default generateInvoicePDF;

