import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { success: false, message: "date is required (YYYY-MM-DD)" },
      { status: 400 }
    );
  }

  const start = new Date(date);
  const end = new Date(date + "T23:59:59");

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
    date,
    credit,
    debit,
    profitOrLoss: credit - debit,
    transactions,
  });
}
