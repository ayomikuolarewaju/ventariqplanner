"use client";

import PurchaseButton from "@/components/PurchaseButton";

type Product = {
  sku: string;
  name: string;
  description: string;
  price?: number;
  features?: string[];
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="rounded-[11px] border border-[#D8D2C2] bg-white p-6.5">
      <div className="flex items-start justify-between">
        <h3 className="font-serif text-xl text-[#152238]">{product.name}</h3>
        {product.price != null && (
          <span className="font-serif text-2xl font-bold text-[#8C6423]">
            ${product.price}
          </span>
        )}
      </div>

      <p className="mt-3 text-[14px] text-[#5A6472]">{product.description}</p>

      {product.features && product.features.length > 0 && (
        <ul className="mt-4 space-y-2">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13.5px] text-[#2A3E5C]">
              <span className="mt-0.5 text-[#8C6423]">✓</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6">
        <PurchaseButton sku={product.sku} />
      </div>
    </div>
  );
}
