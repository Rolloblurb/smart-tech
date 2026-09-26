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


export type ProductVariant = {
  id: string;
  product_id: string;
  variant_name: string;
  cash_price: number;
  stock_quantity: number;
  availability: string;
  lipa_mdogo_mdogo_available: boolean;
  deposit_amount: number | null;
  daily_payment: number | null;
  payment_days: number | null;
  total_payable: number | null;
  display_order: number;
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
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [savingVariantId, setSavingVariantId] = useState<string | null>(null);
  const [newVariant, setNewVariant] = useState({
    variant_name: "",
    cash_price: "",
    stock_quantity: "1",
    availability: "Available",
    lipa_mdogo_mdogo_available: false,
    deposit_amount: "",
    daily_payment: "",
    payment_days: "",
  });

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

  const loadVariants = async (product: Product) => {
    setVariantProduct(product);
    setVariantsLoading(true);
    onError("");
    onMessage("");

    const { data, error } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", product.id)
      .order("display_order", { ascending: true });

    setVariantsLoading(false);

    if (error) {
      onError(error.message);
      return;
    }

    setVariants((data ?? []) as ProductVariant[]);
  };

  const saveVariant = async (variant: ProductVariant) => {
    setSavingVariantId(variant.id);
    onError("");
    onMessage("");

    const total = variant.lipa_mdogo_mdogo_available &&
      variant.deposit_amount !== null &&
      variant.daily_payment !== null &&
      variant.payment_days !== null
        ? Number(variant.deposit_amount) +
          Number(variant.daily_payment) * Number(variant.payment_days)
        : null;

    const { error } = await supabase
      .from("product_variants")
      .update({
        variant_name: variant.variant_name.trim(),
        cash_price: Number(variant.cash_price),
        stock_quantity: variant.availability === "Sold" ? 0 : Number(variant.stock_quantity),
        availability: variant.availability,
        lipa_mdogo_mdogo_available: variant.lipa_mdogo_mdogo_available,
        deposit_amount: variant.lipa_mdogo_mdogo_available ? variant.deposit_amount : null,
        daily_payment: variant.lipa_mdogo_mdogo_available ? variant.daily_payment : null,
        payment_days: variant.lipa_mdogo_mdogo_available ? variant.payment_days : null,
        total_payable: variant.lipa_mdogo_mdogo_available ? total : null,
      })
      .eq("id", variant.id);

    setSavingVariantId(null);

    if (error) {
      onError(error.message);
      return;
    }

    onMessage(`${variant.variant_name} updated successfully.`);
    if (variantProduct) await loadVariants(variantProduct);
    await onChanged();
  };

  const deleteVariant = async (variant: ProductVariant) => {
    if (!window.confirm(`Delete variant "${variant.variant_name}"?`)) return;

    const { error } = await supabase
      .from("product_variants")
      .delete()
      .eq("id", variant.id);

    if (error) {
      onError(error.message);
      return;
    }

    onMessage(`${variant.variant_name} variant deleted.`);
    if (variantProduct) await loadVariants(variantProduct);
    await onChanged();
  };

  const addNewVariant = async () => {
    if (!variantProduct) return;
    if (!newVariant.variant_name.trim() || !newVariant.cash_price) {
      onError("Variant name and cash price are required.");
      return;
    }

    const deposit = newVariant.lipa_mdogo_mdogo_available ? Number(newVariant.deposit_amount) : null;
    const daily = newVariant.lipa_mdogo_mdogo_available ? Number(newVariant.daily_payment) : null;
    const days = newVariant.lipa_mdogo_mdogo_available ? Number(newVariant.payment_days) : null;

    if (newVariant.lipa_mdogo_mdogo_available &&
      (!newVariant.deposit_amount || !newVariant.daily_payment || !newVariant.payment_days)) {
      onError("Complete all Lipa Mdogo Mdogo fields for the new variant.");
      return;
    }

    const { error } = await supabase
      .from("product_variants")
      .insert({
        product_id: variantProduct.id,
        variant_name: newVariant.variant_name.trim(),
        cash_price: Number(newVariant.cash_price),
        stock_quantity: newVariant.availability === "Sold" ? 0 : Number(newVariant.stock_quantity),
        availability: newVariant.availability,
        lipa_mdogo_mdogo_available: newVariant.lipa_mdogo_mdogo_available,
        deposit_amount: deposit,
        daily_payment: daily,
        payment_days: days,
        total_payable: newVariant.lipa_mdogo_mdogo_available && deposit !== null && daily !== null && days !== null
          ? deposit + daily * days : null,
        display_order: variants.length,
      });

    if (error) {
      onError(error.message);
      return;
    }

    setNewVariant({
      variant_name: "", cash_price: "", stock_quantity: "1",
      availability: "Available", lipa_mdogo_mdogo_available: false,
      deposit_amount: "", daily_payment: "", payment_days: "",
    });
    onMessage("New variant added.");
    await loadVariants(variantProduct);
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

    const product = products.find(
      (item) => item.id === productId
    );

    const updates: {
      availability: string;
      stock_quantity?: number;
    } = {
      availability,
    };

    if (availability === "Sold") {
      updates.stock_quantity = 0;
    } else if (
      availability === "Available" &&
      product?.availability === "Sold" &&
      product.stock_quantity === 0
    ) {
      updates.stock_quantity = 1;
    }

    const {
      error,
    } = await supabase
      .from("products")
      .update(updates)
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


                  {product.availability === "Sold" && (
                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-700">
                      SOLD
                    </span>
                  )}


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

                  <option>
                    Sold
                  </option>

                </select>


                <button
                  type="button"
                  onClick={() => loadVariants(product)}
                  className="rounded-xl border border-sky-200 px-4 py-2.5 text-sm font-black text-[#0798ef] transition hover:bg-sky-50"
                >
                  Manage Variants
                </button>

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

      {variantProduct && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/55 p-4">
          <div className="mx-auto my-6 max-w-5xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[.25em] text-[#0798ef]">Variant Management</p>
                <h2 className="mt-2 text-2xl font-black text-[#0b2947]">{variantProduct.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Manage sizes, prices, stock, availability and Lipa Mdogo Mdogo plans.</p>
              </div>
              <button type="button" onClick={() => setVariantProduct(null)} className="rounded-xl border px-4 py-2 font-black">Close</button>
            </div>

            {variantsLoading ? (
              <p className="mt-8 text-center font-bold text-slate-500">Loading variants...</p>
            ) : (
              <div className="mt-6 space-y-5">
                {variants.length === 0 && (
                  <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-slate-500">
                    This product does not have variants yet. Add one below if needed.
                  </div>
                )}

                {variants.map((variant, index) => (
                  <div key={variant.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-black text-[#0b2947]">Variant {index + 1}</h3>
                      <button type="button" onClick={() => deleteVariant(variant)} className="text-sm font-black text-red-600">Delete Variant</button>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <label className="text-sm font-bold">Size / Option
                        <input value={variant.variant_name} onChange={e => setVariants(current => current.map(v => v.id === variant.id ? {...v,variant_name:e.target.value}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                      <label className="text-sm font-bold">Cash Price
                        <input type="number" min="0" value={variant.cash_price} onChange={e => setVariants(current => current.map(v => v.id === variant.id ? {...v,cash_price:Number(e.target.value)}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                      <label className="text-sm font-bold">Stock
                        <input type="number" min="0" value={variant.stock_quantity} onChange={e => setVariants(current => current.map(v => v.id === variant.id ? {...v,stock_quantity:Number(e.target.value)}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                      <label className="text-sm font-bold">Availability
                        <select value={variant.availability} onChange={e => setVariants(current => current.map(v => v.id === variant.id ? {...v,availability:e.target.value}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3">
                          <option>Available</option><option>Out of Stock</option><option>Coming Soon</option><option>Sold</option>
                        </select></label>
                    </div>
                    <label className="mt-4 flex items-center gap-2 font-bold">
                      <input type="checkbox" checked={variant.lipa_mdogo_mdogo_available}
                        onChange={e => setVariants(current => current.map(v => v.id === variant.id ? {...v,lipa_mdogo_mdogo_available:e.target.checked}:v))}/>
                      Lipa Mdogo Mdogo Available
                    </label>
                    {variant.lipa_mdogo_mdogo_available && (
                      <div className="mt-4 grid gap-4 md:grid-cols-4">
                        <label className="text-sm font-bold">Deposit<input type="number" min="0" value={variant.deposit_amount ?? ""}
                          onChange={e=>setVariants(current=>current.map(v=>v.id===variant.id?{...v,deposit_amount:e.target.value===""?null:Number(e.target.value)}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                        <label className="text-sm font-bold">Daily Payment<input type="number" min="1" value={variant.daily_payment ?? ""}
                          onChange={e=>setVariants(current=>current.map(v=>v.id===variant.id?{...v,daily_payment:e.target.value===""?null:Number(e.target.value)}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                        <label className="text-sm font-bold">Days<input type="number" min="1" value={variant.payment_days ?? ""}
                          onChange={e=>setVariants(current=>current.map(v=>v.id===variant.id?{...v,payment_days:e.target.value===""?null:Number(e.target.value)}:v))}
                          className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                        <div><p className="text-sm font-bold">Total</p><div className="mt-2 rounded-xl bg-emerald-50 px-4 py-3 font-black text-emerald-800">
                          {money(variant.deposit_amount !== null && variant.daily_payment !== null && variant.payment_days !== null
                            ? Number(variant.deposit_amount)+Number(variant.daily_payment)*Number(variant.payment_days):null)}
                        </div></div>
                      </div>
                    )}
                    <button type="button" disabled={savingVariantId===variant.id} onClick={()=>saveVariant(variant)}
                      className="mt-4 rounded-xl bg-[#0798ef] px-5 py-2.5 font-black text-white disabled:opacity-60">
                      {savingVariantId===variant.id ? "Saving..." : "Save Variant"}
                    </button>
                  </div>
                ))}

                <div className="rounded-2xl border-2 border-dashed border-sky-200 p-5">
                  <h3 className="font-black text-[#0b2947]">Add Another Variant</h3>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="text-sm font-bold">Size / Option<input value={newVariant.variant_name} onChange={e=>setNewVariant({...newVariant,variant_name:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                    <label className="text-sm font-bold">Cash Price<input type="number" min="0" value={newVariant.cash_price} onChange={e=>setNewVariant({...newVariant,cash_price:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                    <label className="text-sm font-bold">Stock<input type="number" min="0" value={newVariant.stock_quantity} onChange={e=>setNewVariant({...newVariant,stock_quantity:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                    <label className="text-sm font-bold">Availability<select value={newVariant.availability} onChange={e=>setNewVariant({...newVariant,availability:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"><option>Available</option><option>Out of Stock</option><option>Coming Soon</option><option>Sold</option></select></label>
                  </div>
                  <label className="mt-4 flex items-center gap-2 font-bold"><input type="checkbox" checked={newVariant.lipa_mdogo_mdogo_available} onChange={e=>setNewVariant({...newVariant,lipa_mdogo_mdogo_available:e.target.checked})}/> Lipa Mdogo Mdogo Available</label>
                  {newVariant.lipa_mdogo_mdogo_available && (
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <label className="text-sm font-bold">Deposit<input type="number" min="0" value={newVariant.deposit_amount} onChange={e=>setNewVariant({...newVariant,deposit_amount:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                      <label className="text-sm font-bold">Daily Payment<input type="number" min="1" value={newVariant.daily_payment} onChange={e=>setNewVariant({...newVariant,daily_payment:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                      <label className="text-sm font-bold">Days<input type="number" min="1" value={newVariant.payment_days} onChange={e=>setNewVariant({...newVariant,payment_days:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3"/></label>
                    </div>
                  )}
                  <button type="button" onClick={addNewVariant} className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 font-black text-white">+ Add Variant</button>
                </div>
              </div>
            )}
          </div>
        </div>
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
              <label className="text-sm font-bold">Availability<select value={editAvailability} onChange={(e) => setEditAvailability(e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3"><option>Available</option><option>Out of Stock</option><option>Coming Soon</option><option>Sold</option></select></label>
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
