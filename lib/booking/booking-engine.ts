import { z } from "zod";

import { bookingDates, bookingSlots, services, vehicleTypes } from "@/config/business";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const bookingRequestSchema = z.object({
  serviceId: z.string().trim().min(1, "Please choose a service."),
  vehicleType: z.string().trim().min(1, "Please choose a vehicle type."),
  vehicleModel: z.string().trim().min(2, "Please enter the car brand and model."),
  vehicleNumber: z.string().trim().max(30).optional().transform((value) => value || undefined),
  selectedDate: z.string().trim().min(1, "Please choose a date."),
  selectedSlot: z.string().trim().min(1, "Please choose a time."),
  customerName: z.string().trim().min(2, "Please enter your name."),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{10,15}$/, "Please enter a valid mobile number.")
    .transform((value) => value.replace(/\s+/g, " ").trim()),
  notes: z.string().trim().max(500).optional().transform((value) => value || undefined),
});

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export type BookingRecord = BookingRequest & {
  id: string;
  bookingCode: string;
  status: "pending";
  createdAt: string;
};

export function parseBookingRequest(input: unknown): BookingRequest {
  const parsed = bookingRequestSchema.safeParse(input);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.path.join(".") || issue.message)
      .join(", ");

    throw new Error(`Invalid booking details: ${message}`);
  }

  const data = parsed.data;

  if (!services.some((service) => service.id === data.serviceId)) {
    throw new Error("Invalid service selection.");
  }

  if (!vehicleTypes.includes(data.vehicleType)) {
    throw new Error("Invalid vehicle type selection.");
  }

  if (!bookingDates.includes(data.selectedDate)) {
    throw new Error("Selected date is unavailable.");
  }

  if (!bookingSlots.includes(data.selectedSlot)) {
    throw new Error("Selected time slot is unavailable.");
  }

  return {
    ...data,
    vehicleModel: data.vehicleModel.trim(),
    vehicleNumber: data.vehicleNumber?.trim(),
    customerName: data.customerName.trim(),
    mobile: data.mobile.trim(),
    notes: data.notes?.trim(),
  };
}

export async function persistBooking(input: BookingRequest): Promise<BookingRecord> {
  const supabase = createServerSupabaseClient();

  const selectedService = services.find((service) => service.id === input.serviceId);

  if (!selectedService) {
    throw new Error("Invalid service selection.");
  }

  const serviceRecord = await findServiceRecord(supabase, selectedService.name);

  if (!serviceRecord) {
    throw new Error("Selected service was not found in the Supabase service catalog.");
  }

  const vehicleTypeRecord = await findVehicleTypeRecord(supabase, input.vehicleType);

  if (!vehicleTypeRecord) {
    throw new Error("Selected vehicle type was not found in the Supabase vehicle catalog.");
  }

  const bookingCode = `CW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const rpcResult = await supabase.rpc("reserve_booking_slot", {
    p_booking_code: bookingCode,
    p_customer_name: input.customerName,
    p_mobile_number: input.mobile,
    p_vehicle_type_id: vehicleTypeRecord.id,
    p_vehicle_model: input.vehicleModel,
    p_vehicle_number: input.vehicleNumber ?? null,
    p_service_id: serviceRecord.id,
    p_booking_date: input.selectedDate,
    p_booking_time: input.selectedSlot,
    p_price_snapshot: parsePrice(selectedService.startingPrice),
    p_notes: input.notes ?? null,
    p_status: "pending",
  });

  if (rpcResult.error) {
    const message = rpcResult.error.message || "Unable to reserve the requested time slot.";

    throw new Error(message);
  }

  const bookingRow = await supabase
    .from("bookings")
    .select("id, booking_code, created_at")
    .eq("id", rpcResult.data)
    .single();

  if (bookingRow.error || !bookingRow.data) {
    throw new Error(bookingRow.error?.message || "Unable to load the created booking record.");
  }

  return {
    ...input,
    id: bookingRow.data.id,
    bookingCode: bookingRow.data.booking_code,
    status: "pending",
    createdAt: bookingRow.data.created_at,
  };
}

async function findServiceRecord(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  serviceName: string
) {
  const result = await supabase.from("services").select("id").eq("name", serviceName).limit(1);

  if (result.error) {
    throw new Error(result.error.message || "Unable to load service catalog from Supabase.");
  }

  return result.data?.[0] ?? null;
}

async function findVehicleTypeRecord(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  vehicleType: string
) {
  const result = await supabase.from("vehicle_types").select("id").eq("name", vehicleType).limit(1);

  if (result.error) {
    throw new Error(result.error.message || "Unable to load vehicle catalog from Supabase.");
  }

  return result.data?.[0] ?? null;
}

function parsePrice(startingPrice: string): number {
  const numericValue = Number.parseFloat(startingPrice.replace(/[^\d.]/g, ""));

  return Number.isFinite(numericValue) ? numericValue : 0;
}
