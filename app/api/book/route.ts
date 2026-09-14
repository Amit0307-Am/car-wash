import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

import { parseBookingRequest, persistBooking } from "@/lib/booking/booking-engine";

const upstashRedisUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashRedisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const rateLimiter =
  upstashRedisUrl && upstashRedisToken
    ? new Ratelimit({
        redis: new Redis({
          url: upstashRedisUrl,
          token: upstashRedisToken,
        }),
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "car-wash-bookings",
      })
    : null;

export async function POST(request: Request) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  if (rateLimiter) {
    const { success } = await rateLimiter.limit(clientIp);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many booking attempts. Please wait a moment before trying again.",
        },
        { status: 429 }
      );
    }
  }

  try {
    const body = await request.json();
    const bookingRequest = parseBookingRequest(body);
    const booking = await persistBooking(bookingRequest);

    return NextResponse.json(
      {
        success: true,
        booking,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create your booking right now.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 }
    );
  }
}
