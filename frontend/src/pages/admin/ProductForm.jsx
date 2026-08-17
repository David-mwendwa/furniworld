import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { ErrorState, Skeleton } from '../../components/ui/Feedback.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, Select, Textarea, Checkbox } from '../../components/ui/Field.jsx';
import { adminApi } from '../../api/index.js';
import { errorMessage } from '../../api/apiClient.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastProvider.jsx';
import { assetUrl } from '../../lib/images.js';
import { CATEGORIES, SUBCATEGORY_LABELS } from '../../constants/catalog.js';

const SUBCATEGORIES_BY_CATEGORY = {
  'living-room': ['coffee-tables', 'tv-stands', 'sofas', 'recliners', 'consoles'],
  'dining-room': ['dining-sets'],
  bedroom: ['beds', 'sofa-beds'],
  office: ['desks', 'office-chairs', 'boardroom-tables', 'reception-desks'],
};

const EMPTY = {
  name: '',
  description: '',
  shortDescription: '',
  category: 'living-room',
  subcategory: 'coffee-tables',
  price: '',
  compareAtPrice: '',
  stock: '',
  lowStockThreshold: 3,
  status: 'active',
  featured: false,
  tags: '',
  images: [],
  attributes: {
    material: '',
    colour: '',
    dimensions: { width: '', depth: '', height: '', unit: 'cm' },
    seats: '',
    weightKg: '',
    warrantyMonths: '',
    assemblyRequired: false,
  },
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const existing = useFetch(
    useCallback(() => adminApi.product(id), [id]),
    [id],
    { skip: !isEdit }
  );

  useEffect(() => {
    const product = existing.data?.product;
    if (!product) return;

    setForm({
      ...EMPTY,
      ...product,
      compareAtPrice: product.compareAtPrice ?? '',
      shortDescription: product.shortDescription ?? '',
      tags: (product.tags ?? []).join(', '),
      attributes: {
        ...EMPTY.attributes,
        ...product.attributes,
        dimensions: {
          ...EMPTY.attributes.dimensions,
          ...product.attributes?.dimensions,
        },
      },
    });
  }, [existing.data]);

  const set = (field) => (event) =>
    setForm((current) => ({
      ...current,
      [field]:
        event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    }));

  const setAttr = (field) => (event) =>
    setForm((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        [field]:
          event.target.type === 'checkbox'
            ? event.target.checked
            : event.target.value,
      },
    }));

  const setDim = (field) => (event) =>
    setForm((current) => ({
      ...current,
      attributes: {
        ...current.attributes,
        dimensions: { ...current.attributes.dimensions, [field]: event.target.value },
      },
    }));

  const onCategoryChange = (event) => {
    const category = event.target.value;
    setForm((current) => ({
      ...current,
      category,
      // Keep the pair valid: a subcategory from the old room would be rejected.
      subcategory: SUBCATEGORIES_BY_CATEGORY[category][0],
    }));
  };

  const upload = async (event) => {
    const files = [...event.target.files];
    if (!files.length) return;

    setUploading(true);
    try {
      const payload = new FormData();
      files.forEach((file) => payload.append('images', file));
      const { data } = await adminApi.uploadImages(payload);
      setForm((current) => ({
        ...current,
        images: [...current.images, ...data.images].slice(0, 8),
      }));
      toast.success(`${data.images.length} image(s) uploaded`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const removeImage = (index) =>
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, n) => n !== index),
    }));

  const submit = async (event) => {
    event.preventDefault();

    if (!form.images.length) {
      toast.error('Add at least one image');
      return;
    }

    const numeric = (value) => (value === '' ? undefined : Number(value));

    const payload = {
      name: form.name,
      description: form.description,
      shortDescription: form.shortDescription || undefined,
      category: form.category,
      subcategory: form.subcategory,
      price: Number(form.price),
      compareAtPrice: numeric(form.compareAtPrice),
      stock: Number(form.stock),
      lowStockThreshold: Number(form.lowStockThreshold),
      status: form.status,
      featured: form.featured,
      tags: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      images: form.images,
      attributes: {
        material: form.attributes.material || undefined,
        colour: form.attributes.colour || undefined,
        dimensions: {
          width: numeric(form.attributes.dimensions.width),
          depth: numeric(form.attributes.dimensions.depth),
          height: numeric(form.attributes.dimensions.height),
          unit: form.attributes.dimensions.unit,
        },
        seats: numeric(form.attributes.seats),
        weightKg: numeric(form.attributes.weightKg),
        warrantyMonths: numeric(form.attributes.warrantyMonths),
        assemblyRequired: form.attributes.assemblyRequired,
      },
    };

    setSaving(true);
    try {
      if (isEdit) {
        await adminApi.updateProduct(id, payload);
        toast.success('Product saved');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && existing.loading) return <Skeleton className="h-96 w-full" />;
  if (isEdit && existing.error)
    return <ErrorState message={existing.error} onRetry={existing.refetch} />;

  return (
    <div className="space-y-8">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-dark-500 hover:text-primary-800">
        <ArrowLeft className="h-3.5 w-3.5" />
        All products
      </Link>

      <h2 className="text-2xl">{isEdit ? 'Edit product' : 'New product'}</h2>

      <form onSubmit={submit} className="max-w-3xl space-y-10">
        <section className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Basics
          </h3>
          <Input label="Name" required value={form.name} onChange={set('name')} />
          <Input
            label="Short description"
            value={form.shortDescription}
            onChange={set('shortDescription')}
            maxLength={200}
            hint="One line, shown under the title on the product page"
          />
          <Textarea
            label="Description"
            required
            rows={6}
            minLength={40}
            value={form.description}
            onChange={set('description')}
            hint="At least 40 characters"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Room"
              required
              value={form.category}
              onChange={onCategoryChange}
              options={CATEGORIES.map((c) => ({ value: c.slug, label: c.label }))}
            />
            <Select
              label="Type"
              required
              value={form.subcategory}
              onChange={set('subcategory')}
              options={SUBCATEGORIES_BY_CATEGORY[form.category].map((slug) => ({
                value: slug,
                label: SUBCATEGORY_LABELS[slug],
              }))}
            />
          </div>
        </section>

        <section className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Pricing and stock
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Price (KES)"
              type="number"
              required
              min={0}
              value={form.price}
              onChange={set('price')}
            />
            <Input
              label="Compare-at price (KES)"
              type="number"
              min={0}
              value={form.compareAtPrice}
              onChange={set('compareAtPrice')}
              hint="Must be higher than the price. Leave blank if not on sale."
            />
            <Input
              label="Stock"
              type="number"
              required
              min={0}
              value={form.stock}
              onChange={set('stock')}
            />
            <Input
              label="Low stock threshold"
              type="number"
              min={0}
              value={form.lowStockThreshold}
              onChange={set('lowStockThreshold')}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={set('status')}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
            <Input
              label="Tags"
              value={form.tags}
              onChange={set('tags')}
              placeholder="festive-sale, marble"
              hint="Comma separated"
            />
          </div>
          <Checkbox
            label="Feature on the home page"
            checked={form.featured}
            onChange={set('featured')}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Images
          </h3>

          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {form.images.map((image, index) => (
                <div key={image.url + index} className="relative">
                  <img
                    src={assetUrl(image.url)}
                    alt=""
                    className="h-24 w-20 object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute inset-x-0 bottom-0 bg-primary-900/85 py-0.5 text-center text-[0.6rem] uppercase tracking-wider text-cream">
                      Main
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label="Remove image"
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger-600 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="inline-flex cursor-pointer items-center gap-2 border border-dashed border-dark-300 px-5 py-3 text-sm text-dark-600 transition-colors hover:border-primary-400 hover:text-primary-800">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading…' : 'Upload images'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              onChange={upload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-xs text-dark-500">
            JPEG, PNG, WEBP or AVIF, up to 5MB each. The first image is the one
            shown in the shop grid.
          </p>
        </section>

        <section className="space-y-5">
          <h3 className="text-xs uppercase tracking-[0.14em] text-dark-500">
            Specification
          </h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Material"
              value={form.attributes.material}
              onChange={setAttr('material')}
            />
            <Input
              label="Colour"
              value={form.attributes.colour}
              onChange={setAttr('colour')}
            />
            <Input
              label="Seats"
              type="number"
              min={0}
              value={form.attributes.seats}
              onChange={setAttr('seats')}
            />
            <Input
              label="Weight (kg)"
              type="number"
              min={0}
              value={form.attributes.weightKg}
              onChange={setAttr('weightKg')}
            />
            <Input
              label="Warranty (months)"
              type="number"
              min={0}
              value={form.attributes.warrantyMonths}
              onChange={setAttr('warrantyMonths')}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <Input
              label="Width"
              type="number"
              min={0}
              value={form.attributes.dimensions.width}
              onChange={setDim('width')}
            />
            <Input
              label="Depth"
              type="number"
              min={0}
              value={form.attributes.dimensions.depth}
              onChange={setDim('depth')}
            />
            <Input
              label="Height"
              type="number"
              min={0}
              value={form.attributes.dimensions.height}
              onChange={setDim('height')}
            />
            <Select
              label="Unit"
              value={form.attributes.dimensions.unit}
              onChange={setDim('unit')}
              options={[
                { value: 'cm', label: 'cm' },
                { value: 'mm', label: 'mm' },
                { value: 'm', label: 'm' },
              ]}
            />
          </div>

          <Checkbox
            label="Assembly required"
            checked={form.attributes.assemblyRequired}
            onChange={setAttr('assemblyRequired')}
          />
        </section>

        <div className="flex gap-4 border-t border-dark-200 pt-6">
          <Button type="submit" size="lg" loading={saving}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="lg"
            onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
