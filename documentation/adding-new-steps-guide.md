# Adding New Steps to the XML Generator

This guide explains how to add new form steps to the SII XML Generator application. The application uses a modular architecture where each step consists of a schema definition, a component, and integration with the main stepper.

## Overview

The XML generator is built with the following structure:
- **Schemas**: Define validation rules and types (`lib/xml-generator/schemas.ts`)
- **Components**: Individual form components for each step (`components/xml-generator/`)
- **Stepper Configuration**: Maps steps to schemas (`lib/xml-generator/stepperize-config.ts`)
- **Main Page**: Orchestrates the entire flow (`app/xml-generator/page.tsx`)

## Step-by-Step Process

### 1. Define the Schema

First, add your validation schema to `lib/xml-generator/schemas.ts`:

```typescript
// Add to lib/xml-generator/schemas.ts

// Example: Activation & Contacts Schema
export const activationContactsSchema = z.object({
  activationMethods: z.array(z.enum(['01', '02', '03', '04', '05', '99'])).min(1, 'At least one activation method is required'),
  activationDescription: z.string().max(2000).optional(),
  phoneNumber: z.string().min(1, 'Phone number is required').max(15),
  vendorWebsite: z.string().url('Invalid URL').max(100).optional(),
  offerUrl: z.string().url('Invalid URL').max(100).optional(),
})

// Add the corresponding type export
export type ActivationContactsFormValues = z.infer<typeof activationContactsSchema>
```

**Schema Guidelines:**
- Use descriptive field names that match the SII specification
- Add proper validation rules (min/max length, required fields, etc.)
- Include helpful error messages
- Export both the schema and its TypeScript type

### 2. Create the Component

Create a new component file in `components/xml-generator/`:

```typescript
// components/xml-generator/ActivationContactsComponent.tsx

import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import type { ActivationContactsFormValues } from '@/lib/xml-generator/schemas'

export function ActivationContactsComponent() {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<ActivationContactsFormValues>()

  const activationMethods = watch('activationMethods') || []

  const handleActivationMethodChange = (method: string, checked: boolean) => {
    if (checked) {
      setValue('activationMethods', [...activationMethods, method])
    } else {
      setValue('activationMethods', activationMethods.filter(m => m !== method))
    }
  }

  return (
    <div className="space-y-6 text-start">
      {/* Activation Methods */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-primary">
          Activation Methods *
        </label>
        <div className="space-y-2">
          {[
            { value: '01', label: 'Web-only activation' },
            { value: '02', label: 'Any channel activation' },
            { value: '03', label: 'Point of sale' },
            { value: '04', label: 'Teleselling' },
            { value: '05', label: 'Agency' },
            { value: '99', label: 'Other' },
          ].map((method) => (
            <div key={method.value} className="flex items-center space-x-2">
              <Checkbox
                id={`activation-${method.value}`}
                checked={activationMethods.includes(method.value)}
                onCheckedChange={(checked) => 
                  handleActivationMethodChange(method.value, !!checked)
                }
              />
              <label 
                htmlFor={`activation-${method.value}`}
                className="text-sm font-medium"
              >
                {method.label}
              </label>
            </div>
          ))}
        </div>
        {errors.activationMethods && (
          <span className="text-sm text-destructive">
            {errors.activationMethods.message}
          </span>
        )}
      </div>

      {/* Description for "Other" */}
      {activationMethods.includes('99') && (
        <div className="space-y-2">
          <label
            htmlFor={register('activationDescription').name}
            className="block text-sm font-medium text-primary"
          >
            Activation Description *
          </label>
          <Textarea
            id={register('activationDescription').name}
            {...register('activationDescription')}
            placeholder="Describe the other activation method..."
            className="block w-full"
            rows={3}
          />
          {errors.activationDescription && (
            <span className="text-sm text-destructive">
              {errors.activationDescription.message}
            </span>
          )}
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Contact Information</h3>
        
        <div className="space-y-2">
          <label
            htmlFor={register('phoneNumber').name}
            className="block text-sm font-medium text-primary"
          >
            Phone Number *
          </label>
          <Input
            id={register('phoneNumber').name}
            {...register('phoneNumber')}
            placeholder="+39 123 456 7890"
            className="block w-full"
          />
          {errors.phoneNumber && (
            <span className="text-sm text-destructive">
              {errors.phoneNumber.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={register('vendorWebsite').name}
            className="block text-sm font-medium text-primary"
          >
            Vendor Website
          </label>
          <Input
            id={register('vendorWebsite').name}
            {...register('vendorWebsite')}
            placeholder="https://www.example.com"
            className="block w-full"
          />
          {errors.vendorWebsite && (
            <span className="text-sm text-destructive">
              {errors.vendorWebsite.message}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor={register('offerUrl').name}
            className="block text-sm font-medium text-primary"
          >
            Offer URL
          </label>
          <Input
            id={register('offerUrl').name}
            {...register('offerUrl')}
            placeholder="https://www.example.com/offers/special-offer"
            className="block w-full"
          />
          {errors.offerUrl && (
            <span className="text-sm text-destructive">
              {errors.offerUrl.message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Component Guidelines:**
- Use `useFormContext` to access form methods
- Follow consistent styling with existing components
- Include proper labels and error handling
- Use appropriate UI components from the design system
- Handle conditional fields (show/hide based on other field values)
- Mark required fields with asterisks (*)

### 3. Update the Component Index

Add your new component to `components/xml-generator/index.ts`:

```typescript
// components/xml-generator/index.ts

// Export all XML generator form components
export { BasicInfoComponent } from './BasicInfoComponent'
export { OfferDetailsComponent } from './OfferDetailsComponent'
export { ActivationContactsComponent } from './ActivationContactsComponent' // Add this line
export { PlaceholderComponent } from './PlaceholderComponent'
```

### 4. Update the Stepper Configuration

Update `lib/xml-generator/stepperize-config.ts` to use your new schema:

```typescript
// lib/xml-generator/stepperize-config.ts

import { defineStepper } from '@stepperize/react'
import {
  basicInfoSchema,
  offerDetailsSchema,
  activationContactsSchema, // Add this import
  // ... other schemas
} from './schemas'

export const xmlFormStepper = defineStepper(
  {
    id: 'basic-info',
    title: 'Basic Information',
    description: 'VAT Number and Offer Code',
    schema: basicInfoSchema,
  },
  {
    id: 'offer-details',
    title: 'Offer Details',
    description: 'Market type, client type, and offer configuration',
    schema: offerDetailsSchema,
  },
  {
    id: 'activation-contacts',
    title: 'Activation & Contacts',
    description: 'Activation methods and contact information',
    schema: activationContactsSchema, // Update this line
  },
  // ... other steps
)
```

### 5. Update the Main Page

Finally, update `app/xml-generator/page.tsx` to include your new component:

```typescript
// app/xml-generator/page.tsx

import { 
  BasicInfoComponent, 
  OfferDetailsComponent,
  ActivationContactsComponent, // Add this import
  PlaceholderComponent 
} from '@/components/xml-generator'

// In the stepper.switch section:
{stepper.switch({
  'basic-info': () => <BasicInfoComponent />,
  'offer-details': () => <OfferDetailsComponent />,
  'activation-contacts': () => <ActivationContactsComponent />, // Update this line
  'pricing-config': () => <PlaceholderComponent title="Pricing Configuration" />,
  // ... other steps
})}
```

## Best Practices

### 1. Field Naming Conventions
- Use camelCase for form field names
- Match SII specification field names where possible
- Use descriptive names that indicate the field's purpose

### 2. Validation Rules
- Always validate required fields
- Use appropriate data types (string, number, date, etc.)
- Set reasonable min/max limits based on SII requirements
- Provide clear, user-friendly error messages

### 3. Conditional Logic
- Use `watch()` to monitor field changes
- Show/hide fields based on other field values
- Update validation rules dynamically when needed

### 4. UI/UX Guidelines
- Group related fields together
- Use appropriate input types (text, select, checkbox, etc.)
- Include help text for complex fields
- Mark required fields clearly
- Provide consistent spacing and layout

### 5. Testing
After adding a new step, test the following:
- Form validation works correctly
- Data persists when navigating between steps
- URL updates properly
- Component renders without errors
- All conditional logic works as expected

## Common Patterns

### Multiple Selection Fields
```typescript
// For fields that allow multiple selections
const handleMultiSelect = (value: string, checked: boolean, fieldName: string) => {
  const currentValues = watch(fieldName) || []
  if (checked) {
    setValue(fieldName, [...currentValues, value])
  } else {
    setValue(fieldName, currentValues.filter(v => v !== value))
  }
}
```

### Conditional Required Fields
```typescript
// Schema with conditional validation
const schema = z.object({
  type: z.enum(['01', '02', '99']),
  description: z.string().optional(),
}).refine((data) => {
  if (data.type === '99' && !data.description) {
    return false
  }
  return true
}, {
  message: 'Description is required when type is "Other"',
  path: ['description'],
})
```

### Dynamic Field Arrays
```typescript
// For repeatable sections
const { fields, append, remove } = useFieldArray({
  control,
  name: 'items'
})
```

## Troubleshooting

### Common Issues

1. **Schema not updating**: Make sure to restart the development server after schema changes
2. **Component not rendering**: Check the import/export statements and stepper switch
3. **Validation not working**: Ensure the schema is properly associated with the step
4. **Data not persisting**: Verify that field names match between schema and component

### Debugging Tips

1. Use the debug panel at the bottom of the page to inspect form data
2. Check browser console for TypeScript errors
3. Use React DevTools to inspect component state
4. Test form validation by submitting with invalid data

## SII Specification Reference

When implementing new steps, always refer to the SII specification document:
- **File**: `documentation/functional-requirements-sii-xml.md`
- **Schema**: `documentation/xml-schema.xsd`

Each step should implement the corresponding section from the SII specification with proper field validation and formatting.

## Example: Complete Implementation

For a complete example, see the existing `BasicInfoComponent` and `OfferDetailsComponent` implementations, which demonstrate all the patterns described in this guide. 