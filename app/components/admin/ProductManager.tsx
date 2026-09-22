"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export type Product = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  brand: string | null;
  model: string | null;
  description: string | null;
  specifications: string | null;

  cash_price: number;

  stock_quantity: number;
  availability: string;

  featured: boolean;

  lipa_mdogo_mdogo_available: boolean;

  deposit_amount: number | null;
  daily_payment: number | null;
  payment_days: number | null;
  total_payable: number | null;

  created_at: string;
};

type Props = {
  products: Product[];

  loading: boolean;

  onChanged: () => Promise<void> | void;

  onMessage: (
    message: string
  ) => void;

  onError: (
    message: string
  ) => void;
};

export default function ProductManager({
  products,
  loading,
  onChanged,
  onMessage,
  onError,
}: Props) {
  const [editing, setEditing] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Home Appliances");
  const [editSubcategory, setEditSubcategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSpecifications, setEditSpecifications] = useState("");
  const [editCashPrice, setEditCashPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editAvailability, setEditAvailability] = useState("Available");
  const [editFeatured, setEditFeatured] = useState(false);
  const [editLipa, setEditLipa] = useState(false);
  const [editDeposit, setEditDeposit] = useState("");
  const [editDaily, setEditDaily] = useState("");
  const [editDays, setEditDays] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditName(product.name);
    setEditCategory(product.category);
    setEditSubcategory(product.subcategory ?? "");
    setEditBrand(product.brand ?? "");
    setEditModel(product.model ?? "");
    setEditDescription(product.description ?? "");
    setEditSpecifications(product.specifications ?? "");
    setEditCashPrice(String(product.cash_price));
    setEditStock(String(product.stock_quantity));
    setEditAvailability(product.availability);
    setEditFeatured(product.featured);
    setEditLipa(product.lipa_mdogo_mdogo_available);
    setEditDeposit(product.deposit_amount == null ? "" : String(product.deposit_amount));
    setEditDaily(product.daily_payment == null ? "" : String(product.daily_payment));
    setEditDays(product.payment_days == null ? "" : String(product.payment_days));
    onError("");
    onMessage("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editName.trim() || editCashPrice === "" || editStock === "") {
      onError("Product name, cash price and stock quantity are required.");
      return;
    }
    if (editLipa && (!editDeposit || !editDaily || !editDays)) {
      onError("Complete all Lipa Mdogo Mdogo payment fields.");
      return;
    }

    setSavingEdit(true);
    onError("");
    const total = editLipa
      ? Number(editDeposit) + Number(editDaily) * Number(editDays)
      : null;

    const { error } = await supabase
      .from("products")
      .update({
        name: editName.trim(),
        category: editCategory,
        subcategory: editSubcategory.trim() || null,
        brand: editBrand.trim() || null,
        model: editModel.trim() || null,
        description: editDescription.trim() || null,
        specifications: editSpecifications.trim() || null,
        cash_price: Number(editCashPrice),
        stock_quantity: Number(editStock),
        availability: editAvailability,
        featured: editFeatured,
        lipa_mdogo_mdogo_available: editLipa,
        deposit_amount: editLipa ? Number(editDeposit) : null,
        daily_payment: editLipa ? Number(editDaily) : null,
        payment_days: editLipa ? Number(editDays) : null,
        total_payable: total,
      })
      .eq("id", editing.id);

    setSavingEdit(false);
    if (error) {
      onError(error.message);
      return;
    }

    onMessage(`${editName.trim()} updated successfully.`);
    setEditing(null);
    await onChanged();
  };

  const money = (
    value: number | null
  ) => {
    if (value === null) {
      return "—";
    }

    return `KSh ${new Intl.NumberFormat(
      "en-KE"
    ).format(value)}`;
  };

  // -----------------------------------------
  // CHANGE PRODUCT AVAILABILITY
  // -----------------------------------------

  const updateAvailability = async (
    productId: string,
    availability: string
  ) => {
    onError("");
    onMessage("");

    const {
      error,
    } = await supabase
      .from("products")
      .update({
        availability,
      })
      .eq(
        "id",
        productId
      );

    if (error) {
      onError(
        error.message
      );

      return;
    }

    onMessage(
      "Product availability updated."
    );

    await onChanged();
  };

  // -----------------------------------------
  // FEATURE / UNFEATURE PRODUCT
  // -----------------------------------------

  const toggleFeatured = async (
    product: Product
  ) => {
    onError("");
    onMessage("");

    const {
      error,
    } = await supabase
      .from("products")
      .update({
        featured:
          !product.featured,
      })
      .eq(
        "id",
        product.id
      );

    if (error) {
      onError(
        error.message
      );

      return;
    }

    onMessage(
      product.featured
        ? `${product.name} removed from featured products.`
        : `${product.name} marked as featured.`
    );

    await onChanged();
  };

  // -----------------------------------------
  // DELETE PRODUCT
  // -----------------------------------------

  const deleteProduct = async (
    product: Product
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${product.name}"?\n\nThis action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    onError("");
    onMessage("");

    try {
      /*
       * Find image records first so that we can
       * remove the actual files from Supabase
       * Storage before deleting the product.
       */

      const {
        data: imageRecords,
        error: imageQueryError,
      } = await supabase
        .from(
          "product_images"
        )
        .select(
          "image_url"
        )
        .eq(
          "product_id",
          product.id
        );

      if (imageQueryError) {
        throw imageQueryError;
      }

      if (
        imageRecords &&
        imageRecords.length > 0
      ) {
        const storagePaths =
          imageRecords
            .map(
              (
                image
              ) => {
                const marker =
                  "/product-images/";

                const index =
                  image.image_url.indexOf(
                    marker
                  );

                if (
                  index === -1
                ) {
                  return null;
                }

                return decodeURIComponent(
                  image.image_url.slice(
                    index +
                      marker.length
                  )
                );
              }
            )
            .filter(
              (
                path
              ): path is string =>
                Boolean(
                  path
                )
            );

        if (
          storagePaths.length >
          0
        ) {
          const {
            error:
              storageError,
          } =
            await supabase.storage
              .from(
                "product-images"
              )
              .remove(
                storagePaths
              );

          if (
            storageError
          ) {
            console.warn(
              "Product deleted, but some stored images could not be removed:",
              storageError.message
            );
          }
        }
      }

      /*
       * product_images records are deleted
       * automatically because we configured
       * ON DELETE CASCADE.
       */

      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "products"
          )
          .delete()
          .eq(
            "id",
            product.id
          );

      if (
        deleteError
      ) {
        throw deleteError;
      }

      onMessage(
        `${product.name} was deleted.`
      );

      await onChanged();
    } catch (
      error
    ) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to delete the product."
      );
    }
  };

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#0798ef]" />

        <p className="mt-4 font-semibold text-slate-500">
          Loading products...
        </p>

      </div>
    );
  }

  // -----------------------------------------
  // EMPTY DATABASE
  // -----------------------------------------

  if (
    products.length === 0
  ) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

        <div className="text-5xl">
          🛍️
        </div>

        <h2 className="mt-4 text-xl font-black text-[#0b2947]">
          No Products Yet
        </h2>

        <p className="mt-2 text-slate-500">
          Add your first real
          Smart Tech product
          using the Add Product
          section.
        </p>

      </div>
    );
  }

  // -----------------------------------------
  // PRODUCT LIST
  // -----------------------------------------

  return (
    <div className="grid gap-4">

      {products.map(
        (
          product
        ) => (

          <article
            key={
              product.id
            }
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:shadow-md"
          >

            <div className="flex flex-col gap-5 xl:flex-row xl:items-center">

              {/* PRODUCT INFORMATION */}

              <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-[#0798ef]">

                    {
                      product.category
                    }

                  </span>


                  {product.featured && (

                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">

                      ★ Featured

                    </span>

                  )}


                  {product.lipa_mdogo_mdogo_available && (

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">

                      Lipa Mdogo Mdogo

                    </span>

                  )}

                </div>


                <h2 className="mt-3 text-xl font-black text-[#0b2947]">

                  {
                    product.name
                  }

                </h2>


                {(product.brand ||
                  product.model) && (

                  <p className="mt-1 text-sm text-slate-500">

                    {product.brand}

                    {product.brand &&
                      product.model
                      ? " • "
                      : ""}

                    {product.model}

                  </p>

                )}


                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">

                  <div>

                    <span className="text-slate-500">
                      Cash Price
                    </span>

                    <p className="font-black text-[#0b2947]">

                      {
                        money(
                          product.cash_price
                        )
                      }

                    </p>

                  </div>


                  <div>

                    <span className="text-slate-500">
                      Stock
                    </span>

                    <p className="font-black">

                      {
                        product.stock_quantity
                      }

                    </p>

                  </div>


                  {product.lipa_mdogo_mdogo_available && (

                    <>

                      <div>

                        <span className="text-slate-500">
                          Deposit
                        </span>

                        <p className="font-black">

                          {
                            money(
                              product.deposit_amount
                            )
                          }

                        </p>

                      </div>


                      <div>

                        <span className="text-slate-500">
                          Daily
                        </span>

                        <p className="font-black">

                          {
                            money(
                              product.daily_payment
                            )
                          }

                        </p>

                      </div>


                      <div>

                        <span className="text-slate-500">
                          Days
                        </span>

                        <p className="font-black">

                          {
                            product.payment_days ??
                            "—"
                          }

                        </p>

                      </div>


                      <div>

                        <span className="text-slate-500">
                          Total
                        </span>

                        <p className="font-black text-emerald-700">

                          {
                            money(
                              product.total_payable
                            )
                          }

                        </p>

                      </div>

                    </>

                  )}

                </div>

              </div>


              {/* ACTIONS */}

              <div className="flex flex-col gap-2 sm:flex-row xl:flex-col">

                <select
                  value={
                    product.availability
                  }
                  onChange={(
                    event
                  ) =>
                    updateAvailability(
                      product.id,
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold outline-none focus:border-[#0798ef]"
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


                <button
                  type="button"
                  onClick={() => openEdit(product)}
                  className="rounded-xl bg-[#0798ef] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#087bd0]"
                >
                  Edit Product
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleFeatured(
                      product
                    )
                  }
                  className="rounded-xl border border-amber-200 px-4 py-2.5 text-sm font-bold text-amber-700 transition hover:bg-amber-50"
                >

                  {product.featured
                    ? "Remove Featured"
                    : "Make Featured"}

                </button>


                <button
                  type="button"
                  onClick={() =>
                    deleteProduct(
                      product
                    )
                  }
                  className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                >

                  Delete Product

                </button>

              </div>

            </div>

          </article>

        )
      )}

      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/55 p-4">
          <div className="mx-auto my-6 max-w-4xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.25em] text-[#0798ef]">Product Management</p>
                <h2 className="mt-2 text-2xl font-black text-[#0b2947]">Edit Product</h2>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl border px-4 py-2 font-black">Close</button>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="text-sm font-bold">Product Name<input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-[#0798ef]" /></label>
              <label className="text-sm font-bold">Category<select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"><option>Home Appliances</option><option>Furniture</option><option>Solar Systems</option></select></label>
              <label className="text-sm font-bold">Subcategory<input value={editSubcategory} onChange={(e) => setEditSubcategory(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Brand<input value={editBrand} onChange={(e) => setEditBrand(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Model<input value={editModel} onChange={(e) => setEditModel(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Cash Price (KSh)<input type="number" min="0" value={editCashPrice} onChange={(e) => setEditCashPrice(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Stock Quantity<input type="number" min="0" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Availability<select value={editAvailability} onChange={(e) => setEditAvailability(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"><option>Available</option><option>Out of Stock</option><option>Coming Soon</option></select></label>
              <label className="text-sm font-bold">Description<textarea rows={4} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
              <label className="text-sm font-bold">Specifications<textarea rows={4} value={editSpecifications} onChange={(e) => setEditSpecifications(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            </div>

            <div className="mt-5 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)} /> Featured Product</label>
              <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={editLipa} onChange={(e) => setEditLipa(e.target.checked)} /> Lipa Mdogo Mdogo Available</label>
            </div>

            {editLipa && (
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm font-bold">Deposit<input type="number" min="0" value={editDeposit} onChange={(e) => setEditDeposit(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                <label className="text-sm font-bold">Daily Payment<input type="number" min="0" value={editDaily} onChange={(e) => setEditDaily(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                <label className="text-sm font-bold">Payment Days<input type="number" min="1" value={editDays} onChange={(e) => setEditDays(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
                <div><p className="text-sm font-bold">Total Payable</p><div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-800">{money(Number(editDeposit || 0) + Number(editDaily || 0) * Number(editDays || 0))}</div></div>
              </div>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" disabled={savingEdit} onClick={saveEdit} className="rounded-xl bg-[#0798ef] px-6 py-3 font-black text-white disabled:opacity-60">{savingEdit ? "Saving Changes..." : "Save Changes"}</button>
              <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-slate-300 px-6 py-3 font-black">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}