import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  dishName: string;
  quantity: number;
  unitPrice: number;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function POST(req: NextRequest) {
  try {
    const { restaurantName, customerName, items, total } = await req.json() as {
      restaurantName: string;
      customerName: string;
      items: OrderItem[];
      total: number;
    };

    const restaurantEmail = process.env.RESTAURANT_NOTIFICATION_EMAIL;
    if (!restaurantEmail) {
      // Silently skip if no email configured (dev mode)
      return NextResponse.json({ ok: true });
    }

    const itemsHtml = items
      .map(
        (i) =>
          `<tr>
            <td style="padding:8px 0;border-bottom:1px solid #e3e2e2">${i.dishName}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e3e2e2;text-align:center">${i.quantity}</td>
            <td style="padding:8px 0;border-bottom:1px solid #e3e2e2;text-align:right">${formatPrice(i.unitPrice * i.quantity)}</td>
          </tr>`
      )
      .join("");

    await resend.emails.send({
      from: "Zeat <notifications@zeat.app>",
      to: restaurantEmail,
      subject: `🍽️ Nouvelle commande — ${customerName}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#ffffff">
          <h1 style="font-size:24px;font-weight:700;margin:0 0 4px">Nouvelle commande</h1>
          <p style="color:#afafaf;font-size:14px;margin:0 0 24px">${restaurantName}</p>

          <div style="background:#f5f0eb;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;font-weight:600">Client : ${customerName}</p>
          </div>

          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <thead>
              <tr>
                <th style="text-align:left;padding:8px 0;border-bottom:2px solid #000;font-weight:700">Plat</th>
                <th style="text-align:center;padding:8px 0;border-bottom:2px solid #000;font-weight:700">Qté</th>
                <th style="text-align:right;padding:8px 0;border-bottom:2px solid #000;font-weight:700">Prix</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>

          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;padding-top:16px;border-top:2px solid #000">
            <span style="font-weight:700;font-size:16px">Total</span>
            <span style="font-weight:700;font-size:20px">${formatPrice(total)}</span>
          </div>

          <p style="color:#afafaf;font-size:12px;margin-top:32px;text-align:center">
            Zeat — Le menu. Distillé.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email notification error:", error);
    // Don't fail the order if email fails
    return NextResponse.json({ ok: true });
  }
}
