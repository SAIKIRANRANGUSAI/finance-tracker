import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // Missing params → still 200
    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "start and end dates are required (YYYY-MM-DD)",
          data: {
            week: null,
            credit: 0,
            debit: 0,
            profitOrLoss: 0,
            transactions: [],
          },
        },
        { status: 200 }
      );
    }

    const transactions = await Transaction.find({
      date: {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59`),
      },
    }).sort({ date: 1 });

    let credit = 0;
    let debit = 0;

    transactions.forEach((t) => {
      if (t.type === "credit") credit += t.amount;
      if (t.type === "debit") debit += t.amount;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Weekly report fetched successfully",
        data: {
          week: {
            startDate,
            endDate,
          },
          credit,
          debit,
          profitOrLoss: credit - debit,
          transactions: transactions ?? [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Weekly report error:", error);

    // Error → still 200
    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch weekly report",
        data: {
          week: null,
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
