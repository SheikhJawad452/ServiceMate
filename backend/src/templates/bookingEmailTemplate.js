export const bookingCreatedEmailTemplate = ({
  recipientName,
  serviceName,
  scheduledDate,
  startTime,
  endTime,
  counterpartName,
  locationText,
}) => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2 style="color: #1E3A8A; margin-bottom: 8px;">ServiceMate Booking Created</h2>
    <p>Hello ${recipientName},</p>
    <p>A new booking has been created for <strong>${serviceName}</strong>.</p>
    <ul style="padding-left: 18px;">
      <li><strong>Date:</strong> ${scheduledDate}</li>
      <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
      <li><strong>With:</strong> ${counterpartName}</li>
      <li><strong>Location:</strong> ${locationText}</li>
    </ul>
    <p style="margin-top: 12px;">Please review booking details from your dashboard.</p>
  </div>
`;

export const bookingStatusEmailTemplate = ({
  recipientName,
  serviceName,
  status,
  scheduledDate,
  startTime,
  endTime,
}) => `
  <div style="font-family: Arial, sans-serif; color: #111827;">
    <h2 style="color: #1E3A8A; margin-bottom: 8px;">ServiceMate Booking Update</h2>
    <p>Hello ${recipientName},</p>
    <p>Your booking status is now <strong style="color: #F97316;">${status}</strong>.</p>
    <ul style="padding-left: 18px;">
      <li><strong>Service:</strong> ${serviceName}</li>
      <li><strong>Date:</strong> ${scheduledDate}</li>
      <li><strong>Time:</strong> ${startTime} - ${endTime}</li>
    </ul>
    <p style="margin-top: 12px;">You can view full details in your dashboard.</p>
  </div>
`;
