"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

type FormState = {
  name: string;
  description: string;
  price: string;
  category: string;
  quantity: string;
  unit: string;
  city: string;
  state: string;
  harvestDate: string;
  expiryDate: string;
  organic: boolean;
  images: string;
};

export default function EditProductPage() {
  const { user, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    price: "",
    category: "fruits",
    quantity: "",
    unit: "kg",
    city: "",
    state: "",
    harvestDate: "",
    expiryDate: "",
    organic: false,
    images: "",
  });

  // Auth gate
  useEffect(() => {
    if (
      !loading &&
      (!user || (user.role !== "farmer"))
    ) {
      toast.error("Only farmers can edit products");
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Load product
  useEffect(() => {
    const id = params.id as string | undefined;
    if (!id) return;
    (async () => {
      try {
        setLoadingProduct(true);
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to load product");
          router.replace("/products");
          return;
        }
        const p = data.product;
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: String(p.price ?? ""),
          category: p.category ?? "fruits",
          quantity: String(p.quantity ?? ""),
          unit: p.unit ?? "kg",
          city: p.farmLocation?.city ?? "",
          state: p.farmLocation?.state ?? "",
          harvestDate: p.harvestDate
            ? new Date(p.harvestDate).toISOString().slice(0, 10)
            : "",
          expiryDate: p.expiryDate
            ? new Date(p.expiryDate).toISOString().slice(0, 10)
            : "",
          organic: Boolean(p.organic),
          images: Array.isArray(p.images) ? p.images.join(", ") : "",
        });
      } catch (_err) {
        toast.error("Failed to load product");
        router.replace("/products");
      } finally {
        setLoadingProduct(false);
      }
    })();
  }, [params.id, router]);

  const onChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const images = form.images
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const body = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        farmLocation: { city: form.city, state: form.state },
        harvestDate: form.harvestDate ? new Date(form.harvestDate) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
        organic: form.organic,
        images,
      };

      const id = params.id as string;
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update product");
        setSubmitting(false);
        return;
      }

      toast.success("Product updated successfully");
      router.push(`/products/${data.product._id}`);
    } catch (_err) {
      toast.error("Failed to update product");
      setSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const id = params.id as string;
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }
      toast.success("Product deleted");
      router.push("/products");
    } catch (_err) {
      toast.error("Failed to delete product");
    }
  };

  if (loading || !user || loadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">
            Edit Product
          </h1>
          <button
            onClick={onDelete}
            className="inline-flex items-center px-4 py-2 rounded-md border border-red-600 text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              required
              className="mt-1 w-full border rounded-md px-3 py-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={onChange}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <input
                name="quantity"
                type="number"
                min="0"
                step="1"
                value={form.quantity}
                onChange={onChange}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={onChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {["kg", "lb", "piece", "bunch", "dozen", "liter", "gallon"].map(
                  (u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={onChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              >
                {[
                  "fruits",
                  "vegetables",
                  "dairy",
                  "meat",
                  "grains",
                  "herbs",
                ].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                name="state"
                value={form.state}
                onChange={onChange}
                required
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Harvest Date
              </label>
              <input
                name="harvestDate"
                type="date"
                value={form.harvestDate}
                onChange={onChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <input
                name="expiryDate"
                type="date"
                value={form.expiryDate}
                onChange={onChange}
                className="mt-1 w-full border rounded-md px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="organic"
                name="organic"
                type="checkbox"
                checked={form.organic}
                onChange={onChange}
                className="h-4 w-4"
              />
              <label htmlFor="organic" className="text-sm text-gray-700">
                Organic
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image URLs (comma-separated)
            </label>
            <input
              name="images"
              value={form.images}
              onChange={onChange}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
