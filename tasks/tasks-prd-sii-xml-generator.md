## Relevant Files

- `app/sii-wizard/page.tsx` - Main wizard page component that orchestrates the entire multi-step flow
- `app/sii-wizard/page.test.tsx` - Unit tests for the wizard page component
- `components/sii-wizard/wizard-provider.tsx` - React Context provider for wizard state management
- `components/sii-wizard/wizard-stepper.tsx` - Stepper navigation component using Stepperize library
- `components/sii-wizard/steps/*.tsx` - Individual step components (18 files, one per wizard step)
- `lib/sii/validation.ts` - Validation rules for all SII fields following specification constraints
- `lib/sii/validation.test.ts` - Unit tests for validation rules
- `lib/sii/xml-generator.ts` - XML generation utility that maps form state to valid SII XML
- `lib/sii/xml-generator.test.ts` - Unit tests for XML generation including XSD validation
- `lib/sii/types.ts` - TypeScript types for all SII data structures
- `lib/sii/constants.ts` - Constants for enumerations and field mappings
- `hooks/use-sii-wizard.ts` - Custom hook for managing wizard state with NuQS URL persistence

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Set up project infrastructure and core wizard architecture
  - [ ] 1.1 Install required dependencies (Stepperize, NuQS, xsd-schema-validator WASM, xml-js or similar XML library)
  - [ ] 1.2 Create the main wizard page at `app/sii-wizard/page.tsx` with basic layout and structure
  - [ ] 1.3 Implement `wizard-provider.tsx` with React Context for centralized wizard state management
  - [ ] 1.4 Build `wizard-stepper.tsx` component using Stepperize library with progress indicator and navigation
  - [ ] 1.5 Configure NuQS for URL-based state persistence and implement shareable URL functionality
  - [ ] 1.6 Set up the base layout with breadcrumb navigation and minimal styling using existing UI components

- [ ] 2.0 Implement form validation system and SII data types
  - [ ] 2.1 Create `lib/sii/types.ts` with TypeScript interfaces for all 18 SII sections and their fields
  - [ ] 2.2 Define `lib/sii/constants.ts` with all enumerated values, field codes, and validation constraints
  - [ ] 2.3 Build `lib/sii/validation.ts` with validation functions for alphanumeric, numeric, date, and custom format validations
  - [ ] 2.4 Implement conditional validation logic (e.g., fields required only when other fields have specific values)
  - [ ] 2.5 Create error message system with clear, user-friendly validation feedback for each field type
  - [ ] 2.6 Build custom hook `use-sii-wizard.ts` that integrates form state, validation, and URL persistence

- [ ] 3.0 Build wizard step components for all 18 SII sections
  - [ ] 3.1 Create Step 1 component (Identification) with PIVA_UTENTE and COD_OFFERTA fields
  - [ ] 3.2 Create Step 2 component (Offer Details) with market type, client type, offer name, and other required fields
  - [ ] 3.3 Create Step 3 component (Activation Methods) with repeatable activation method entries
  - [ ] 3.4 Create Step 4 component (Contact Information) with phone and URL fields
  - [ ] 3.5 Create Step 5 component (Energy Price References) with conditional rendering based on TIPO_OFFERTA
  - [ ] 3.6 Create Step 6 component (Offer Validity) with date/time picker components
  - [ ] 3.7 Create Step 7 component (Offer Characteristics) with conditional fields for FLAT offers
  - [ ] 3.8 Create Step 8 component (Dual Offer) with conditional rendering for dual fuel offers
  - [ ] 3.9 Create Step 9 component (Payment Methods) with repeatable payment method entries
  - [ ] 3.10 Create Step 10 component (Regulated Components) with multi-select for component codes
  - [ ] 3.11 Create Step 11 component (Price Type) with time band configuration for electricity
  - [ ] 3.12 Create Step 12 component (Weekly Time Bands) with complex band schedule input
  - [ ] 3.13 Create Step 13 component (Dispatching) with repeatable dispatching entries for electricity
  - [ ] 3.14 Create Step 14 component (Company Components) with nested price intervals and validity periods
  - [ ] 3.15 Create Step 15 component (Contractual Conditions) with repeatable condition entries
  - [ ] 3.16 Create Step 16 component (Offer Zones) with geographical selection interface
  - [ ] 3.17 Create Step 17 component (Discounts) with complex nested discount structures
  - [ ] 3.18 Create Step 18 component (Additional Services) with repeatable service entries

- [ ] 4.0 Create XML generation and preview functionality
  - [ ] 4.1 Implement `lib/sii/xml-generator.ts` that maps form state to proper XML structure
  - [ ] 4.2 Create XML preview component with syntax highlighting and real-time updates
  - [ ] 4.3 Implement download functionality with proper filename format `<PIVA_UTENTE>_<AZIONE>_<DESCRIZIONE>.XML`
  - [ ] 4.4 Integrate xsd-schema-validator WASM for client-side XSD validation
  - [ ] 4.5 Add pre-download validation check to ensure 100% XSD compliance
  - [ ] 4.6 Create error display for any XML generation or validation issues

- [ ] 5.0 Implement testing suite and finalize deployment readiness
  - [ ] 5.1 Write unit tests for all validation functions covering edge cases and boundary values
  - [ ] 5.2 Create unit tests for XML generator with sample data for each offer type
  - [ ] 5.3 Implement integration test that completes entire wizard flow and validates output
  - [ ] 5.4 Add accessibility testing for keyboard navigation and screen reader compatibility
  - [ ] 5.5 Create performance tests to ensure wizard completion under 5 minutes
  - [ ] 5.6 Document any deployment considerations and ensure all dependencies are production-ready 