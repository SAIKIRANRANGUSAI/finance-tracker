import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const month = Number(searchParams.get("month")); // 1–12
  const year = Number(searchParams.get("year"));

  if (!month || !year) {
    return NextResponse.json(
      { success: false, message: "month and year are required" },
      { status: 400 }
    );
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const transactions = await Transaction.find({
    date: { $gte: start, $lte: end },
  });

  let credit = 0;
  let debit = 0;

  transactions.forEach((t) => {
    if (t.type === "credit") credit += t.amount;
    if (t.type === "debit") debit += t.amount;
  });

  return NextResponse.json({
    success: true,
    month,
    year,
    credit,
    debit,
    profitOrLoss: credit - debit,
    transactions,
  });
}
