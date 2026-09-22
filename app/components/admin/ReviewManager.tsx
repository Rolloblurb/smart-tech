"use client";

import { supabase } from "@/lib/supabase";

export type Review = {
  id: string;
  customer_name: string;
  rating: number;
  feedback: string;
  approved: boolean;
  created_at: string;
};

type Props = {
  reviews: Review[];
  loading: boolean;

  onChanged: () => Promise<void> | void;

  onMessage: (
    message: string
  ) => void;

  onError: (
    message: string
  ) => void;
};

export default function ReviewManager({
  reviews,
  loading,
  onChanged,
  onMessage,
  onError,
}: Props) {
  // -----------------------------------------
  // APPROVE REVIEW
  // -----------------------------------------

  const approveReview = async (
    review: Review
  ) => {
    onError("");
    onMessage("");

    const {
      error,
    } = await supabase
      .from(
        "customer_reviews"
      )
      .update({
        approved: true,
      })
      .eq(
        "id",
        review.id
      );

    if (error) {
      onError(
        error.message
      );

      return;
    }

    onMessage(
      `${review.customer_name}'s review was approved.`
    );

    await onChanged();
  };

  // -----------------------------------------
  // UNAPPROVE REVIEW
  // -----------------------------------------

  const unapproveReview = async (
    review: Review
  ) => {
    onError("");
    onMessage("");

    const {
      error,
    } = await supabase
      .from(
        "customer_reviews"
      )
      .update({
        approved: false,
      })
      .eq(
        "id",
        review.id
      );

    if (error) {
      onError(
        error.message
      );

      return;
    }

    onMessage(
      `${review.customer_name}'s review was hidden from the public website.`
    );

    await onChanged();
  };

  // -----------------------------------------
  // DELETE REVIEW
  // -----------------------------------------

  const deleteReview = async (
    review: Review
  ) => {
    const confirmed =
      window.confirm(
        `Delete the review from ${review.customer_name}?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    onError("");
    onMessage("");

    const {
      error,
    } = await supabase
      .from(
        "customer_reviews"
      )
      .delete()
      .eq(
        "id",
        review.id
      );

    if (error) {
      onError(
        error.message
      );

      return;
    }

    onMessage(
      "Customer review deleted."
    );

    await onChanged();
  };

  // -----------------------------------------
  // DATE FORMAT
  // -----------------------------------------

  const formatDate = (
    value: string
  ) => {
    return new Intl.DateTimeFormat(
      "en-KE",
      {
        dateStyle:
          "medium",

        timeStyle:
          "short",
      }
    ).format(
      new Date(
        value
      )
    );
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0798ef]" />

        <p className="mt-4 font-semibold text-slate-500">
          Loading customer reviews...
        </p>

      </div>
    );
  }

  // -----------------------------------------
  // NO REVIEWS
  // -----------------------------------------

  if (
    reviews.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

        <div className="text-5xl">
          💬
        </div>

        <h2 className="mt-4 text-xl font-black text-[#0b2947]">
          No Customer Reviews Yet
        </h2>

        <p className="mt-2 text-slate-500">
          Customer feedback submitted
          through the Smart Tech website
          will appear here for approval.
        </p>

      </div>
    );
  }

  // -----------------------------------------
  // REVIEW LIST
  // -----------------------------------------

  return (
    <div className="grid gap-4">

      {reviews.map(
        (
          review
        ) => (

          <article
            key={
              review.id
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
          >

            <div className="flex flex-wrap items-start justify-between gap-4">

              <div>

                <h3 className="text-lg font-black text-[#0b2947]">

                  {
                    review.customer_name
                  }

                </h3>


                <div className="mt-1 text-lg tracking-wide text-amber-500">

                  {"★".repeat(
                    review.rating
                  )}

                  <span className="text-slate-200">

                    {"★".repeat(
                      5 -
                        review.rating
                    )}

                  </span>

                </div>


                <p className="mt-1 text-xs text-slate-400">

                  {
                    formatDate(
                      review.created_at
                    )
                  }

                </p>

              </div>


              <span
                className={`rounded-full px-3 py-1 text-xs font-black ${
                  review.approved
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >

                {review.approved
                  ? "Approved"
                  : "Pending Approval"}

              </span>

            </div>


            <blockquote className="mt-5 rounded-xl bg-slate-50 p-4 leading-7 text-slate-600">

              “{
                review.feedback
              }”

            </blockquote>


            <div className="mt-5 flex flex-wrap gap-2">

              {!review.approved ? (

                <button
                  type="button"
                  onClick={() =>
                    approveReview(
                      review
                    )
                  }
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                >

                  Approve Review

                </button>

              ) : (

                <button
                  type="button"
                  onClick={() =>
                    unapproveReview(
                      review
                    )
                  }
                  className="rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
                >

                  Hide Review

                </button>

              )}


              <button
                type="button"
                onClick={() =>
                  deleteReview(
                    review
                  )
                }
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >

                Delete

              </button>

            </div>

          </article>

        )
      )}

    </div>
  );
}