import mongoose from "mongoose";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import Booking from "../../models/Booking.js";
import Service from "../../models/Service.js";
import Technician from "../../models/Technician.js";
import User from "../../models/User.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { sendEmail } from "../../services/email/mailer.js";
import {
  bookingCreatedEmailTemplate,
  bookingStatusEmailTemplate,
} from "../../templates/bookingEmailTemplate.js";
import { AppError } from "../../utils/AppError.js";
import { buildPaginationMeta, parsePagination } from "../../utils/pagination.js";

const BOOKING_STATUSES = ["Pending", "Accepted", "Rejected", "Completed", "Cancelled"];
const TECHNICIAN_STATUS_UPDATES = ["Accepted", "Rejected", "Completed"];
const BOOKING_PDF_LOGO_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../asset/logo.png");

const toMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const validateBookingPayload = ({
  technician,
  service,
  scheduledDate,
  startTime,
  endTime,
  location,
  phone,
  notes,
  mapUrl,
}) => {
  if (!technician || !service || !scheduledDate || !startTime || !endTime || !location || !phone) {
    throw new AppError("technician, service, scheduledDate, startTime, endTime, location, and phone are required.", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(technician) || !mongoose.Types.ObjectId.isValid(service)) {
    throw new AppError("Invalid technician or service id.", 400);
  }

  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(startTime) || !/^([01]\d|2[0-3]):([0-5]\d)$/.test(endTime)) {
    throw new AppError("startTime and endTime must be in HH:mm format.", 400);
  }

  if (toMinutes(startTime) >= toMinutes(endTime)) {
    throw new AppError("endTime must be later than startTime.", 400);
  }

  if (!location.country || !location.state || !location.city || !location.addressLine || !location.postalCode) {
    throw new AppError("Location must include country, state, city, addressLine, and postalCode.", 400);
  }

  if (!/^\+?[0-9]{10,15}$/.test(String(phone).trim())) {
    throw new AppError("Please provide a valid contact number.", 400);
  }

  if (!String(notes || "").trim()) {
    throw new AppError("Booking note is required.", 400);
  }

  if (mapUrl && !/^https?:\/\/\S+$/i.test(String(mapUrl).trim())) {
    throw new AppError("Please provide a valid map URL.", 400);
  }
};

const sendBookingCreatedNotifications = async ({
  booking,
  serviceName,
  customer,
  technicianUser,
  technicianName,
}) => {
  const formattedDate = new Date(booking.scheduledDate).toLocaleDateString();
  const locationText =
    [booking.location?.addressLine, booking.location?.city, booking.location?.state, booking.location?.country]
      .filter(Boolean)
      .join(", ") || "N/A";

  const tasks = [
    sendEmail({
      to: customer.email,
      subject: "ServiceMate - Booking Created",
      html: bookingCreatedEmailTemplate({
        recipientName: customer.fullName,
        serviceName,
        scheduledDate: formattedDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        counterpartName: technicianName,
        locationText,
      }),
    }),
    sendEmail({
      to: technicianUser.email,
      subject: "ServiceMate - New Booking Request",
      html: bookingCreatedEmailTemplate({
        recipientName: technicianName,
        serviceName,
        scheduledDate: formattedDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        counterpartName: customer.fullName,
        locationText,
      }),
    }),
  ];

  const results = await Promise.allSettled(tasks);
  const failedNotifications = results
    .map((result, index) => ({ result, recipient: index === 0 ? "customer" : "technician" }))
    .filter((item) => item.result.status === "rejected")
    .map((item) => item.recipient);

  return failedNotifications;
};

const sendBookingStatusNotifications = async ({ booking, serviceName, customer, technicianUser }) => {
  const formattedDate = new Date(booking.scheduledDate).toLocaleDateString();
  const tasks = [
    sendEmail({
      to: customer.email,
      subject: `ServiceMate - Booking ${booking.status}`,
      html: bookingStatusEmailTemplate({
        recipientName: customer.fullName,
        serviceName,
        status: booking.status,
        scheduledDate: formattedDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      }),
    }),
    sendEmail({
      to: technicianUser.email,
      subject: `ServiceMate - Booking ${booking.status}`,
      html: bookingStatusEmailTemplate({
        recipientName: technicianUser.fullName,
        serviceName,
        status: booking.status,
        scheduledDate: formattedDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
      }),
    }),
  ];

  const results = await Promise.allSettled(tasks);
  const failedNotifications = results
    .map((result, index) => ({ result, recipient: index === 0 ? "customer" : "technician" }))
    .filter((item) => item.result.status === "rejected")
    .map((item) => item.recipient);

  return failedNotifications;
};

const GST_RATE = 0.18;
const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const sanitizeBillItems = (items) => {
  if (!Array.isArray(items)) {
    throw new AppError("Bill items must be an array.", 400);
  }
  return items.map((item) => {
    const name = String(item?.name || "").trim();
    const price = Number(item?.price);
    if (!name || Number.isNaN(price) || price < 0) {
      throw new AppError("Each bill item must include valid name and price.", 400);
    }
    return { name, price };
  });
};

const computeFinalBill = ({ serviceCharge, items }) => {
  const baseFee = Number(serviceCharge);
  if (!Number.isFinite(baseFee) || baseFee < 0) {
    throw new AppError("Service charge is required and must be a valid number.", 400);
  }
  const sanitizedItems = sanitizeBillItems(items || []);
  const additionalTotal = sanitizedItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  return {
    serviceCharge: baseFee,
    sanitizedItems,
    finalAmount: Number((baseFee + additionalTotal).toFixed(2)),
  };
};

const buildBookingPdfBuffer = async (booking) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ margin: 50, size: "A4" });

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const userName = booking?.user?.fullName || "N/A";
    const phone = booking?.phone || booking?.user?.phone || "N/A";
    const serviceName = booking?.service?.serviceName || "N/A";
    const technicianName = booking?.technician?.user?.fullName || "N/A";
    const customerAddress = [
      booking?.location?.addressLine,
      booking?.location?.city,
      booking?.location?.state,
      booking?.location?.country,
      booking?.location?.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
    const bookingDate = new Date(booking.scheduledDate).toLocaleDateString();
    const bookingTime = `${booking.startTime} - ${booking.endTime}`;
    const estimatedAmount = Number(booking.totalPrice || 0);
    const hasFinalBill = Number.isFinite(Number(booking.finalAmount));
    const finalAmount = hasFinalBill ? Number(booking.finalAmount) : null;
    const serviceCharge = Number.isFinite(Number(booking.serviceCharge)) ? Number(booking.serviceCharge) : null;
    const finalBillItems = Array.isArray(booking.billItems) ? booking.billItems : [];

    const leftX = 50;
    const rightEdge = 545;
    const contentWidth = rightEdge - leftX;
    const columnGap = 28;
    const columnWidth = (contentWidth - columnGap) / 2;
    const rightColX = leftX + columnWidth + columnGap;

    // Header
    doc.image(BOOKING_PDF_LOGO_PATH, leftX, 52, {
  width: 120
});

    doc.fillColor("#0F172A").font("Helvetica-Bold").fontSize(22).text("INVOICE", rightEdge - 190, 52, {
      width: 190,
      align: "right",
    });
    doc.font("Helvetica").fontSize(10).fillColor("#334155").text(`Invoice Number: ${String(booking._id)}`, rightEdge - 220, 84, {
      width: 220,
      align: "right",
    });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, rightEdge - 220, 99, {
      width: 220,
      align: "right",
    });

    doc.strokeColor("#CBD5E1").lineWidth(1).moveTo(leftX, 140).lineTo(rightEdge, 140).stroke();

    // Two-column section
    const sectionTop = 156;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#1E3A8A").text("From", leftX, sectionTop, { width: columnWidth });
    let leftY = sectionTop + 16;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A").text("ServiceMate Pvt Ltd", leftX, leftY, { width: columnWidth });
    leftY += doc.heightOfString("ServiceMate Pvt Ltd", { width: columnWidth }) + 3;
    doc.font("Helvetica").fontSize(10).fillColor("#334155").text("123 Service Lane, Tech Park, Bengaluru, India", leftX, leftY, { width: columnWidth });
    leftY += doc.heightOfString("123 Service Lane, Tech Park, Bengaluru, India", { width: columnWidth }) + 3;
    doc.text("GSTIN: 29ABCDE1234F1Z5", leftX, leftY, { width: columnWidth });
    leftY += doc.heightOfString("GSTIN: 29ABCDE1234F1Z5", { width: columnWidth });

    doc.font("Helvetica-Bold").fontSize(11).fillColor("#1E3A8A").text("Bill To", rightColX, sectionTop, { width: columnWidth });
    let rightY = sectionTop + 16;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A").text(userName, rightColX, rightY, { width: columnWidth });
    rightY += doc.heightOfString(userName, { width: columnWidth }) + 3;
    doc.font("Helvetica").fontSize(10).fillColor("#334155").text(`Phone: ${phone}`, rightColX, rightY, { width: columnWidth });
    rightY += doc.heightOfString(`Phone: ${phone}`, { width: columnWidth }) + 3;
    doc.text(`Address: ${customerAddress || "N/A"}`, rightColX, rightY, { width: columnWidth });
    rightY += doc.heightOfString(`Address: ${customerAddress || "N/A"}`, { width: columnWidth }) + 3;
    if (booking?.mapUrl) {
      doc.fillColor("#1E3A8A").text("Location: View on Map", rightColX, rightY, {
        width: columnWidth,
        underline: true,
        link: booking.mapUrl,
      });
      rightY += doc.heightOfString("Location: View on Map", { width: columnWidth });
    } else {
      doc.fillColor("#334155").text("Location: N/A", rightColX, rightY, { width: columnWidth });
      rightY += doc.heightOfString("Location: N/A", { width: columnWidth });
    }

    const sectionBottom = Math.max(leftY, rightY);
    doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(leftX, sectionBottom + 10).lineTo(rightEdge, sectionBottom + 10).stroke();

    // Table
    const tableTop = sectionBottom + 24;
    const colWidths = { service: 130, technician: 120, date: 80, time: 80, amount: 85 };
    const colX = {
      service: leftX,
      technician: leftX + colWidths.service,
      date: leftX + colWidths.service + colWidths.technician,
      time: leftX + colWidths.service + colWidths.technician + colWidths.date,
      amount: leftX + colWidths.service + colWidths.technician + colWidths.date + colWidths.time,
    };
    const headerHeight = 28;
    const rowHeight = 30;
    const tableWidth = Object.values(colWidths).reduce((sum, width) => sum + width, 0);

    doc.rect(leftX, tableTop, tableWidth, headerHeight).fill("#F1F5F9");
    doc.rect(leftX, tableTop + headerHeight, tableWidth, rowHeight).stroke("#CBD5E1");

    doc.strokeColor("#CBD5E1")
      .moveTo(colX.technician, tableTop)
      .lineTo(colX.technician, tableTop + headerHeight + rowHeight)
      .stroke();
    doc.moveTo(colX.date, tableTop).lineTo(colX.date, tableTop + headerHeight + rowHeight).stroke();
    doc.moveTo(colX.time, tableTop).lineTo(colX.time, tableTop + headerHeight + rowHeight).stroke();
    doc.moveTo(colX.amount, tableTop).lineTo(colX.amount, tableTop + headerHeight + rowHeight).stroke();

    const pad = 7;
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A");
    doc.text("Service", colX.service + pad, tableTop + 9, { width: colWidths.service - pad * 2 });
    doc.text("Technician", colX.technician + pad, tableTop + 9, { width: colWidths.technician - pad * 2 });
    doc.text("Date", colX.date + pad, tableTop + 9, { width: colWidths.date - pad * 2 });
    doc.text("Time", colX.time + pad, tableTop + 9, { width: colWidths.time - pad * 2 });
    doc.text("Amount", colX.amount + pad, tableTop + 9, { width: colWidths.amount - pad * 2, align: "right" });

    doc.font("Helvetica").fillColor("#334155");
    doc.text(serviceName, colX.service + pad, tableTop + headerHeight + 9, { width: colWidths.service - pad * 2 });
    doc.text(technicianName, colX.technician + pad, tableTop + headerHeight + 9, {
      width: colWidths.technician - pad * 2,
    });
    doc.text(bookingDate, colX.date + pad, tableTop + headerHeight + 9, { width: colWidths.date - pad * 2 });
    doc.text(bookingTime, colX.time + pad, tableTop + headerHeight + 9, { width: colWidths.time - pad * 2 });
    doc.text(formatCurrency(estimatedAmount), colX.amount + pad, tableTop + headerHeight + 9, {
      width: colWidths.amount - pad * 2,
      align: "right",
    });

    // Pricing summary
    const pricingTop = tableTop + headerHeight + rowHeight + 26;
    const pricingLabelX = rightEdge - 180;
    const pricingValueX = rightEdge - 10;
    doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Estimated Amount:", pricingLabelX, pricingTop, {
      width: 120,
      align: "left",
    });
    doc.fillColor("#0F172A").text(formatCurrency(estimatedAmount), pricingValueX - 80, pricingTop, {
      width: 80,
      align: "right",
    });
    const noteY = pricingTop + 30;
    doc.fillColor("#64748B").font("Helvetica").fontSize(10).text(
      "This is an estimated invoice. Final price will be determined after service.",
      leftX,
      noteY,
      { width: contentWidth, align: "center" },
    );

    let footerBaseY = noteY + 36;
    if (hasFinalBill) {
      const finalSectionTop = footerBaseY + 12;
      doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(leftX, finalSectionTop - 10).lineTo(rightEdge, finalSectionTop - 10).stroke();
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#1E3A8A").text("Final Bill", leftX, finalSectionTop);
      let billY = finalSectionTop + 18;
      const itemRows = [{ name: "Service Charge", price: serviceCharge ?? 0 }, ...finalBillItems];
      const tableX = leftX;
      const tableWidth = contentWidth;
      const nameColWidth = tableWidth - 120;
      const amountColWidth = 120;
      const headerHeight = 24;
      const rowHeight = 22;

      doc.rect(tableX, billY, tableWidth, headerHeight).fill("#F1F5F9");
      doc.strokeColor("#CBD5E1").lineWidth(1).rect(tableX, billY, tableWidth, headerHeight).stroke();
      doc.moveTo(tableX + nameColWidth, billY).lineTo(tableX + nameColWidth, billY + headerHeight).stroke();
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#0F172A").text("Item", tableX + 8, billY + 7, {
        width: nameColWidth - 16,
      });
      doc.text("Amount", tableX + nameColWidth + 8, billY + 7, { width: amountColWidth - 16, align: "right" });
      billY += headerHeight;

      itemRows.forEach((item) => {
        doc.rect(tableX, billY, tableWidth, rowHeight).stroke("#CBD5E1");
        doc.moveTo(tableX + nameColWidth, billY).lineTo(tableX + nameColWidth, billY + rowHeight).stroke();
        doc.font("Helvetica").fontSize(10).fillColor("#334155").text(item.name, tableX + 8, billY + 6, {
          width: nameColWidth - 16,
        });
        doc.text(formatCurrency(item.price), tableX + nameColWidth + 8, billY + 6, {
          width: amountColWidth - 16,
          align: "right",
        });
        billY += rowHeight;
      });

      const subtotal = Number.isFinite(finalAmount)
        ? Number(finalAmount)
        : Number(itemRows.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2));
      const finalGst = Number((subtotal * GST_RATE).toFixed(2));
      const grandTotal = Number((subtotal + finalGst).toFixed(2));

      const summaryY = billY + 12;
      doc.font("Helvetica").fontSize(10).fillColor("#475569").text("Subtotal:", rightEdge - 180, summaryY, {
        width: 90,
      });
      doc.fillColor("#0F172A").text(formatCurrency(subtotal), rightEdge - 90, summaryY, { width: 90, align: "right" });
      doc.fillColor("#475569").text("GST (18%):", rightEdge - 180, summaryY + 16, { width: 90 });
      doc.fillColor("#0F172A").text(formatCurrency(finalGst), rightEdge - 90, summaryY + 16, {
        width: 90,
        align: "right",
      });
      doc.strokeColor("#CBD5E1").lineWidth(1).moveTo(rightEdge - 180, summaryY + 34).lineTo(rightEdge, summaryY + 34).stroke();
      doc.font("Helvetica-Bold").fillColor("#1E3A8A").text("Grand Total:", rightEdge - 180, summaryY + 40, {
        width: 90,
      });
      doc.text(formatCurrency(grandTotal), rightEdge - 90, summaryY + 40, { width: 90, align: "right" });
      footerBaseY = summaryY + 72;
    }

    // Footer
    const footerY = footerBaseY;
    doc.strokeColor("#E2E8F0").lineWidth(1).moveTo(leftX, footerY).lineTo(rightEdge, footerY).stroke();
    doc.font("Helvetica").fillColor("#94A3B8").fontSize(9).text("ServiceMate Invoice", leftX, footerY + 10, {
      width: contentWidth,
      align: "center",
    });

    doc.end();
  });

export const createBooking = asyncHandler(async (req, res) => {
  const { technician, service, scheduledDate, startTime, endTime, location, phone, mapUrl, notes, totalPrice } =
    req.body;

  validateBookingPayload({ technician, service, scheduledDate, startTime, endTime, location, phone, notes, mapUrl });
  if (totalPrice === undefined || Number(totalPrice) < 0) {
    throw new AppError("totalPrice is required and must be >= 0.", 400);
  }

  const technicianDoc = await Technician.findById(technician);
  if (!technicianDoc) {
    throw new AppError("Technician not found.", 404);
  }

  const serviceDoc = await Service.findById(service);
  if (!serviceDoc) {
    throw new AppError("Service not found.", 404);
  }
  if (String(serviceDoc.technician) !== String(technicianDoc._id)) {
    throw new AppError("Selected service does not belong to this technician.", 400);
  }

  const dateOnly = new Date(scheduledDate);
  if (Number.isNaN(dateOnly.getTime())) {
    throw new AppError("scheduledDate is invalid.", 400);
  }
  dateOnly.setHours(0, 0, 0, 0);

  const existingBookings = await Booking.find({
    technician: technicianDoc._id,
    scheduledDate: dateOnly,
    status: { $in: ["Pending", "Accepted"] },
  }).select("startTime endTime");

  const requestedStart = toMinutes(startTime);
  const requestedEnd = toMinutes(endTime);
  const isOverlapping = existingBookings.some((booking) => {
    const existingStart = toMinutes(booking.startTime);
    const existingEnd = toMinutes(booking.endTime);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (isOverlapping) {
    throw new AppError("Technician is already booked in the selected time slot.", 409);
  }

  const booking = await Booking.create({
    user: req.user._id,
    technician: technicianDoc._id,
    service: serviceDoc._id,
    scheduledDate: dateOnly,
    startTime,
    endTime,
    location,
    phone: String(phone).trim(),
    ...(mapUrl ? { mapUrl: String(mapUrl).trim() } : {}),
    notes,
    totalPrice,
    status: "Pending",
  });

  const technicianUser = await User.findById(technicianDoc.user).select("fullName email");
  if (!technicianUser) {
    throw new AppError("Technician user account not found.", 404);
  }

  const failedNotifications = await sendBookingCreatedNotifications({
    booking,
    serviceName: serviceDoc.serviceName,
    customer: req.user,
    technicianUser,
    technicianName: technicianUser.fullName,
  });

  res.status(201).json({
    status: "success",
    message: "Booking created successfully.",
    ...(failedNotifications.length > 0
      ? {
          notificationWarning: `Booking saved, but email notification failed for: ${failedNotifications.join(", ")}.`,
        }
      : {}),
    data: booking,
  });
});

export const updateBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status, cancellationReason } = req.body;

  if (!BOOKING_STATUSES.includes(status)) {
    throw new AppError("Invalid status value.", 400);
  }

  const booking = await Booking.findById(bookingId).populate("technician", "user");
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const isTechnicianOwner =
    req.user.role === "technician" &&
    booking.technician &&
    String(booking.technician.user) === String(req.user._id);

  const isBookingOwner = String(booking.user) === String(req.user._id);
  const isAdmin = req.user.role === "admin";

  if (status === "Cancelled" && !isBookingOwner && !isAdmin) {
    throw new AppError("Only booking owner or admin can cancel this booking.", 403);
  }

  if (status !== "Cancelled" && !isTechnicianOwner && !isAdmin) {
    throw new AppError("Only assigned technician or admin can update this status.", 403);
  }

  if (status !== "Cancelled" && !isAdmin && !TECHNICIAN_STATUS_UPDATES.includes(status)) {
    throw new AppError("Technician can only set Accepted, Rejected, or Completed.", 403);
  }

  booking.status = status;
  if (status === "Cancelled") {
    booking.cancelledBy = req.user._id;
    booking.cancellationReason = cancellationReason || "Cancelled by user.";
  }
  if (status === "Completed") {
    booking.completedAt = new Date();
  }

  await booking.save();

  const [customer, technicianUser, serviceDoc] = await Promise.all([
    User.findById(booking.user).select("fullName email"),
    User.findById(booking.technician?.user).select("fullName email"),
    Service.findById(booking.service).select("serviceName"),
  ]);

  if (!customer || !technicianUser || !serviceDoc) {
    throw new AppError("Booking notification dependencies are missing.", 404);
  }

  const failedNotifications = await sendBookingStatusNotifications({
    booking,
    serviceName: serviceDoc.serviceName,
    customer,
    technicianUser,
  });

  if (status === "Accepted") {
    try {
      const populatedBooking = await Booking.findById(booking._id)
        .populate("user", "fullName email phone")
        .populate({
          path: "technician",
          select: "user",
          populate: { path: "user", select: "fullName email" },
        })
        .populate("service", "serviceName");

      if (!populatedBooking) {
        throw new AppError("Booking not found for PDF email generation.", 404);
      }

      const pdfBuffer = await buildBookingPdfBuffer(populatedBooking);
      await sendEmail({
        to: customer.email,
        subject: "Your Booking is Confirmed - ServiceMate",
        html: `
          <div style="font-family: Arial, sans-serif; color: #111827;">
            <p>Your booking has been accepted.</p>
            <p>Please find the booking details attached.</p>
          </div>
        `,
        attachments: [
          {
            filename: "booking-details.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    } catch (emailWithPdfError) {
      failedNotifications.push("customer-pdf");
    }
  }

  res.status(200).json({
    status: "success",
    message: "Booking status updated successfully.",
    ...(failedNotifications.length > 0
      ? {
          notificationWarning: `Status updated, but email notification failed for: ${failedNotifications.join(", ")}.`,
        }
      : {}),
    data: booking,
  });
});

export const cancelBookingByUser = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  if (String(booking.user) !== String(req.user._id)) {
    throw new AppError("You are not allowed to cancel this booking.", 403);
  }

  if (booking.status === "Completed") {
    throw new AppError("Cannot cancel completed booking", 400);
  }

  if (booking.status === "Cancelled") {
    throw new AppError("Booking is already cancelled.", 400);
  }

  booking.status = "Cancelled";
  booking.cancelledBy = req.user._id;
  booking.cancellationReason = "Cancelled by user.";
  await booking.save();

  res.status(200).json({
    status: "success",
    message: "Booking cancelled successfully.",
    data: booking,
  });
});

export const completeBookingWithBill = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { serviceCharge, items } = req.body;

  const booking = await Booking.findById(bookingId).populate("technician", "user");
  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const isTechnicianOwner =
    req.user.role === "technician" &&
    booking.technician &&
    String(booking.technician.user) === String(req.user._id);
  if (!isTechnicianOwner) {
    throw new AppError("Only assigned technician can complete this booking.", 403);
  }

  const normalizedStatus = String(booking.status || "").toLowerCase();
  if (!["accepted", "in-progress"].includes(normalizedStatus)) {
    throw new AppError("Only ongoing bookings can be completed with final bill.", 400);
  }

  const { serviceCharge: normalizedServiceCharge, sanitizedItems, finalAmount } = computeFinalBill({
    serviceCharge,
    items,
  });
  booking.status = "Completed";
  booking.serviceCharge = normalizedServiceCharge;
  booking.finalAmount = finalAmount;
  booking.billItems = sanitizedItems;
  booking.completedAt = new Date();
  await booking.save();

  res.status(200).json({
    status: "success",
    message: "Booking marked as completed with final bill.",
    data: booking,
  });
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip, isPaginated } = parsePagination(req.query);
  let query = {};

  if (req.user.role === "user") {
    query = { user: req.user._id };
  } else if (req.user.role === "technician") {
    const technician = await Technician.findOne({ user: req.user._id }).select("_id");
    if (!technician) {
      throw new AppError("Technician profile not found.", 404);
    }
    query = { technician: technician._id };
  } else if (req.user.role === "admin") {
    query = {};
  } else {
    throw new AppError("Unsupported user role for this operation.", 403);
  }

  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("user", "fullName email")
      .populate("technician", "user location")
      .populate("service", "serviceName price")
      .sort({ scheduledDate: -1, startTime: -1 })
      .skip(isPaginated ? skip : 0)
      .limit(isPaginated ? limit : 0),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    results: bookings.length,
    data: bookings,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated }),
  });
});

export const getUserBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip, isPaginated } = parsePagination(req.query);
  const query = { user: req.user._id };
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate({
        path: "technician",
        select: "user location",
        populate: { path: "user", select: "fullName email" },
      })
      .populate("service", "serviceName price")
      .sort({ scheduledDate: -1, startTime: -1 })
      .skip(isPaginated ? skip : 0)
      .limit(isPaginated ? limit : 0),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    results: bookings.length,
    data: bookings,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated }),
  });
});

export const getTechnicianBookings = asyncHandler(async (req, res) => {
  const { page, limit, skip, isPaginated } = parsePagination(req.query);
  const technician = await Technician.findOne({ user: req.user._id }).select("_id");
  if (!technician) {
    throw new AppError("Technician profile not found.", 404);
  }

  const query = { technician: technician._id };
  const [bookings, total] = await Promise.all([
    Booking.find(query)
      .populate("user", "fullName email")
      .populate("service", "serviceName price")
      .sort({ scheduledDate: -1, startTime: -1 })
      .skip(isPaginated ? skip : 0)
      .limit(isPaginated ? limit : 0),
    Booking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    status: "success",
    results: bookings.length,
    data: bookings,
    pagination: buildPaginationMeta({ total, page, limit, isPaginated }),
  });
});

export const downloadBookingPdf = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId)
    .populate("user", "fullName phone")
    .populate({
      path: "technician",
      select: "user",
      populate: { path: "user", select: "fullName" },
    })
    .populate("service", "serviceName");

  if (!booking) {
    throw new AppError("Booking not found.", 404);
  }

  const isBookingOwner = String(booking.user?._id || booking.user) === String(req.user._id);
  const isTechnicianOwner = String(booking?.technician?.user?._id || booking?.technician?.user) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isBookingOwner && !isTechnicianOwner && !isAdmin) {
    throw new AppError("You are not allowed to download this booking PDF.", 403);
  }

  const normalizedStatus = String(booking.status || "").toLowerCase();
  if (!["accepted", "in-progress", "completed"].includes(normalizedStatus)) {
    throw new AppError("PDF is only available for accepted, in-progress, or completed bookings.", 400);
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="booking-details-${booking._id}.pdf"`);

  const pdfBuffer = await buildBookingPdfBuffer(booking);
  res.send(pdfBuffer);
});
