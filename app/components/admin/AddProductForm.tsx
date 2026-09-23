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

  if (saving) return;

  setSaving(true);
  onError("");
  onMessage("");

  try {
    // ==================================================
    // BASIC PRODUCT VALIDATION
    // ==================================================

    const name = form.name.trim();
    const category = form.category.trim();
    const cashPrice = Number(form.cashPrice);
    const stockQuantity = Number(form.stockQuantity);

    if (!name) {
      throw new Error(
        "Please enter the product name."
      );
    }

    if (!category) {
      throw new Error(
        "Please select a product category."
      );
    }

    if (
      !form.cashPrice ||
      Number.isNaN(cashPrice) ||
      cashPrice < 0
    ) {
      throw new Error(
        "Please enter a valid cash price."
      );
    }

    if (
      form.stockQuantity === "" ||
      Number.isNaN(stockQuantity) ||
      stockQuantity < 0
    ) {
      throw new Error(
        "Please enter a valid stock quantity."
      );
    }

    // ==================================================
    // LIPA MDOGO MDOGO
    // ==================================================

    let depositAmount: number | null = null;
    let dailyPayment: number | null = null;
    let paymentDays: number | null = null;
    let calculatedTotal: number | null = null;

    if (form.lipaAvailable) {
      if (
        !form.depositAmount ||
        !form.dailyPayment ||
        !form.paymentDays
      ) {
        throw new Error(
          "Complete all Lipa Mdogo Mdogo payment fields."
        );
      }

      depositAmount =
        Number(form.depositAmount);

      dailyPayment =
        Number(form.dailyPayment);

      paymentDays =
        Number(form.paymentDays);

      if (
        Number.isNaN(depositAmount) ||
        depositAmount < 0
      ) {
        throw new Error(
          "Please enter a valid deposit amount."
        );
      }

      if (
        Number.isNaN(dailyPayment) ||
        dailyPayment <= 0
      ) {
        throw new Error(
          "Please enter a valid daily payment."
        );
      }

      if (
        Number.isNaN(paymentDays) ||
        paymentDays <= 0
      ) {
        throw new Error(
          "Please enter a valid number of payment days."
        );
      }

      calculatedTotal =
        depositAmount +
        dailyPayment * paymentDays;
    }

    // ==================================================
    // IMAGE VALIDATION
    // ==================================================

    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const maxFileSize =
      5 * 1024 * 1024;

    for (const file of images) {
      if (
        !allowedImageTypes.includes(
          file.type
        )
      ) {
        throw new Error(
          `${file.name} is not supported. Use JPG, PNG or WebP.`
        );
      }

      if (
        file.size > maxFileSize
      ) {
        throw new Error(
          `${file.name} is larger than 5 MB.`
        );
      }
    }

    // ==================================================
    // DEBUG - SHOW EXACT DATA BEING SENT
    // ==================================================

    console.log(
      "CATEGORY BEING SENT:",
      JSON.stringify(category)
    );

    console.log(
      "FORM CATEGORY BEFORE TRIM:",
      JSON.stringify(form.category)
    );

    console.log(
      "PRODUCT DATA:",
      {
        name,
        category,
        subcategory:
          form.subcategory.trim() || null,
        brand:
          form.brand.trim() || null,
        model:
          form.model.trim() || null,
        cash_price:
          cashPrice,
        stock_quantity:
          stockQuantity,
        availability:
          form.availability,
        featured:
          form.featured,
        lipa_mdogo_mdogo_available:
          form.lipaAvailable,
        deposit_amount:
          depositAmount,
        daily_payment:
          dailyPayment,
        payment_days:
          paymentDays,
        total_payable:
          calculatedTotal,
      }
    );

    // ==================================================
    // CREATE PRODUCT
    // ==================================================

    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .insert({
        name,

        // IMPORTANT:
        // Send the cleaned category.
        category,

        subcategory:
          form.subcategory.trim() ||
          null,

        brand:
          form.brand.trim() ||
          null,

        model:
          form.model.trim() ||
          null,

        description:
          form.description.trim() ||
          null,

        specifications:
          form.specifications.trim() ||
          null,

        cash_price:
          cashPrice,

        stock_quantity:
          stockQuantity,

        availability:
          form.availability,

        featured:
          form.featured,

        lipa_mdogo_mdogo_available:
          form.lipaAvailable,

        deposit_amount:
          form.lipaAvailable
            ? depositAmount
            : null,

        daily_payment:
          form.lipaAvailable
            ? dailyPayment
            : null,

        payment_days:
          form.lipaAvailable
            ? paymentDays
            : null,

        total_payable:
          form.lipaAvailable
            ? calculatedTotal
            : null,
      })
      .select("id,name")
      .single();

    // ==================================================
    // PRODUCT DATABASE ERROR
    // ==================================================

    if (productError) {
      console.error(
        "SUPABASE PRODUCT ERROR:",
        productError
      );

      console.error(
        "CATEGORY THAT FAILED:",
        JSON.stringify(category)
      );

      const errorParts = [
        "Database error:",
        productError.message,

        productError.details
          ? `Details: ${productError.details}`
          : "",

        productError.hint
          ? `Hint: ${productError.hint}`
          : "",

        productError.code
          ? `Code: ${productError.code}`
          : "",
      ];

      throw new Error(
        errorParts
          .filter(Boolean)
          .join(" ")
      );
    }

    if (!product?.id) {
      throw new Error(
        "Product was not created because Supabase did not return a product ID."
      );
    }

    console.log(
      "PRODUCT CREATED SUCCESSFULLY:",
      product
    );

    // ==================================================
    // UPLOAD PRODUCT IMAGES
    // ==================================================

    for (
      let index = 0;
      index < images.length;
      index += 1
    ) {
      const file =
        images[index];

      const extension =
        file.name
          .split(".")
          .pop()
          ?.toLowerCase() ||
        "jpg";

      const fileName =
        `${crypto.randomUUID()}.${extension}`;

      const storagePath =
        `${product.id}/${fileName}`;

      console.log(
        `UPLOADING IMAGE ${index + 1}:`,
        storagePath
      );

      const {
        error: uploadError,
      } =
        await supabase.storage
          .from(
            "product-images"
          )
          .upload(
            storagePath,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            }
          );

      if (uploadError) {
        console.error(
          "SUPABASE STORAGE ERROR:",
          uploadError
        );

        throw new Error(
          `Image upload failed: ${uploadError.message}`
        );
      }

      // ==================================================
      // GET IMAGE PUBLIC URL
      // ==================================================

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from(
            "product-images"
          )
          .getPublicUrl(
            storagePath
          );

      const imageUrl =
        publicUrlData
          ?.publicUrl;

      if (!imageUrl) {
        throw new Error(
          "The image uploaded, but its public URL could not be generated."
        );
      }

      // ==================================================
      // SAVE IMAGE RECORD
      // ==================================================

      const {
        error: imageError,
      } =
        await supabase
          .from(
            "product_images"
          )
          .insert({
            product_id:
              product.id,

            image_url:
              imageUrl,

            display_order:
              index,
          });

      if (imageError) {
        console.error(
          "PRODUCT IMAGE DATABASE ERROR:",
          imageError
        );

        const imageErrorParts = [
          "Image record error:",
          imageError.message,

          imageError.details
            ? `Details: ${imageError.details}`
            : "",

          imageError.hint
            ? `Hint: ${imageError.hint}`
            : "",

          imageError.code
            ? `Code: ${imageError.code}`
            : "",
        ];

        throw new Error(
          imageErrorParts
            .filter(Boolean)
            .join(" ")
        );
      }
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    onError("");

    onMessage(
      `${product.name} was added successfully.`
    );

    setForm(
      initialForm
    );

    setImages([]);

    await onSaved();

  } catch (
    error: unknown
  ) {
    console.error(
      "ADD PRODUCT ERROR:",
      error
    );

    let errorMessage =
      "Unable to add the product.";

    if (
      error instanceof Error
    ) {
      errorMessage =
        error.message;

    } else if (
      typeof error ===
        "object" &&
      error !== null
    ) {
      const possibleError =
        error as {
          message?: string;
          details?: string;
          hint?: string;
          code?: string;
        };

      if (
        possibleError.message
      ) {
        errorMessage =
          possibleError.message;
      }

      if (
        possibleError.details
      ) {
        errorMessage +=
          ` Details: ${possibleError.details}`;
      }

      if (
        possibleError.hint
      ) {
        errorMessage +=
          ` Hint: ${possibleError.hint}`;
      }

      if (
        possibleError.code
      ) {
        errorMessage +=
          ` Code: ${possibleError.code}`;
      }

    } else if (
      typeof error ===
        "string"
    ) {
      errorMessage =
        error;
    }

    onError(
      errorMessage
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
      {/* PRODUCT INFORMATION */}

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
                  name: event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. 700W High-Efficiency Monocrystalline Solar Panel"
            />
          </label>

          <label className="text-sm font-bold">
            Category

            <select
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category: event.target.value,
                })
              }
              className={inputClass}
            >
              <option>
                Home Appliances
              </option>

              <option>
                Solar &amp; Backup Power
              </option>

              <option>
                Smart Electronics &amp; Gadgets
              </option>

              <option>
                Computing &amp; Office
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
                  subcategory: event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. Solar Panels"
            />
          </label>

          <label className="text-sm font-bold">
            Brand

            <input
              value={form.brand}
              onChange={(event) =>
                setForm({
                  ...form,
                  brand: event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. Smart Tech"
            />
          </label>

          <label className="text-sm font-bold">
            Model

            <input
              value={form.model}
              onChange={(event) =>
                setForm({
                  ...form,
                  model: event.target.value,
                })
              }
              className={inputClass}
              placeholder="e.g. SP-700W-MONO"
            />
          </label>

          <label className="text-sm font-bold">
            Cash Price (KSh)

            <input
              required
              min="0"
              step="1"
              type="number"
              value={form.cashPrice}
              onChange={(event) =>
                setForm({
                  ...form,
                  cashPrice: event.target.value,
                })
              }
              className={inputClass}
              placeholder="10000"
            />
          </label>

          <label className="text-sm font-bold">
            Stock Quantity

            <input
              required
              min="0"
              step="1"
              type="number"
              value={form.stockQuantity}
              onChange={(event) =>
                setForm({
                  ...form,
                  stockQuantity: event.target.value,
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
                  availability: event.target.value,
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

        {/* DESCRIPTION / SPECIFICATIONS */}

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label className="text-sm font-bold">
            Product Description

            <textarea
              rows={7}
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description: event.target.value,
                })
              }
              className={inputClass}
              placeholder="Describe the product..."
            />
          </label>

          <label className="text-sm font-bold">
            Specifications

            <textarea
              rows={7}
              value={form.specifications}
              onChange={(event) =>
                setForm({
                  ...form,
                  specifications: event.target.value,
                })
              }
              className={inputClass}
              placeholder={
                `Power Output: 700W
Cell Type: Monocrystalline
Suitable for: Off-grid & Hybrid Systems`
              }
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
                featured: event.target.checked,
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
            checked={form.lipaAvailable}
            onChange={(event) =>
              setForm({
                ...form,
                lipaAvailable: event.target.checked,
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
                step="1"
                type="number"
                value={form.depositAmount}
                onChange={(event) =>
                  setForm({
                    ...form,
                    depositAmount: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="2500"
              />
            </label>

            <label className="text-sm font-bold">
              Daily Payment (KSh)

              <input
                required
                min="1"
                step="1"
                type="number"
                value={form.dailyPayment}
                onChange={(event) =>
                  setForm({
                    ...form,
                    dailyPayment: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="50"
              />
            </label>

            <label className="text-sm font-bold">
              Number of Days

              <input
                required
                min="1"
                step="1"
                type="number"
                value={form.paymentDays}
                onChange={(event) =>
                  setForm({
                    ...form,
                    paymentDays: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="150"
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
                ).format(totalPayable)}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PRODUCT PHOTOS */}

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
                event.target.files ?? []
              )
            )
          }
                    className="mt-5 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
        />

        {images.length > 0 && (
          <div className="mt-4">
            <p className="font-bold text-[#0798ef]">
              {images.length} image
              {images.length !== 1 ? "s" : ""} selected
            </p>

            <div className="mt-3 space-y-2">
              {images.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
                >
                  {index === 0 ? "Primary: " : ""}
                  {file.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SUBMIT BUTTON */}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-[#0798ef] px-7 py-3.5 font-black text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#087bd0] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving Product..."
            : "Add Product"}
        </button>

        {saving && (
          <span className="text-sm font-medium text-slate-500">
            Please wait while the product is being saved...
          </span>
        )}
      </div>
    </form>
  );
}