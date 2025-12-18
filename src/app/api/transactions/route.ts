import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Transaction from "@/models/Transaction";

const MONGODB_URI = process.env.MONGODB_URI as string;

/* ---------- DB CONNECT ---------- */
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
}

/* ---------- CREATE TRANSACTION ---------- */
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    // Basic validation
    if (!body?.type || !body?.category || !body?.amount || !body?.date) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields",
          data: null,
        },
        { status: 400 } // Bad Request
      );
    }

    const transaction = await Transaction.create(body);

    return NextResponse.json(
      {
        success: true,
        message: "Transaction created successfully",
        data: transaction,
      },
      { status: 201 } // Created
    );
  } catch (error: any) {
    console.error("POST /transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}

/* ---------- GET TRANSACTIONS ---------- */
export async function GET() {
  try {
    await connectDB();

    const transactions = await Transaction.find().sort({ date: -1 });

    return NextResponse.json(
      {
        success: true,
        message: "Transactions fetched successfully",
        data: transactions ?? [], // 👈 always array
      },
      { status: 200 } // OK
    );
  } catch (error: any) {
    console.error("GET /transactions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch transactions",
        data: [], // 👈 never null for app safety
      },
      { status: 500 }
    );
  }
}
