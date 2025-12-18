import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const filter: any = {};

  if (from && to) {
    filter.date = {
      $gte: new Date(from),
      $lte: new Date(to + "T23:59:59"),
    };
  }

  const transactions = await Transaction.find(filter).sort({ date: 1 });

  let totalCredit = 0;
  let totalDebit = 0;

  transactions.forEach((t) => {
    if (t.type === "credit") totalCredit += t.amount;
    if (t.type === "debit") totalDebit += t.amount;
  });

  return NextResponse.json({
    success: true,
    from,
    to,
    totalCredit,
    totalDebit,
    profitOrLoss: totalCredit - totalDebit,
    transactions,
  });
}
