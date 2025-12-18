import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const month = Number(searchParams.get("month")); // 1–12
    const year = Number(searchParams.get("year"));

    // Missing or invalid params → still 200
    if (!month || !year || month < 1 || month > 12) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid month (1–12) and year are required",
          data: {
            month: null,
            year: null,
            credit: 0,
            debit: 0,
            profitOrLoss: 0,
            transactions: [],
          },
        },
        { status: 200 }
      );
    }

    // Month date range
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59);

    const transactions = await Transaction.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: 1 });

    let credit = 0;
    let debit = 0;

    for (const t of transactions) {
      if (t.type === "credit") credit += t.amount;
      if (t.type === "debit") debit += t.amount;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Monthly report fetched successfully",
        data: {
          month,
          year,
          credit,
          debit,
          profitOrLoss: credit - debit,
          transactions: transactions ?? [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /reports/monthly error:", error);

    // Error → still 200
    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch monthly report",
        data: {
          month: null,
          year: null,
          credit: 0,
          debit: 0,
          profitOrLoss: 0,
          transactions: [],
        },
      },
      { status: 200 }
    );
  }
}
