"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  onSaved: () => Promise<void> | void;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
};

const initialForm = {
  name: "",
  category: "Home Appliances",
  subcategory: "",
  brand: "",
  model: "",
  description: "",
  specifications: "",
  cashPrice: "",
  stockQuantity: "1",
  availability: "Available",
  featured: false,

  lipaAvailable: false,
  depositAmount: "",
  dailyPayment: "",
  paymentDays: "",
};

export default function AddProductForm({
  onSaved,
  onMessage,
  onError,
}: Props) {
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#0798ef] focus:ring-4 focus:ring-sky-100";

  const totalPayable =
    form.lipaAvailable &&
    form.depositAmount &&
    form.dailyPayment &&
    form.paymentDays
      ? Number(form.depositAmount) +
        Number(form.dailyPayment) * Number(form.paymentDays)
      : 0;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaving(true);
    onError("");
    onMessage("");

    try {
      if (
        form.lipaAvailable &&
        (!form.depositAmount ||
          !form.dailyPayment ||
          !form.paymentDays)
      ) {
        throw new Error(
          "Complete all Lipa Mdogo Mdogo payment fields."
        );
      }

      // ---------------------------------------
      // CREATE PRODUCT
      // ---------------------------------------

      const { data: product, error: productError } =
        await supabase
          .from("products")
          .insert({
            name: form.name.trim(),

            category: form.category,

            subcategory:
              form.subcategory.trim() || null,

            brand:
              form.brand.trim() || null,

            model:
              form.model.trim() || null,

            description:
              form.description.trim() || null,

            specifications:
              form.specifications.trim() || null,

            cash_price:
              Number(form.cashPrice),

            stock_quantity:
              Number(form.stockQuantity),

            availability:
              form.availability,

            featured:
              form.featured,

            lipa_mdogo_mdogo_available:
              form.lipaAvailable,

            deposit_amount:
              form.lipaAvailable
                ? Number(form.depositAmount)
                : null,

            daily_payment:
              form.lipaAvailable
                ? Number(form.dailyPayment)
                : null,

            payment_days:
              form.lipaAvailable
                ? Number(form.paymentDays)
                : null,

            total_payable:
              form.lipaAvailable
                ? totalPayable
                : null,
          })
          .select("id,name")
          .single();

      if (productError) {
        throw productError;
      }

      // ---------------------------------------
      // UPLOAD PRODUCT IMAGES
      // ---------------------------------------

      for (
        let index = 0;
        index < images.length;
        index += 1
      ) {
        const file = images[index];

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const fileName =
          `${crypto.randomUUID()}.${extension}`;

        const storagePath =
          `${product.id}/${fileName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("product-images")
            .upload(
              storagePath,
              file,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } =
          supabase.storage
            .from("product-images")
            .getPublicUrl(storagePath);

        const { error: imageError } =
          await supabase
            .from("product_images")
            .insert({
              product_id:
                product.id,

              image_url:
                publicUrlData.publicUrl,

              display_order:
                index,
            });

        if (imageError) {
          throw imageError;
        }
      }

      onMessage(
        `${product.name} was added successfully.`
      );

      setForm(initialForm);
      setImages([]);

      await onSaved();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to add the product."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >

      {/* PRODUCT DETAILS */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-black text-[#0b2947]">
          Product Information
        </h2>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <label className="text-sm font-bold">
            Product Name

            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name:
                    event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. Samsung 55-inch Smart TV"
            />
          </label>

          <label className="text-sm font-bold">
            Category

            <select
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value,
                })
              }
              className={inputClass}
            >
              <option>
                Home Appliances
              </option>

              <option>
                Furniture
              </option>

              <option>
                Solar Systems
              </option>
            </select>
          </label>

          <label className="text-sm font-bold">
            Subcategory

            <input
              value={form.subcategory}
              onChange={(event) =>
                setForm({
                  ...form,
                  subcategory:
                    event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. Televisions"
            />
          </label>

          <label className="text-sm font-bold">
            Brand

            <input
              value={form.brand}
              onChange={(event) =>
                setForm({
                  ...form,
                  brand:
                    event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. Samsung"
            />
          </label>

          <label className="text-sm font-bold">
            Model

            <input
              value={form.model}
              onChange={(event) =>
                setForm({
                  ...form,
                  model:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </label>

          <label className="text-sm font-bold">
            Cash Price (KSh)

            <input
              required
              min="0"
              type="number"
              value={form.cashPrice}
              onChange={(event) =>
                setForm({
                  ...form,
                  cashPrice:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </label>

          <label className="text-sm font-bold">
            Stock Quantity

            <input
              required
              min="0"
              type="number"
              value={form.stockQuantity}
              onChange={(event) =>
                setForm({
                  ...form,
                  stockQuantity:
                    event.target.value,
                })
              }
              className={inputClass}
            />
          </label>

          <label className="text-sm font-bold">
            Availability

            <select
              value={form.availability}
              onChange={(event) =>
                setForm({
                  ...form,
                  availability:
                    event.target.value,
                })
              }
              className={inputClass}
            >
              <option>
                Available
              </option>

              <option>
                Out of Stock
              </option>

              <option>
                Coming Soon
              </option>
            </select>
          </label>

        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <label className="text-sm font-bold">
            Product Description

            <textarea
              rows={5}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value,
                })
              }
              className={inputClass}
              placeholder="Describe the product..."
            />
          </label>

          <label className="text-sm font-bold">
            Specifications

            <textarea
              rows={5}
              value={form.specifications}
              onChange={(event) =>
                setForm({
                  ...form,
                  specifications:
                    event.target.value,
                })
              }
              className={inputClass}
              placeholder="Capacity, size, colour, warranty, power..."
            />
          </label>

        </div>

        <label className="mt-5 flex items-center gap-3 font-bold">

          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm({
                ...form,
                featured:
                  event.target.checked,
              })
            }
            className="h-5 w-5"
          />

          Feature this product on the website

        </label>

      </section>


      {/* LIPA MDOGO MDOGO */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={
              form.lipaAvailable
            }
            onChange={(event) =>
              setForm({
                ...form,
                lipaAvailable:
                  event.target.checked,
              })
            }
            className="h-5 w-5"
          />

          <span>
            <b>
              Lipa Mdogo Mdogo Available
            </b>

            <span className="block text-sm font-normal text-slate-500">
              Deposit + Daily Payments
            </span>
          </span>

        </label>


        {form.lipaAvailable && (

          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <label className="text-sm font-bold">
              Deposit (KSh)

              <input
                required
                min="0"
                type="number"
                value={
                  form.depositAmount
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    depositAmount:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </label>


            <label className="text-sm font-bold">
              Daily Payment (KSh)

              <input
                required
                min="0"
                type="number"
                value={
                  form.dailyPayment
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    dailyPayment:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </label>


            <label className="text-sm font-bold">
              Number of Days

              <input
                required
                min="1"
                type="number"
                value={
                  form.paymentDays
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    paymentDays:
                      event.target.value,
                  })
                }
                className={inputClass}
              />
            </label>


            <div>

              <p className="text-sm font-bold">
                Total Payable
              </p>

              <div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-800">

                KSh{" "}

                {new Intl.NumberFormat(
                  "en-KE"
                ).format(
                  totalPayable
                )}

              </div>

            </div>

          </div>

        )}

      </section>


      {/* PRODUCT IMAGES */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <h2 className="text-xl font-black text-[#0b2947]">
          Product Photos
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Upload clear photographs of the actual product.
          The first image will be treated as the primary image.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) =>
            setImages(
              Array.from(
                event.target.files ??
                  []
              )
            )
          }
          className="mt-5 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
        />

        {images.length > 0 && (

          <p className="mt-3 font-bold text-[#0798ef]">

            {images.length} image
            {images.length !== 1
              ? "s"
              : ""}{" "}
            selected

          </p>

        )}

      </section>


      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-[#0798ef] px-7 py-3.5 font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >

        {saving
          ? "Saving Product..."
          : "Add Product"}

      </button>

    </form>
  );
}