import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      // In development without API key, log and return success
      console.log("Contact form submission (no API key configured):", {
        name,
        email,
        subject,
        message,
      });
      return NextResponse.json(
        { success: true, message: "Message received." },
        { status: 200 }
      );
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "AEFORYN Website",
          email: "noreply@aeforyn.com",
        },
        to: [
          {
            email: "hello@aeforyn.com",
            name: "AEFORYN Support",
          },
        ],
        replyTo: {
          email: email,
          name: name,
        },
        subject: `[AEFORYN Contact] ${subject}`,
        htmlContent: `
          <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
            <div style="background: #071426; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
              <h1 style="color: #F59E0B; font-size: 24px; margin: 0; font-family: 'Space Grotesk', Arial, sans-serif;">AEFORYN</h1>
              <p style="color: #ffffff80; margin: 4px 0 0;">New contact form submission</p>
            </div>

            <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <h2 style="color: #071426; font-size: 18px; margin: 0 0 16px; font-family: 'Space Grotesk', Arial, sans-serif;">${subject}</h2>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
                <tr>
                  <td style="padding: 8px 12px; background: #f3f4f6; border-radius: 6px 0 0 6px; font-weight: 600; font-size: 13px; color: #374151; width: 30%;">Name</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #1f2937;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 12px; background: #f3f4f6; border-radius: 6px 0 0 6px; font-weight: 600; font-size: 13px; color: #374151;">Email</td>
                  <td style="padding: 8px 12px; font-size: 13px; color: #1f2937;"><a href="mailto:${email}" style="color: #3B82F6;">${email}</a></td>
                </tr>
              </table>

              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; border-left: 3px solid #3B82F6;">
                <p style="margin: 0; font-size: 14px; color: #374151; white-space: pre-wrap;">${message}</p>
              </div>
            </div>

            <p style="text-align: center; font-size: 12px; color: #9ca3af; margin-top: 16px;">
              © 2026 Co-Plot (Pty) Ltd — Trading as AEFORYN
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Brevo API error:", errorData);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Message sent successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
