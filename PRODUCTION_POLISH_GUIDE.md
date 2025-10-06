# Production Polish Guide

This guide shows how to use the production-ready components that have been created for polish and UX improvements.

## Created Components

### 1. Loading States (`components/LoadingSpinner.tsx`)

**Components:**
- `LoadingSpinner` - Customizable spinner (sm, md, lg)
- `LoadingPage` - Full-page loading state
- `LoadingCard` - Skeleton loading card

**Usage:**
```tsx
import LoadingSpinner, { LoadingPage, LoadingCard } from '@/components/LoadingSpinner';

// In component
{loading && <LoadingPage />}
{loading && <LoadingSpinner size="lg" />}
{loading && <LoadingCard />}
```

### 2. Toast Notifications (`components/Toast.tsx`)

**Setup:**
Add `ToastProvider` to your layout (wrap entire app):
```tsx
import { ToastProvider } from '@/components/Toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
```

**Usage in Pages:**
```tsx
import { useToast } from '@/components/Toast';

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast('Asset created successfully!', 'success');
  };

  const handleError = () => {
    showToast('Failed to save changes', 'error');
  };

  const handleWarning = () => {
    showToast('This action cannot be undone', 'warning');
  };

  const handleInfo = () => {
    showToast('New version available', 'info');
  };
}
```

### 3. Confirmation Dialogs (`components/ConfirmDialog.tsx`)

**Usage:**
```tsx
import { useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    // Perform delete action
    await api.deleteAsset(id);
    showToast('Asset deleted', 'success');
  };

  return (
    <>
      <button onClick={handleDelete}>Delete</button>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Asset?"
        message="Are you sure you want to delete this asset? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
```

### 4. Empty States (`components/EmptyState.tsx`)

**Usage:**
```tsx
import EmptyState from '@/components/EmptyState';

// In your component when no data
{assets.length === 0 && (
  <EmptyState
    icon="📦"
    title="No assets found"
    description="Start by adding your first asset to the system."
    actionLabel="Add Asset"
    onAction={() => setIsFormOpen(true)}
  />
)}
```

### 5. Error Boundary (`components/ErrorBoundary.tsx`)

**Setup:**
Wrap error-prone sections or entire pages:
```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

export default function MyPage() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### 6. Form Components with Validation (`components/FormInput.tsx`)

**Components:**
- `FormInput` - Text/email/number inputs with validation
- `FormTextarea` - Textarea with validation
- `FormSelect` - Select dropdown with validation

**Usage:**
```tsx
import FormInput, { FormTextarea, FormSelect } from '@/components/FormInput';
import { validateForm, ValidationRules } from '@/lib/validation';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '', priority: '' });
  const [errors, setErrors] = useState({});

  const validationRules: ValidationRules = {
    name: { required: true, minLength: 3 },
    email: { required: true, email: true },
    priority: { required: true }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, validationRules);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit form
    showToast('Form submitted!', 'success');
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormInput
        label="Asset Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        error={errors.name}
        required
      />

      <FormInput
        type="email"
        label="Contact Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
        helperText="We'll never share your email"
        required
      />

      <FormSelect
        label="Priority"
        value={formData.priority}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        error={errors.priority}
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]}
        required
      />

      <FormTextarea
        label="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
      />

      <button type="submit">Submit</button>
    </form>
  );
}
```

### 7. Validation Utilities (`lib/validation.ts`)

**Functions:**
- `validateField(value, rules)` - Validate single field
- `validateForm(data, rules)` - Validate entire form
- `isFormValid(errors)` - Check if form is valid

**Validation Rules:**
- `required: boolean` - Field is required
- `minLength: number` - Minimum string length
- `maxLength: number` - Maximum string length
- `min: number` - Minimum numeric value
- `max: number` - Maximum numeric value
- `email: boolean` - Email validation
- `pattern: RegExp` - Custom regex pattern
- `custom: (value) => string | null` - Custom validation function

**Example:**
```tsx
import { validateForm, ValidationRules } from '@/lib/validation';

const rules: ValidationRules = {
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value) => {
      if (!/[A-Z]/.test(value)) return 'Must contain uppercase letter';
      if (!/[0-9]/.test(value)) return 'Must contain number';
      return null;
    }
  },
  age: {
    required: true,
    min: 18,
    max: 120
  }
};

const errors = validateForm(formData, rules);
```

## Complete Example: Polished Component

Here's a complete example combining all polish features:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import ErrorBoundary from '@/components/ErrorBoundary';
import FormInput from '@/components/FormInput';
import { validateForm } from '@/lib/validation';
import api from '@/lib/api';

export default function PolishedPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
      showToast('Data loaded successfully', 'success');
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(selectedItem.id);
      setData(data.filter(d => d.id !== selectedItem.id));
      showToast('Item deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm(formData, {
      name: { required: true, minLength: 3 },
      email: { required: true, email: true }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix form errors', 'warning');
      return;
    }

    try {
      await api.create(formData);
      showToast('Created successfully!', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to create', 'error');
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <ErrorBoundary>
      <div>
        <h1>My Polished Page</h1>

        {data.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No items yet"
            description="Get started by creating your first item"
            actionLabel="Create Item"
            onAction={() => {}}
          />
        ) : (
          <div>
            {data.map(item => (
              <div key={item.id}>
                {item.name}
                <button onClick={() => handleDelete(item)}>Delete</button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormInput
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />
          <FormInput
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />
          <button type="submit">Submit</button>
        </form>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Delete Item?"
          message="Are you sure? This cannot be undone."
          type="danger"
        />
      </div>
    </ErrorBoundary>
  );
}
```

## Next Steps

To apply these improvements to existing pages:

1. **Add ToastProvider** to `app/layout.tsx`
2. **Replace** `alert()` and `confirm()` with toast notifications and ConfirmDialog
3. **Replace** basic loading text with LoadingSpinner/LoadingPage
4. **Replace** basic empty states with EmptyState component
5. **Wrap** forms with ErrorBoundary
6. **Use** FormInput components for all form fields
7. **Add** validation using the validation utilities

This will make your app production-ready with:
- ✅ Professional loading states
- ✅ User-friendly error handling
- ✅ Form validation with helpful error messages
- ✅ Toast notifications for feedback
- ✅ Confirmation dialogs for destructive actions
- ✅ Polished empty states
- ✅ Error boundaries for crash protection
