"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

import AddProductForm from "@/app/components/admin/AddProductForm";

import ProductManager, {
  Product,
} from "@/app/components/admin/ProductManager";

import ReviewManager, {
  Review,
} from "@/app/components/admin/ReviewManager";
type Tab =
  | "overview"
  | "products"
  | "add-product"
  | "reviews";

export default function AdminDashboard() {
  const router = useRouter();

  const [tab, setTab] =
    useState<Tab>("overview");

  const [checkingAccess, setCheckingAccess] =
    useState(true);

  const [loadingData, setLoadingData] =
    useState(true);

  const [adminEmail, setAdminEmail] =
    useState("");

  const [products, setProducts] =
    useState<Product[]>([]);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // ------------------------------------------
  // LOAD PRODUCTS + REVIEWS
  // ------------------------------------------

  const loadData =
    useCallback(async () => {
      setLoadingData(true);

      const [
        productsResult,
        reviewsResult,
      ] =
        await Promise.all([
          supabase
            .from("products")
            .select("*")
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            ),

          supabase
            .from(
              "customer_reviews"
            )
            .select("*")
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            ),
        ]);

      if (
        productsResult.error
      ) {
        setError(
          productsResult
            .error
            .message
        );
      }

      if (
        reviewsResult.error
      ) {
        setError(
          reviewsResult
            .error
            .message
        );
      }

      setProducts(
        (
          productsResult.data ??
          []
        ) as Product[]
      );

      setReviews(
        (
          reviewsResult.data ??
          []
        ) as Review[]
      );

      setLoadingData(false);
    }, []);

  // ------------------------------------------
  // PROTECT ADMIN DASHBOARD
  // ------------------------------------------

  useEffect(() => {
    const checkAdmin =
      async () => {
        const {
          data: {
            user,
          },
        } =
          await supabase.auth
            .getUser();

        if (!user) {
          router.replace(
            "/admin"
          );

          return;
        }

        const {
          data: admin,
          error:
            adminError,
        } =
          await supabase
            .from(
              "admins"
            )
            .select(
              "user_id"
            )
            .eq(
              "user_id",
              user.id
            )
            .maybeSingle();

        if (
          adminError ||
          !admin
        ) {
          await supabase.auth
            .signOut();

          router.replace(
            "/admin"
          );

          return;
        }

        setAdminEmail(
          user.email ??
            "Administrator"
        );

        setCheckingAccess(
          false
        );

        await loadData();
      };

    checkAdmin();
  }, [
    loadData,
    router,
  ]);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const logout =
    async () => {
      await supabase.auth
        .signOut();

      router.replace(
        "/admin"
      );
    };

  // ------------------------------------------
  // DASHBOARD STATISTICS
  // ------------------------------------------

  const totalProducts =
    products.length;

  const availableProducts =
    products.filter(
      (product) =>
        product.availability ===
        "Available"
    ).length;

  const lipaProducts =
    products.filter(
      (product) =>
        product
          .lipa_mdogo_mdogo_available
    ).length;

  const featuredProducts =
    products.filter(
      (product) =>
        product.featured
    ).length;

  const pendingReviews =
    reviews.filter(
      (review) =>
        !review.approved
    ).length;

  // ------------------------------------------
  // LOADING ADMIN SESSION
  // ------------------------------------------

  if (
    checkingAccess
  ) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#0798ef]" />

          <p className="mt-4 font-semibold text-slate-600">
            Checking administrator access...
          </p>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-900">

      {/* ======================================
          HEADER
      ====================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">

          <Image
            src="/images/logo/smart-tech-logo.jpg"
            alt="Smart Tech"
            width={180}
            height={90}
            priority
            className="h-14 w-auto object-contain"
          />

          <div>

            <p className="font-black text-[#0b2947]">
              Admin Dashboard
            </p>

            <p className="text-xs text-slate-500">
              {adminEmail}
            </p>

          </div>


          <div className="ml-auto flex flex-wrap gap-2">

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50"
            >
              View Website
            </a>


            <button
              type="button"
              onClick={
                logout
              }
              className="rounded-xl bg-[#06365b] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#082d4c]"
            >
              Logout
            </button>

          </div>

        </div>

      </header>


      {/* ======================================
          DASHBOARD
      ====================================== */}

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[230px_1fr]">

        {/* SIDEBAR */}

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">

          <p className="px-4 pb-3 pt-2 text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Management
          </p>


          <button
            type="button"
            onClick={() =>
              setTab(
                "overview"
              )
            }
            className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
              tab ===
              "overview"
                ? "bg-[#0798ef] text-white shadow-md"
                : "text-slate-600 hover:bg-sky-50 hover:text-[#0798ef]"
            }`}
          >
            Overview
          </button>


          <button
            type="button"
            onClick={() =>
              setTab(
                "products"
              )
            }
            className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
              tab ===
              "products"
                ? "bg-[#0798ef] text-white shadow-md"
                : "text-slate-600 hover:bg-sky-50 hover:text-[#0798ef]"
            }`}
          >
            Products
          </button>


          <button
            type="button"
            onClick={() =>
              setTab(
                "add-product"
              )
            }
            className={`mb-1 w-full rounded-xl px-4 py-3 text-left text-sm font-black transition ${
              tab ===
              "add-product"
                ? "bg-[#0798ef] text-white shadow-md"
                : "text-slate-600 hover:bg-sky-50 hover:text-[#0798ef]"
            }`}
          >
            + Add Product
          </button>


          <button
            type="button"
            onClick={() =>
              setTab(
                "reviews"
              )
            }
            className={`mb-1 flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-black transition ${
              tab ===
              "reviews"
                ? "bg-[#0798ef] text-white shadow-md"
                : "text-slate-600 hover:bg-sky-50 hover:text-[#0798ef]"
            }`}
          >

            <span>
              Reviews
            </span>

            {pendingReviews >
              0 && (

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  tab ===
                  "reviews"
                    ? "bg-white text-[#0798ef]"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {
                  pendingReviews
                }
              </span>

            )}

          </button>

        </aside>


        {/* MAIN CONTENT */}

        <section className="min-w-0">

          {/* ERROR */}

          {error && (

            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
            >
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {message && (

            <div
              role="status"
              className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700"
            >
              {message}
            </div>

          )}


          {/* ==================================
              OVERVIEW
          ================================== */}

          {tab ===
            "overview" && (

            <div>

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0798ef]">
                Smart Tech Administration
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#0b2947] sm:text-4xl">
                Dashboard Overview
              </h1>

              <p className="mt-2 text-slate-500">
                Manage your products, stock,
                payment plans and customer
                feedback.
              </p>


              {/* STATISTICS */}

              <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

                <StatCard
                  title="Total Products"
                  value={
                    totalProducts
                  }
                />

                <StatCard
                  title="Available"
                  value={
                    availableProducts
                  }
                />

                <StatCard
                  title="Lipa Mdogo Mdogo"
                  value={
                    lipaProducts
                  }
                />

                <StatCard
                  title="Featured"
                  value={
                    featuredProducts
                  }
                />

                <StatCard
                  title="Pending Reviews"
                  value={
                    pendingReviews
                  }
                />

              </div>


              {/* QUICK ACTIONS */}

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h2 className="text-xl font-black text-[#0b2947]">
                  Quick Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Common Smart Tech management tasks.
                </p>


                <div className="mt-5 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "add-product"
                      )
                    }
                    className="rounded-xl bg-[#0798ef] px-5 py-3 font-black text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    + Add Product
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "products"
                      )
                    }
                    className="rounded-xl border border-slate-300 px-5 py-3 font-black transition hover:bg-slate-50"
                  >
                    Manage Products
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      setTab(
                        "reviews"
                      )
                    }
                    className="rounded-xl border border-slate-300 px-5 py-3 font-black transition hover:bg-slate-50"
                  >
                    Customer Reviews
                  </button>

                </div>

              </section>


              {/* BUSINESS SUMMARY */}

              <section className="mt-6 grid gap-4 md:grid-cols-3">

                <div className="rounded-2xl bg-[#dff3ff] p-6">

                  <p className="text-3xl">
                    🏠
                  </p>

                  <h3 className="mt-3 font-black text-[#0b2947]">
                    Home Appliances
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {
                      products.filter(
                        (
                          product
                        ) =>
                          product.category ===
                          "Home Appliances"
                      ).length
                    }{" "}
                    product(s)
                  </p>

                </div>


                <div className="rounded-2xl bg-[#fff1df] p-6">

                  <p className="text-3xl">
                    🛋️
                  </p>

                  <h3 className="mt-3 font-black text-[#0b2947]">
                    Furniture
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {
                      products.filter(
                        (
                          product
                        ) =>
                          product.category ===
                          "Furniture"
                      ).length
                    }{" "}
                    product(s)
                  </p>

                </div>


                <div className="rounded-2xl bg-[#e6f6ff] p-6">

                  <p className="text-3xl">
                    ☀️
                  </p>

                  <h3 className="mt-3 font-black text-[#0b2947]">
                    Solar Systems
                  </h3>

                  <p className="mt-1 text-sm text-slate-600">
                    {
                      products.filter(
                        (
                          product
                        ) =>
                          product.category ===
                          "Solar Systems"
                      ).length
                    }{" "}
                    product(s)
                  </p>

                </div>

              </section>

            </div>

          )}


          {/* ==================================
              PRODUCTS
          ================================== */}

          {tab ===
            "products" && (

            <div>

              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">

                <div>

                  <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0798ef]">
                    Catalogue
                  </p>

                  <h1 className="mt-2 text-3xl font-black text-[#0b2947]">
                    Products
                  </h1>

                  <p className="mt-2 text-slate-500">
                    Manage the products currently stored
                    in Smart Tech.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() =>
                    setTab(
                      "add-product"
                    )
                  }
                  className="rounded-xl bg-[#0798ef] px-5 py-3 font-black text-white"
                >
                  + Add Product
                </button>

              </div>


              <ProductManager
                products={
                  products
                }
                loading={
                  loadingData
                }
                onChanged={
                  loadData
                }
                onMessage={
                  setMessage
                }
                onError={
                  setError
                }
              />

            </div>

          )}


          {/* ==================================
              ADD PRODUCT
          ================================== */}

          {tab ===
            "add-product" && (

            <div>

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0798ef]">
                Catalogue Management
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#0b2947]">
                Add Product
              </h1>

              <p className="mt-2 mb-7 text-slate-500">
                Add an actual product for sale on the
                Smart Tech website.
              </p>


              <AddProductForm
                onSaved={
                  async () => {
                    await loadData();

                    setTab(
                      "products"
                    );
                  }
                }
                onMessage={
                  setMessage
                }
                onError={
                  setError
                }
              />

            </div>

          )}


          {/* ==================================
              CUSTOMER REVIEWS
          ================================== */}

          {tab ===
            "reviews" && (

            <div>

              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#0798ef]">
                Customer Experience
              </p>

              <h1 className="mt-2 text-3xl font-black text-[#0b2947]">
                Customer Reviews
              </h1>

              <p className="mt-2 mb-7 text-slate-500">
                Approve customer feedback before it
                appears publicly on Smart Tech.
              </p>


              <ReviewManager
                reviews={
                  reviews
                }
                loading={
                  loadingData
                }
                onChanged={
                  loadData
                }
                onMessage={
                  setMessage
                }
                onError={
                  setError
                }
              />

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

// =============================================
// STATISTIC CARD
// =============================================

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <p className="text-sm font-bold text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-black text-[#0798ef]">
        {value}
      </p>
    </div>
  );
}
