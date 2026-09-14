"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { bookingDates, bookingSlots, business, services, vehicleTypes } from "@/config/business";

const steps = ["Service", "Vehicle", "Date", "Time", "Details", "Review"];

export function BookingStepper() {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(services[1].id);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleTypes[1]);
  const [selectedDate, setSelectedDate] = useState(bookingDates[2]);
  const [selectedSlot, setSelectedSlot] = useState(bookingSlots[3]);
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [bookingId, setBookingId] = useState("");

  const service = useMemo(
    () => services.find((item) => item.id === selectedService) ?? services[1],
    [selectedService]
  );

  const nextStep = () => setStep((current) => Math.min(current + 1, steps.length - 1));
  const prevStep = () => setStep((current) => Math.max(current - 1, 0));

  const canSubmit =
    customerName.trim().length > 1 &&
    mobile.trim().length >= 10 &&
    vehicleModel.trim().length >= 2 &&
    selectedService &&
    selectedVehicle &&
    selectedDate &&
    selectedSlot;

  const handleSubmit = async () => {
    if (!canSubmit) {
      setSubmitMessage("Please complete all required fields before confirming your booking.");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: selectedService,
          vehicleType: selectedVehicle,
          vehicleModel,
          vehicleNumber,
          selectedDate,
          selectedSlot,
          customerName,
          mobile,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create your booking right now.");
      }

      setBookingId(result.booking.id);
      setIsSubmitted(true);
    } catch (error) {
      setSubmitMessage(error instanceof Error ? error.message : "Unable to create your booking right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-4 shadow-2xl shadow-slate-950/40 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-wrap gap-2">
        {steps.map((item, index) => (
          <div
            key={item}
            className={`flex items-center rounded-full border px-3 py-1.5 text-xs font-medium ${
              index === step
                ? "border-amber-400 bg-amber-500 text-slate-950"
                : index < step
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {index + 1}. {item}
          </div>
        ))}
      </div>

      {!isSubmitted ? (
        <>
          {currentStep === "Service" ? (
            <div className="space-y-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-amber-300">Step 1</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Select a service</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {services.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedService(item.id);
                      nextStep();
                    }}
                    className={`rounded-3xl border p-4 text-left transition-all ${
                      selectedService === item.id
                        ? "border-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-white/10 bg-slate-950/40 hover:border-white/20"
                    }`}
                  >
                    <div className={`mb-4 h-24 rounded-2xl bg-gradient-to-br ${item.accent}`} />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{item.name}</h4>
                        <p className="mt-2 text-sm text-slate-300">{item.description}</p>
                      </div>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-amber-200">
                        {item.duration}
                      </span>
                    </div>
                    <p className="mt-4 text-2xl font-bold text-white">{item.startingPrice}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {currentStep === "Vehicle" ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-300">Step 2</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Vehicle details</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {vehicleTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedVehicle(type)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      selectedVehicle === type
                        ? "border-amber-400 bg-amber-500/10 text-amber-200"
                        : "border-white/10 bg-slate-950/40 text-slate-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Car Brand / Model
                  <input
                    value={vehicleModel}
                    onChange={(event) => setVehicleModel(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                    placeholder="Hyundai Creta"
                  />
                </label>
                <label className="block text-sm text-slate-300">
                  Vehicle Number (Optional)
                  <input
                    value={vehicleNumber}
                    onChange={(event) => setVehicleNumber(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                    placeholder="MH 12 AB 1234"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <Button onClick={nextStep}>Continue</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "Date" ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-300">Step 3</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Choose a date</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {bookingDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setSelectedDate(date)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                      selectedDate === date
                        ? "border-amber-400 bg-amber-500/10 text-amber-200"
                        : "border-white/10 bg-slate-950/40 text-slate-300"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{date}</div>
                    <div className="mt-2 text-sm font-medium">Available</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Continue</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "Time" ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-300">Step 4</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Select a time</h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {bookingSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-2xl border px-4 py-3 text-center transition-all ${
                      selectedSlot === slot
                        ? "border-amber-400 bg-amber-500/10 text-amber-200"
                        : "border-white/10 bg-slate-950/40 text-slate-300"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Continue</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "Details" ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-300">Step 5</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Your details</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Name
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                    placeholder="Your name"
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Mobile Number
                  <input
                    value={mobile}
                    onChange={(event) => setMobile(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                    placeholder="98765 43210"
                    type="tel"
                  />
                </label>
              </div>

              <label className="block text-sm text-slate-300">
                Notes (Optional)
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition focus:border-amber-400"
                  placeholder="Tell us if you need a specific finishing touch"
                />
              </label>

              <div className="flex justify-between gap-3">
                <Button variant="secondary" onClick={prevStep}>Back</Button>
                <Button onClick={nextStep}>Review</Button>
              </div>
            </div>
          ) : null}

          {currentStep === "Review" ? (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-amber-300">Step 6</p>
                <h3 className="mt-2 text-2xl font-bold text-white">Review your booking</h3>
              </div>

              <div className="grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-4 md:grid-cols-2">
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="font-medium text-white">Customer:</span> {customerName || "Your name"}</p>
                  <p><span className="font-medium text-white">Mobile:</span> {mobile || "98765 43210"}</p>
                  <p><span className="font-medium text-white">Vehicle:</span> {selectedVehicle}</p>
                  <p><span className="font-medium text-white">Car model:</span> {vehicleModel || "Hyundai Creta"}</p>
                  <p><span className="font-medium text-white">Service:</span> {service.name}</p>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p><span className="font-medium text-white">Date:</span> {selectedDate}</p>
                  <p><span className="font-medium text-white">Time:</span> {selectedSlot}</p>
                  <p><span className="font-medium text-white">Estimated price:</span> {service.startingPrice}</p>
                  <p><span className="font-medium text-white">Vehicle number:</span> {vehicleNumber || "Not provided"}</p>
                  <p><span className="font-medium text-white">Notes:</span> {notes || "No notes provided"}</p>
                </div>
              </div>

              <div className="space-y-4">
                {submitMessage ? (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {submitMessage}
                  </div>
                ) : null}

                <div className="flex justify-between gap-3">
                  <Button variant="secondary" onClick={prevStep}>Back</Button>
                  <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className={!canSubmit || isSubmitting ? "opacity-60" : ""}>
                    {isSubmitting ? "Confirming..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-emerald-200">
            Booking confirmed
          </p>
          <h3 className="mt-3 text-3xl font-bold text-white">Your slot is reserved</h3>
          <p className="mt-3 text-slate-200">We’ve saved your booking request and your service is now on the schedule.</p>

          <div className="mt-6 grid gap-4 rounded-3xl border border-white/10 bg-slate-950/40 p-5 text-left md:grid-cols-2">
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="font-medium text-white">Booking ID:</span> {bookingId}</p>
              <p><span className="font-medium text-white">Customer:</span> {customerName}</p>
              <p><span className="font-medium text-white">Service:</span> {service.name}</p>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p><span className="font-medium text-white">Vehicle:</span> {selectedVehicle}</p>
              <p><span className="font-medium text-white">Date:</span> {selectedDate}</p>
              <p><span className="font-medium text-white">Time:</span> {selectedSlot}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href={`https://wa.me/${business.whatsapp.replace(/\D/g, "")}`} variant="secondary">
              WhatsApp
            </Button>
            <Button href={`tel:${business.phone.replace(/\s+/g, "")}`} variant="secondary">
              Call
            </Button>
            <Button href={business.mapsUrl} target="_blank" rel="noreferrer" variant="secondary">
              Get Directions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
