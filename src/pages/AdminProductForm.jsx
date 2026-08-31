import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, Image as ImageIcon, Star } from 'lucide-react';

const CATEGORY_SPECS = {
  1: [ // Electronics
    { key: 'type', label: 'Type / Form Factor', placeholder: 'e.g. Over-Ear Wireless Headphones' },
    { key: 'connectivity', label: 'Connectivity', placeholder: 'e.g. Bluetooth 5.3 & 3.5mm' },
    { key: 'battery', label: 'Battery Life', placeholder: 'e.g. Up to 30 hours' },
    { key: 'weight', label: 'Weight', placeholder: 'e.g. 250 g' },
  ],
  2: [ // Fashion
    { key: 'material', label: 'Material', placeholder: 'e.g. Full-Grain Leather' },
    { key: 'color', label: 'Color', placeholder: 'e.g. Cognac Brown' },
    { key: 'size', label: 'Size / Fit', placeholder: 'e.g. Regular Fit / 20L Capacity' },
    { key: 'style', label: 'Style', placeholder: 'e.g. Minimalist Commuter' },
  ],
  3: [ // Home & Living
    { key: 'material', label: 'Material', placeholder: 'e.g. Solid Oak & Brass' },
    { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g. 45 x 45 x 50 cm' },
    { key: 'color', label: 'Color / Finish', placeholder: 'e.g. Natural Oak' },
    { key: 'style', label: 'Style', placeholder: 'e.g. Scandinavian Modern' },
  ],
  4: [ // Beauty
    { key: 'skinType', label: 'Skin Type', placeholder: 'e.g. All Skin Types / Sensitive' },
    { key: 'volume', label: 'Volume / Size', placeholder: 'e.g. 50 ml / 1.7 fl oz' },
    { key: 'keyIngredient', label: 'Key Ingredient', placeholder: 'e.g. Hyaluronic Acid 2%' },
    { key: 'formulation', label: 'Formulation', placeholder: 'e.g. Lightweight Gel-Cream' },
  ],
};

export default function AdminProductForm({
  isOpen,
  onClose,
  productToEdit = null,
  categories = [],
  onSave,
}) {
  const isEditing = Boolean(productToEdit);

  // Form State
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(1);
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [specifications, setSpecifications] = useState({});
  const [isActive, setIsActive] = useState(true);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Prefill or reset form on open / productToEdit change
  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategoryId(Number(productToEdit.categoryId) || 1);
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price !== undefined ? productToEdit.price.toString() : '');
      setStock(productToEdit.stock !== undefined ? productToEdit.stock.toString() : '0');
      setImageUrl(productToEdit.image || '');
      setSpecifications(productToEdit.specifications || {});
      setIsActive(productToEdit.isActive !== undefined ? productToEdit.isActive : true);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || 1);
      setDescription('');
      setPrice('');
      setStock('50');
      setImageUrl('');
      setSpecifications({});
      setIsActive(true);
    }
    setFormError('');
  }, [isOpen, productToEdit, categories]);

  if (!isOpen) return null;

  // Handle Specification Field Change
  const handleSpecChange = (key, value) => {
    setSpecifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Client validation
    if (!name.trim()) {
      setFormError('Please enter a product name.');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a product description.');
      return;
    }

    const numPrice = Number(price);
    if (price === '' || isNaN(numPrice) || numPrice < 0) {
      setFormError('Please enter a valid price (₹).');
      return;
    }

    const numStock = Number(stock);
    if (stock === '' || isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      setFormError('Please enter a valid non-negative integer stock.');
      return;
    }

    if (!imageUrl.trim() || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
      setFormError('Please enter a valid image URL (must start with http:// or https://).');
      return;
    }

    const payload = {
      name: name.trim(),
      categoryId: Number(categoryId),
      description: description.trim(),
      price: Math.round(numPrice),
      stock: Math.round(numStock),
      imageUrl: imageUrl.trim(),
      specifications,
      isActive: Boolean(isActive),
    };

    setIsSubmitting(true);
    try {
      const success = await onSave(payload);
      if (success !== false) {
        onClose();
      }
    } catch (err) {
      setFormError(err.message || 'Unable to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const specFields = CATEGORY_SPECS[categoryId] || [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] flex items-center justify-between bg-[#FAF8F4]">
          <div>
            <p className="text-[11px] font-semibold tracking-wider uppercase text-[#D86F5C]">
              {isEditing ? 'Catalog Management' : 'New Catalog Item'}
            </p>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#222222]">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-[#6B6B6B] hover:text-[#222222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-left flex-1">
          
          {formError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Read-Only Rating Badge if Editing */}
          {isEditing && (
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-amber-950">
                  Customer Rating: {productToEdit.rating ? Number(productToEdit.rating).toFixed(1) : 'No ratings yet'}
                </span>
              </div>
              <span className="text-[11px] text-[#6B6B6B]">
                (Derived from verified customer reviews)
              </span>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] pb-1 border-b border-black/[0.05]">
              Basic Information
            </h3>

            {/* Product Name */}
            <div>
              <label className="block text-xs font-medium text-[#222222] mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
              />
            </div>

            {/* Category & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#222222] mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    const newCatId = Number(e.target.value);
                    setCategoryId(newCatId);
                    setSpecifications({}); // Reset specifications to match new category
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#222222] mb-1">
                  Catalog Status
                </label>
                <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-black/10 bg-[#FAF8F4]/50 cursor-pointer text-xs font-medium text-[#222222]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D86F5C] focus:ring-[#D86F5C] border-black/20"
                  />
                  <span>Active (Visible to customers)</span>
                </label>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-[#222222] mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product summary and key highlights..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] pb-1 border-b border-black/[0.05]">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-[#222222] mb-1">
                  Price (₹ INR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#6B6B6B]">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 29990"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                  />
                </div>
                {isEditing && productToEdit.price !== undefined && (
                  <p className="text-[11px] text-[#6B6B6B] mt-1">
                    Current price: ₹{productToEdit.price.toLocaleString('en-IN')}. Changing price will append a price history entry.
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label className="block text-xs font-medium text-[#222222] mb-1">
                  Available Stock <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                />
                <p className="text-[11px] text-[#6B6B6B] mt-1">
                  Set to 0 to mark product as Out of Stock.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Media */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] pb-1 border-b border-black/[0.05]">
              Product Media
            </h3>

            <div>
              <label className="block text-xs font-medium text-[#222222] mb-1">
                Image URL (Public URL) <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                />
                {imageUrl && (
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 border border-black/10 shrink-0">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#6B6B6B] mt-1">
                Use a publicly accessible image URL (e.g. Unsplash).
              </p>
            </div>
          </div>

          {/* Section 4: Specifications */}
          {specFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] pb-1 border-b border-black/[0.05]">
                Specifications ({categories.find((c) => c.id === categoryId)?.name || 'Category'} Attributes)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {specFields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-xs font-medium text-[#222222] mb-1">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={specifications[field.key] || ''}
                      onChange={(e) => handleSpecChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 text-sm text-[#222222] bg-[#FAF8F4]/50 focus:outline-none focus:border-[#D86F5C] focus:bg-white transition"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-black/[0.06] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full border border-black/10 bg-white hover:bg-stone-50 text-[#222222] text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#222222] hover:bg-[#333333] text-white text-xs font-medium transition shadow-xs flex items-center gap-2 active:scale-95 disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? isEditing
                    ? 'Saving changes...'
                    : 'Creating product...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Product'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
