import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("start"); // Monday
  const endDate = searchParams.get("end");     // Sunday

  if (!startDate || !endDate) {
    return NextResponse.json(
      { success: false, message: "start and end dates required" },
      { status: 400 }
    );
  }

  const transactions = await Transaction.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate + "T23:59:59"),
    },
  });

  let credit = 0;
  let debit = 0;

  transactions.forEach((t) => {
    if (t.type === "credit") credit += t.amount;
    if (t.type === "debit") debit += t.amount;
  });

  return NextResponse.json({
    success: true,
    week: { startDate, endDate },
    credit,
    debit,
    profitOrLoss: credit - debit,
    transactions,
  });
}
