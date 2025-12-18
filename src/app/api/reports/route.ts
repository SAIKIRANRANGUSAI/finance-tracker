import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Missing params → still 200
    if (!from || !to) {
      return NextResponse.json(
        {
          success: false,
          message: "from and to dates are required (YYYY-MM-DD)",
          data: {
            from: null,
            to: null,
            totalCredit: 0,
            totalDebit: 0,
            profitOrLoss: 0,
            transactions: [],
          },
        },
        { status: 200 }
      );
    }

    const filter = {
      date: {
        $gte: new Date(from),
        $lte: new Date(`${to}T23:59:59`),
      },
    };

    const transactions = await Transaction.find(filter).sort({ date: 1 });

    let totalCredit = 0;
    let totalDebit = 0;

    transactions.forEach((t) => {
      if (t.type === "credit") totalCredit += t.amount;
      if (t.type === "debit") totalDebit += t.amount;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Report fetched successfully",
        data: {
          from,
          to,
          totalCredit,
          totalDebit,
          profitOrLoss: totalCredit - totalDebit,
          transactions: transactions ?? [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /reports error:", error);

    // Error → still 200
    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch report",
        data: {
          from: null,
          to: null,
          totalCredit: 0,
          totalDebit: 0,
          profitOrLoss: 0,
          transactions: [],
        },
      },
      { status: 200 }
    );
  }
}
